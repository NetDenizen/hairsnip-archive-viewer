"use strict";

function newIdRecord(keys, values) {
	var output = {};
	output.keys = [];
	output.values = [];
	output.lookup = {};
	output.AllValues = function() {
		var output = new Set();
		var values = this.values;
		var valuesLength = values.length;
		var idx = undefined;
		for(idx = 0; idx < valuesLength; ++idx) {
			var iter = values[idx].values();
			while(true) {
				var next = iter.next();
				if(next.done) {
					break;
				}
				output.add(next.value);
			}
		}
		return Array.from(output);
	};
	output.empty = function() {
		var output = true;
		if(this.keys.length > 0) {
			output = false;
		}
		return output;
	};
	output.ExtendRaw = function(keys, values) {
		var keysLength = keys.length;
		var idx = 0;
		for(idx = 0; idx < keysLength; ++idx) {
			var k = keys[idx];
			if( !this.lookup.hasOwnProperty(k) ) {
				var v = new Set(values[idx]);
				this.keys.push(k);
				this.values.push(v);
				this.lookup[k] = v;
			} else {
				var v = values[idx];
				var found = this.lookup[k];
				var vLength = v.length;
				var vIdx = undefined;
				for(vIdx = 0; vIdx < vLength; ++vIdx) {
					found.add(v[vIdx]);
				}
			}
		}
	};
	output.extend = function(record) {
		this.ExtendRaw(record.keys, record.values);
	};
	output.ExtendRaw(keys, values);
	return output;
}

function newIdLookup() {
	var output = {};
	output._keys = [];
	output._lookup = {};
	output._lookupReverse = {};
	output._all = undefined;
	output._allChanged = true;
	output._GetKey = function(key) {
		return newIdRecord([key], [ Array.from(this._lookup[key]) ]);
	};
	output._GetIdx = function(idx) {
		var key = this._keys[idx];
		return this._GetKey(key);
	};
	output._GetIdxRange = function(startIdx, endIdx) {
		var output = newIdRecord([], []);
		var idx = undefined;
		for(idx = startIdx; idx < endIdx; ++idx) {
			output.extend( this._GetIdx(idx) );
		}
		return output;
	};
	output._GetIdxRangeReverse = function(startIdx, endIdx) {
		var output = newIdRecord([], []);
		var idx = undefined;
		for(idx = startIdx; idx > endIdx; --idx) {
			output.extend( this._GetIdx(idx) );
		}
		return output;
	};
	output._GetSingle = function(key) {
		var output = newIdRecord([], []);
		var strKey = key.toString();
		if( this._lookup.hasOwnProperty(strKey) ) {
			output = this._GetKey(strKey);
		}
		return output;
	};
	output._AddSingleReverse = function(item, strKey) {
		var strItem = item.toString();
		if( this._lookupReverse.hasOwnProperty(strItem) ) {
			this._lookupReverse[strItem].add(strKey);
		} else {
			this._lookupReverse[strItem] = new Set([strKey]);
		}
	};
	output._bisect = function(value, lookup) {
		var lookupLength = lookup.length;
		var idx = undefined;
		for(idx = 0; idx < lookupLength; ++idx) {
			if(value < lookup[idx]) {
				break;
			}
		}
		return idx;
	};
	output._AddSingle = function(key, item) {
		var strKey = key.toString();
		if( this._lookup.hasOwnProperty(strKey) ) {
			this._lookup[strKey].add(item);
		} else {
			var idx = this._bisect(strKey, this._keys);
			var itemSet = new Set([item]);
			this._keys.splice(idx, 0, strKey);
			this._lookup[strKey] = itemSet;
		}
		this._allChanged = true;
		this._AddSingleReverse(item, strKey);
	};
	output.add = function(key, item) {
		var arrayKey = !Array.isArray(key) ? [key] : key;
		var arrayKeyLength = arrayKey.length;
		var arrayItem = !Array.isArray(item) ? [item] : item;
		var arrayItemLength = arrayItem.length;
		var arrayKeyIdx = undefined;
		for(arrayKeyIdx = 0; arrayKeyIdx < arrayKeyLength; ++arrayKeyIdx) {
			var key = arrayKey[arrayKeyIdx];
			if(key !== null) {
				var arrayItemIdx = undefined;
				for(arrayItemIdx = 0; arrayItemIdx < arrayItemLength; ++arrayItemIdx) {
					this._AddSingle(key, arrayItem[arrayItemIdx])
				}
			}
		}
	};
	output.get = function(key) {
		var output = newIdRecord([], []);
		var arrayKey = !Array.isArray(arrayKey) ? [key] : key;
		var arrayKeyLength = arrayKey.length;
		var idx = undefined;
		for(idx = 0; idx < arrayKeyLength; ++idx) {
			output.extend( this._GetSingle(arrayKey[idx]) );
		}
		return output;
	};
	output.GetNumericalRange = function(start, end) {
		//TODO: This function is too phat. Refactor... eventually.
		var output = newIdRecord([], []);
		var startNum = undefined;
		var endNum = undefined;
		var startIdx = undefined;
		var endIdx = undefined;
		var keysLength = this._keys.length;
		var keysIdx = undefined;
		if(start === undefined) {
			startIdx = 0;
		} else {
			startNum = parseFloat(start);
			if( !isNaN(startNum) ) {
				for(keysIdx = 0; keysIdx < keysLength; ++keysIdx) {
					var keyFloat = parseFloat(this._keys[keysIdx]);
					if(!isNaN(keyFloat) && keyFloat >= startNum) {
						startIdx = keysIdx;
						break;
					}
				}
			}
		}
		if(end === undefined) {
			var keysLength = this._keys.length;
			if(keysLength > 0) {
				endIdx = keysLength - 1;
			}
		} else {
			endNum = parseFloat(end);
			if( !isNaN(endNum) ) {
				for(keysIdx = keysLength - 1; keysIdx > 0; --keysIdx) {
					var keyFloat = parseFloat(this._keys[keysIdx]);
					if(!isNaN(keyFloat) && keyFloat <= endNum) {
						endIdx = keysIdx;
						break;
					}
				}
			}
		}
		if(startIdx !== undefined && endIdx !== undefined) {
			if(startIdx > endIdx) {
				output = this._GetIdxRangeReverse(startIdx, endIdx - 1);
			} else {
				output = this._GetIdxRange(startIdx, endIdx + 1);
			}
		}
		return output;
	};
	output.GetAll = function() {
		var output = newIdRecord([], []);
		if(this._allChanged) {
			this._all = this._GetIdxRange(0, this._keys.length);
		}
		output.extend(this._all);
		return output;
	};
	output.get = function(key) {
		var output = newIdRecord([], []);
		var arrayKey = !Array.isArray(key) ? [key] : key;
		var arrayKeyLength = arrayKey.length;
		var idx = undefined;
		for(idx = 0; idx < arrayKeyLength; ++idx) {
			output.extend( this._GetSingle(arrayKey[idx]) );
		}
		return output;
	};
	output.GetFuzzy = function(key) {
		var arrayKey = !Array.isArray(key) ? [key] : key;
		var matches = []
		var arrayKeyLength = arrayKey.length;
		var arrayKeyIdx = undefined;
		var lookupLength = this._keys.length;
		var lookupIdx = undefined;
		for(lookupIdx = 0; lookupIdx < lookupLength; ++lookupIdx) {
			for(arrayKeyIdx = 0; arrayKeyIdx < arrayKeyLength; ++arrayKeyIdx) {
				if(this._keys[lookupIdx].indexOf(arrayKey[arrayKeyIdx]) !== -1) {
					matches.push(this._keys[lookupIdx]);
					break;
				}
			}
		}
		return this.get(matches);
	};
	output._GetReverseSingle = function(item) {
		var output = [];
		var strItem = item.toString();
		if( this._lookupReverse.hasOwnProperty(strItem) ) {
			output = Array.from(this._lookupReverse[strItem]);
		}
		return output;
	};
	output.GetReverse = function(item) {
		var output = [];
		var arrayItem = !Array.isArray(item) ? [item] : item;
		var arrayItemLength = arrayItem.length;
		var idx = undefined;
		for(idx = 0; idx < arrayItemLength; ++idx) {
			output = output.concat( this._GetReverseSingle(arrayItem[idx]) );
		}
		return output
	};
	return output;
}

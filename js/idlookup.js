"use strict";

function newIdRecord(keys, values) {
	var output = {};
	output.keys = [];
	output.values = [];
	output.lookup = {};
	output.SortNumerical = function() {
		var idx = undefined;
		var valuesLength = this.values.length;
		var keyValues = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			keyValues.push([ this.keys[idx], this.values[idx] ]);
		}
		keyValues.sort(function(a, b) {
			var output = 0;
			var sizeA = a[1].size;
			var sizeB = b[1].size;
			if(sizeA < sizeB) {
				output = -1;
			} else if(sizeA > sizeB) {
				output = 1;
			}
			return output;
		});
		this.keys = [];
		this.values = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			this.keys.push(keyValues[idx][0]);
			this.values.push(keyValues[idx][1]);
		}
	}
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
	output.ExtendRaw = function(keys, values) {
		var thisLookup = this.lookup;
		var thisKeys = this.keys;
		var thisValues = this.values;
		var keysLength = keys.length;
		var idx = 0;
		for(idx = 0; idx < keysLength; ++idx) {
			var k = keys[idx];
			if( !thisLookup.hasOwnProperty(k) ) {
				var v = new Set(values[idx]);
				thisKeys.push(k);
				thisValues.push(v);
				thisLookup[k] = v;
			} else {
				var v = values[idx];
				var found = thisLookup[k];
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
		return this._GetKey(this._keys[idx]);
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
	output._AddSingle = function(key, item) {
		var strKey = key.toString();
		if( this._lookup.hasOwnProperty(strKey) ) {
			this._lookup[strKey].add(item);
		} else {
			var itemSet = new Set([item]);
			this._keys.push(strKey);
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
			var k = arrayKey[arrayKeyIdx];
			if(k !== null) {
				var arrayItemIdx = undefined;
				for(arrayItemIdx = 0; arrayItemIdx < arrayItemLength; ++arrayItemIdx) {
					this._AddSingle(k, arrayItem[arrayItemIdx]);
				}
			}
		}
	};
	output.sort = function() {
		this._keys.sort(function(a, b) {
			var output = 0;
			var numA = parseFloat(a);
			var numB = parseFloat(b);
			if( !isNaN(numA) && !isNaN(numB) ) {
				if(numA < numB) {
					output = -1;
				} else if(numA > numB) {
					output = 1;
				}
			} else {
				var aLower = a.toLowerCase();
				var bLower = b.toLowerCase();
				if(aLower < bLower) {
					output = -1;
				} else if(aLower > bLower) {
					output = 1;
				}
			}
			return output;
		});
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
			if(keysLength > 0) {
				endIdx = keysLength - 1;
			}
		} else {
			endNum = parseFloat(end);
			if( !isNaN(endNum) ) {
				for(keysIdx = keysLength - 1; keysIdx >= 0; --keysIdx) {
					var keyFloat = parseFloat(this._keys[keysIdx]);
					if(!isNaN(keyFloat) && keyFloat <= endNum) {
						endIdx = keysIdx;
						break;
					}
				}
			}
		}
		if(startIdx !== undefined && endIdx !== undefined) {
			output = startIdx > endIdx ?
					 this._GetIdxRangeReverse(startIdx, endIdx - 1) :
					 this._GetIdxRange(startIdx, endIdx + 1);
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
		var matches = [];
		var arrayKeyLength = arrayKey.length;
		var arrayKeyIdx = undefined;
		var lookupLength = this._keys.length;
		var lookupIdx = undefined;
		for(lookupIdx = 0; lookupIdx < lookupLength; ++lookupIdx) {
			for(arrayKeyIdx = 0; arrayKeyIdx < arrayKeyLength; ++arrayKeyIdx) {
				if( this._keys[lookupIdx].toLowerCase().indexOf(arrayKey[arrayKeyIdx].toLowerCase() ) !== -1) {
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
		return output;
	};
	return output;
}

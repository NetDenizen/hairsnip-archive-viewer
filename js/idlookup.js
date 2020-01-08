"use strict";

function newIdRecord(keys, values) {
	var output = {};
	output.keys = [];
	output.values = [];
	output.lookup = {};
	output.reverseLookup = {};
	output._allValues = undefined;
	output._edited = false;
	output._GenerateAllValues = function() {
		if(this._edited) {
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
			this._allValues = output;
			this._edited = false;
		}
	};
	output.AllValues = function() {
		this._GenerateAllValues();
		return Array.from(this._allValues);
	};
	output.AllValuesSet = function() {
		this._GenerateAllValues();
		return new Set(this._allValues);
	};
	output.SortKeyValues = function(compareFunction) {
		var idx = undefined;
		var valuesLength = this.values.length;
		var keyValues = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			keyValues.push([ this.keys[idx], this.values[idx] ]);
		}
		keyValues.sort(compareFunction);
		this.keys = [];
		this.values = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			this.keys.push(keyValues[idx][0]);
			this.values.push(keyValues[idx][1]);
		}
		this._edited = true;
	};
	output.SortNumerical = function() {
		this.SortKeyValues(function(a, b) {
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
	};
	output.SortNumericalReverse = function() {
		this.SortKeyValues(function(a, b) {
			var output = 0;
			var sizeA = a[1].size;
			var sizeB = b[1].size;
			if(sizeA < sizeB) {
				output = 1;
			} else if(sizeA > sizeB) {
				output = -1;
			}
			return output;
		});
	};
	output.reverse = function() {
		this.keys = this.keys.reverse();
		this.values = this.values.reverse();
		this._edited = true;
	};
	output._AddToReverseLookup = function(v, k) {
		var vString = "v" + v.toString();
		var thisReverseLookup = this.reverseLookup;
		if( thisReverseLookup.hasOwnProperty(vString) ) {
			thisReverseLookup[vString].push(k);
		} else {
			thisReverseLookup[vString] = [k];
		}
	};
	output.ExtendRaw = function(keys, values) {
		var thisLookup = this.lookup;
		var thisKeys = this.keys;
		var thisValues = this.values;
		var keysLength = keys.length;
		var idx = 0;
		for(idx = 0; idx < keysLength; ++idx) {
			var k = keys[idx];
			var vArray = Array.from(values[idx]);
			var vArrayLength = vArray.length;
			var vIdx = undefined;
			if( !thisLookup.hasOwnProperty(k) ) {
				var vSet = new Set(vArray);
				thisKeys.push(k);
				thisValues.push(vSet);
				thisLookup[k] = vSet;
				for(vIdx = 0; vIdx < vArrayLength; ++vIdx) {
					var v = vArray[vIdx];
					this._AddToReverseLookup(v, k);
				}
			} else {
				var found = thisLookup[k];
				for(vIdx = 0; vIdx < vArrayLength; ++vIdx) {
					var v = vArray[vIdx];
					if( !thisLookup[k].has(v) ) {
						this._AddToReverseLookup(v, k);
					}
					found.add(v);
				}
			}
		}
		this._edited = true;
	};
	output.extend = function(record) {
		this.ExtendRaw(record.keys, record.values);
	};
	output.NegateValues = function(values) {
		// TODO: Optimize me. Avoid reallocating this array, and using indexOf to find the values
		var thisLookup = this.lookup;
		var thisReverseLookup = this.reverseLookup;
		var thisKeys = this.keys;
		var thisValues = this.values;
		var valuesLength = values.length;
		var idx = 0;
		for(idx = 0; idx < valuesLength; ++idx) {
			var vArray = Array.from(values[idx]);
			var vArrayLength = vArray.length;
			var vIdx = undefined;
			for(vIdx = 0; vIdx < vArrayLength; ++vIdx) {
				var v = vArray[vIdx];
				var vString = "v" + v.toString();
				if( thisReverseLookup.hasOwnProperty(vString) ) {
					var reverseKeys = thisReverseLookup[vString];
					var reverseKeysLength = reverseKeys.length;
					var reverseKeysIdx = undefined;
					for(reverseKeysIdx = 0; reverseKeysIdx < reverseKeysLength; ++reverseKeysIdx) {
						var k = reverseKeys[reverseKeysIdx];
						var vSet = thisLookup[k];
						vSet.delete(v);
						if(vSet.size === 0) {
							var kIndex = thisKeys.indexOf(k);
							thisKeys.splice(kIndex, 1);
							thisValues.splice(kIndex, 1);
							delete thisLookup[k];
						}
					}
					delete thisReverseLookup[vString];
				}
			}
		}
		this._edited = true;
	};
	output.intersect = function(record) {
		var tmp = newIdRecord([], []);
		tmp.extend(this);
		tmp.NegateValues(record.values);
		this.NegateValues(tmp.values);
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
		var cleanKey = key.slice(3);
		return newIdRecord([cleanKey], [ Array.from(this._lookup[key]) ]);
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
	output._GetKeyString = function(key) {
		var strKey = undefined;
		if(key === null) {
			strKey = "_LKNULL";
		} else {
			strKey = "LK_" + key.toString();
		}
		return strKey;
	};
	output._GetSingle = function(key) {
		var output = newIdRecord([], []);
		var strKey = this._GetKeyString(key);
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
		var strKey = this._GetKeyString(key);
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
			var arrayItemIdx = undefined;
			for(arrayItemIdx = 0; arrayItemIdx < arrayItemLength; ++arrayItemIdx) {
				this._AddSingle(k, arrayItem[arrayItemIdx]);
			}
		}
	};
	output.sort = function() {
		this._keys.sort(function(a, b) {
			var output = 0;
			var numA = ParseFloatOrNull( a.slice(3) );
			var numB = ParseFloatOrNull( b.slice(3) );
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
			startIdx = this._keys[0] === '_LKNULL' ? 1 : 0;
		} else {
			startNum = parseFloat(start);
			if( !isNaN(startNum) ) {
				for(keysIdx = this._keys[0] === '_LKNULL' ? 1 : 0; keysIdx < keysLength; ++keysIdx) {
					var keyFloat = parseFloat( this._keys[keysIdx].slice(3) );
					if(!isNaN(keyFloat) && keyFloat >= startNum) {
						if(keyFloat === startNum) {
							startIdx = keysIdx;
						} else if(keysIdx > 0) {
							startIdx = keysIdx - 1;
						}
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
					var keyFloat = parseFloat( this._keys[keysIdx].slice(3) );
					if(!isNaN(keyFloat) && keyFloat <= endNum) {
						if(keyFloat === endNum) {
							endIdx = keysIdx;
						} else if(keysIdx < keysLength - 1) {
							endIdx = keysIdx + 1;
						}
						break;
					}
				}
			}
		}
		if(startIdx !== undefined && endIdx !== undefined) {
			output = this._GetIdxRange(startIdx, endIdx);
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
				if( this._keys[lookupIdx].slice(3).toLowerCase().indexOf(arrayKey[arrayKeyIdx].toLowerCase() ) !== -1) {
					matches.push( this._keys[lookupIdx].slice(3) );
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
			var idx = undefined;
			var outputLength = undefined;
			output = Array.from(this._lookupReverse[strItem]);
			outputLength = output.length;
			for(idx = 0; idx < outputLength; ++idx) {
				output[idx] = output[idx].slice(3);
			}
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

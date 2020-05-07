"use strict";

// XXX: This function essentially has no safeguards to prevent the entries from expanding out of control
// or to prevent anything other than a numerical type being used with it.
// Ensure that all interactions with it are through carefully selected interfaces.
// Really, this function should not be called outside of this file.
function newRecordSet() {
	var output = {};
	output._entries = [];
	output.size = 0;
	output.has = function(v) {
		var output = false;
		var thisEntries = this._entries;
		if(v < thisEntries.length) {
			output = thisEntries[v];
		}
		return output;
	};
	output.add = function(v) {
		var thisEntries = this._entries;
		if(v > thisEntries.length) {
			thisEntries.push(true);
		} else {
			thisEntries[v] = true;
		}
		++this.size;
	};
	output.delete = function(v) {
		var thisEntries = this._entries;
		if(v < thisEntries.length) {
			thisEntries[v] = false;
			--this.size;
		}
	};
	output.or = function(set) {
		var thisEntries = this._entries;
		var setEntries = set._entries;
		var shorterLength = thisEntries.length;
		var longerLength = setEntries.length;
		var shorterEntries = thisEntries;
		var longerEntries = setEntries;
		var idx = 0;
		var newSize = 0;
		if(shorterLength > longerLength) {
			var tmp = shorterLength;
			shorterLength = longerLength;
			longerLength = tmp;
			longerEntries = thisEntries;
			shorterEntries = setEntries;
		}
		while(idx < shorterLength) {
			var tmp = thisEntries[idx] || setEntries[idx];
			if(tmp) {
				++newSize;
			}
			thisEntries[idx] = tmp;
			++idx;
		}
		while(idx < longerLength) {
			var tmp = longerEntries[idx];
			if(tmp) {
				++newSize;
			}
			shorterEntries.push(tmp);
			++idx;
		}
		this.size = newSize;
	};
	output.ToArray = function() {
		var output = [];
		var thisEntries = this._entries;
		var thisEntriesLength = thisEntries.length;
		var idx = undefined;
		for(idx = 0; idx < thisEntriesLength; ++idx) {
			if(thisEntries[idx]) {
				output.push(idx);
			}
		}
		return output;
	};
	output.dupe = function() {
		var output = newRecordSet();
		output._entries = this._entries.slice(0);
		output.size = this.size;
		return output;
	};
	return output;
}

function newRecordSetFromArray(array) {
	var output = newRecordSet();
	var arrayLength = array.length;
	var idx = undefined;
	for(idx = 0; idx < arrayLength; ++idx) {
		output.add(array[idx]);
	}
	return output;
}

function newIdRecord(keys, values) {
	var output = {};
	output.keys = [];
	output.values = [];
	output._lookup = {};
	output._reverseLookup = {};
	output._allValues = undefined;
	output._edited = false;
	output._GenerateAllValues = function() {
		if(this._edited) {
			var output = newRecordSet();
			var values = this.values;
			var valuesLength = values.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				output.or(values[idx]);
			}
			this._allValues = output;
			this._edited = false;
		}
	};
	output.AllValues = function() {
		this._GenerateAllValues();
		return this._allValues.ToArray();
	};
	output.AllValuesSet = function() {
		this._GenerateAllValues();
		return this._allValues.dupe();
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
		var thisReverseLookup = this._reverseLookup;
		if( thisReverseLookup.hasOwnProperty(vString) ) {
			thisReverseLookup[vString].push(k);
		} else {
			thisReverseLookup[vString] = [k];
		}
	};
	output.ExtendRaw = function(keys, values) {
		var thisLookup = this._lookup;
		var thisKeys = this.keys;
		var thisValues = this.values;
		var keysLength = keys.length;
		var idx = 0;
		for(idx = 0; idx < keysLength; ++idx) {
			var rawK = keys[idx];
			var k = "v" + rawK;
			var vSet = values[idx].dupe();
			var vSetArray = vSet.ToArray();
			var vSetArrayLength = vSetArray.length;
			var vSetIdx = undefined;
			if( !thisLookup.hasOwnProperty(k) ) {
				thisKeys.push(rawK);
				thisValues.push(vSet);
				thisLookup[k] = vSet;
				for(vSetIdx = 0; vSetIdx < vSetArrayLength; ++vSetIdx) {
					this._AddToReverseLookup(vSetArray[vSetIdx], rawK);
				}
			} else {
				var found = thisLookup[k];
				for(vSetIdx = 0; vSetIdx < vSetArrayLength; ++vSetIdx) {
					var v = vSetArray[vSetIdx];
					if( !found.has(v) ) {
						this._AddToReverseLookup(v, rawK);
					} else {
						found.add(v);
					}
				}
			}
		}
		this._edited = true;
	};
	output.extend = function(record) {
		this.ExtendRaw(record.keys, record.values);
	};
	output.ExtendAllToEachKey = function(record) {
		var v = record.AllValuesSet();
		var values = [];
		var recordKeys = record.keys;
		var recordKeysLength = recordKeys.length;
		var idx = undefined;
		for(idx = 0; idx < recordKeysLength; ++idx) {
			values.push(v);
		}
		this.ExtendRaw(recordKeys, values);
	};
	output.NegateValues = function(values) {
		var thisLookup = this._lookup;
		var thisReverseLookup = this._reverseLookup;
		var thisKeys = this.keys;
		var thisValues = this.values;
		var thisIndexes = [];
		var changeIndexes = false;
		var thisKeysLength = thisKeys.length;
		var valuesLength = values.length;
		var idx = undefined;
		// TODO: More efficient initialization
		for(idx = 0; idx < thisKeysLength; ++idx) {
			thisIndexes.push(true);
		}
		for(idx = 0; idx < valuesLength; ++idx) {
			var vArray = values[idx].ToArray();
			var vArrayLength = values[idx].length;
			var vArrayIdx = undefined;
			for(vArrayIdx = 0; vArrayIdx < vArrayLength; ++vArrayIdx) {
				var v = vArray[vArrayIdx];
				var vString = "v" + v.toString();
				if( thisReverseLookup.hasOwnProperty(vString) ) {
					var reverseKeys = thisReverseLookup[vString];
					var reverseKeysLength = reverseKeys.length;
					var reverseKeysIdx = undefined;
					for(reverseKeysIdx = 0; reverseKeysIdx < reverseKeysLength; ++reverseKeysIdx) {
						var rawK = reverseKeys[reverseKeysIdx];
						var k = "v" + rawK;
						var vSet = thisLookup[k];
						vSet.delete(v);
						if(vSet.size === 0) {
							var kIndex = thisKeys.indexOf(rawK);
							thisIndexes[kIndex] = false;
							changeIndexes = true;
							delete thisLookup[k];
						}
					}
					delete thisReverseLookup[vString];
				}
			}
		}
		if(changeIndexes) {
			var newKeys = [];
			var newValues = [];
			for(idx = 0; idx < thisKeysLength; ++idx) {
				if(thisIndexes[idx]) {
					newKeys.push(thisKeys[idx]);
					newValues.push(thisValues[idx]);
				}
			}
			this.keys = newKeys;
			this.values = newValues;
		}
		this._edited = true;
	};
	output.intersect = function(record) {
		var tmp = newIdRecord([], []);
		tmp.extend(this);
		tmp.NegateValues(record.values);
		this.NegateValues(tmp.values);
	};
	output.GetValueKeyCount = function(v) {
		var thisReverseLookup = this._reverseLookup;
		var vString = "v" + v.toString();
		var output = 0;
		if( thisReverseLookup.hasOwnProperty(vString) ) {
			output = thisReverseLookup[vString].length;
		}
		return output;
	};
	output.ExtendRaw(keys, values);
	return output;
}

function newUnnegatableIdRecord(keys, values) {
	var output = newIdRecord(keys, values);
	output.NegateValues = undefined;
	output.intersect = undefined;
	output._AddToReverseLookup = function(v, k) {
		var vString = "v" + v.toString();
		var thisReverseLookup = this._reverseLookup;
		if( thisReverseLookup.hasOwnProperty(vString) ) {
			thisReverseLookup[vString] = thisReverseLookup[vString] + 1; // TODO: Can we optimize this?
		} else {
			thisReverseLookup[vString] = 1;
		}
	};
	output.GetValueKeyCount = function(v) {
		var thisReverseLookup = this._reverseLookup;
		var vString = "v" + v.toString();
		var output = 0;
		if( thisReverseLookup.hasOwnProperty(vString) ) {
			output = thisReverseLookup[vString];
		}
		return output;
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
		return newIdRecord([key.slice(3)], [newRecordSetFromArray(Array.from(this._lookup[key]))]);
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
		return key === null ? "_LKNULL" : "LK_" + key.toString();
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
		var strItem = "v" + item.toString();
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
			this._keys.push(strKey);
			this._lookup[strKey] = new Set([item]);
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
			if(a === '_LKNULL' && b !== '_LKNULL') {
				output = -1;
			} else if(b === '_LKNULL' && a !== '_LKNULL') {
				output = 1;
			} else {
				var numA = parseFloat( a.slice(3) );
				var numB = parseFloat( b.slice(3) );
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
			}
			return output;
		});
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
					var keyFloat = parseFloat( this._keys[keysIdx].slice(3) );
					if(!isNaN(keyFloat) && keyFloat <= endNum) {
						endIdx = keysIdx;
						break;
					}
				}
			}
		}
		if(startIdx !== undefined && endIdx !== undefined) {
			output = this._GetIdxRange(startIdx, endIdx + 1);
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
				var cleanKey = this._keys[lookupIdx].slice(3);
				if( cleanKey.toLowerCase().includes( arrayKey[arrayKeyIdx].toLowerCase() ) ) {
					matches.push(cleanKey);
					break;
				}
			}
		}
		return this.get(matches);
	};
	output._GetReverseSingle = function(item) {
		var output = [];
		var strItem = "v" + item.toString();
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

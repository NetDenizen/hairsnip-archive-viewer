// TODO: Proper constructors
// TODO: Check all
"use strict";

var idRecord = {
	keys: undefined,
	values: undefined,

	AllValues: function() {
		return [].concat(this.values).unique();
	},
	length: function() {
		return this.keys.length;
	},
	empty: function() {
		var output = true;
		if(this.values !== undefined && this.values.length > 0) {
			output = false;
		}
		return output;
	},
	extend: function(record) {
		var recordLength = record.length();
		var idx = 0;
		for(idx = 0; idx < recordLength; ++idx) {
			var found = this.keys.indexOf(record.keys[idx], 0);
			if(found !== -1) {
				this.keys.push(record.keys[idx]);
				this.values.push(record.values[idx]);
			} else {
				this.values = this.values.concat(record.values[idx]).unique();
			}
		}
	},
}
function newIdRecord(keys, values) {
	var output = Object.create(idRecord);
	output.keys = keys;
	output.values = values;
	return output;
}

var idLookup = {
	_keys: [],
	_items: [],
	_lookup: {},
	_lookupReverse: {},
	_all: undefined,
	_allChanged: true,

	_GetIdx: function(idx) {
		return newIdRecord([ this._keys[idx] ], [ this._items[idx] ]);
	},
	_GetIdxRange: function(startIdx, endIdx) {
		var output = newIdRecord([], []);
		var idx = undefined;
		for(idx = startIdx; idx < endIdx; ++idx) {
			output.extend( this._GetIdx(idx) );
		}
		return output;
	},
	_GetSingle: function(key) {
		var output = undefined;
		var strKey = key.toString();
		if( this._lookup.hasOwnProperty(strKey) ) {
			output = this._GetIdx(this._lookup[strKey]);
		}
		return output;
	},
	_AddSingleReverse: function(item, strKey) {
		var strItem = item.toString();
		if( this._lookupReverse.hasOwnProperty(strItem) ) {
			var itemsArray = this._lookupReverse[strItem];
			if( !( itemsArray.includes(strKey) ) ) {
				itemsArray.push(strKey);
			}
		} else {
			this._lookupReverse[strItem] = [strKey];
		}
	},
	_AddSingle: function(key, item) {
		var strKey = key.toString();
		if( this._lookup.hasOwnProperty(strKey) ) {
			var itemsArray = this._items[ this._lookup[strKey] ];
			if( !( itemsArray.includes(item) ) ) {
				itemsArray.push(item);
			}
		} else {
			this._keys.push(strKey);
			this._items.push( [item] );
			this._lookup[strKey] = this._items.length;
		}
		this._allChanged = true;
		this._AddSingleReverse(item, strKey);
	},
	add: function(key, item) {
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
	},
	get: function(key) {
		var output = newIdRecord([], []);
		var arrayKey = !Array.isArray(arrayKey) ? [key] : key;
		var arrayKeyLength = arrayKey.length;
		var idx = undefined;
		for(idx = 0; idx < arrayKeyLength; ++idx) {
			output.extend( this._GetSingle(arrayKey[idx]) );
		}
		return output;
	},
	GetRange: function(start, end) {
		var output = newIdRecord([], []);
		var strStart = start.toString();
		var strEnd = end.toString();
		if( this._lookup.hasOwnProperty(strStart) && this._lookup.hasOwnProperty(strEnd) ) {
			var startIdx = this._lookup[strStart];
			var endIdx = this._lookup[strEnd];
			if(startIdx > endIdx) {
				var tmpIdx = startIdx;
				startIdx = endIdx;
				endIdx = tmpIdx;
				output = this._GetIdxRange(startIdx, endIdx + 1).reverse();
			} else {
				output = this._GetIdxRange(startIdx, endIdx + 1);
			}
		}
		return output;
	},
	GetAll: function() {
		if(this._allChanged) {
			this._all = this._GetIdxRange(0, this._items.length);
		}
		return newIdRecord([], []).extend(this._all);
	},
	get: function(key) {
		var output = newIdRecord([], []);
		var arrayKey = !Array.isArray(key) ? [key] : key;
		var arrayKeyLength = arrayKey.length;
		var idx = undefined;
		for(idx = 0; idx < arrayKeyLength; ++idx) {
			output.extend( this._GetSingle(arrayKey[idx]) );
		}
		return output;
	},
	GetFuzzy: function(key) {
		//TODO: Rewrite?
		// TODO: This *might* not be accessible in mapFunc
		var arrayKey = !Array.isArray(key) ? [key] : key;
		var keyFunc = function(kf) { return kf.indexOf(km) !== -1; };
		var mapFunc = function(km) { return this._keys.filter(keyFunc); }
		return this.get( [].concat.apply( [], arrayKey.map(mapFunc) ) );
	},
	_GetReverseSingle: function(item) {
		var output = [];
		var strItem = item.toString();
		if( this._lookupReverse.hasOwnProperty(strItem) ) {
			output = this._lookupReverse[strItem];
		}
		return output;
	},
	GetReverse: function(item) {
		var output = [];
		var arrayItem = !Array.isArray(item) ? [item] : item;
		var arrayItemLength = arrayItem.length;
		var idx = undefined;
		for(idx = 0; idx < arrayItemLength; ++idx) {
			output = output.concat( this._GetReverseSingle(arrayItem[idx]) );
		}
		return output
	},
}
function newIdLookup() {
	return Object.create(idLookup);
}

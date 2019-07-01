//TODO: Functionalize some loops
//TODO: Use ternary conditions where possible
//TODO: Trim all?
"use strict";

function newFulltextSearcher(name, searcher, updateCallback) {
	var output = {};
	output.targetElement = undefined;
	output.searcher = undefined;
	output._updateCallback = undefined;
	output.edited = false;
	output.index = {};
	output.results = undefined;

	output._ParseKeywords = function() {
		var keywords = this.targetElement.value.split(",");
		var keywordsLength = keywords.length;
		var idx = undefined;
		this.results = newIdRecord([], []);
		for(idx = 0; idx < keywordsLength; ++idx) {
			var kw = keywords[idx].trim();
			if( !(kw in this.index) ) {
				this.index[kw] = this.searcher.LookupBody(kw);
			}
			this.results.extend(this.index[kw]);
		}
		this.edited = true;
		this._updateCallback();
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseKeywords();
		}
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, searcher, updateCallback) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElement.addEventListener("input", this, false);
		this.searcher = searcher;
		this._updateCallback = updateCallback;
	};
	output.init(name, searcher, updateCallback);
	return output;
}

function newKeywordSearcher(name, lookup, updateCallback) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._updateCallback = undefined;
	output.edited = false;
	output.index = {};
	output.results = undefined;

	output._ParseKeywords = function() {
		var keywords = this.targetElement.value.split(",");
		var keywordsLength = keywords.length;
		var idx = undefined;
		this.results = newIdRecord([], []);
		for(idx = 0; idx < keywordsLength; ++idx) {
			var kw = keywords[idx].trim();
			if(kw === "-") {
				kw = "";
			}
			if( !(kw in this.index) ) {
				this.index[kw] = this.lookup.GetFuzzy(kw);
			}
			this.results.extend(this.index[kw]);
		}
		this.edited = true;
		this._updateCallback();
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseKeywords();
		}
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, lookup, updateCallback) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._updateCallback = updateCallback;
	};
	output.init(name, lookup, updateCallback);
	return output;
}

function newDateSearcher(minName, maxName, lookup, updateCallback) {
	var output = {};
	output.targetMinElement = undefined;
	output.targetMaxElement = undefined;
	output.lookup = undefined;
	output._updateCallback = undefined;
	output.edited = false;
	output.results = undefined;

	output._ParseDate = function() {
		//TODO: Formatting
		var minDateTime = this.targetMinElement.valueAsDate === null ? new Date(1970).getTime() : this.targetMinElement.valueAsDate.getTime();
		var maxDateTime = this.targetMaxElement.valueAsDate === null ? new Date(2038, 0, 19, 3, 14, 7).getTime() : this.targetMaxElement.valueAsDate.getTime();
		this.results = newIdRecord([], []);
		if(minDateTime <= maxDateTime) {
			this.results.extend( this.lookup.GetRange(minDateTime, maxDateTime) )
		}
		this.edited = true;
		this._updateCallback();
	};
	output._InputListener = function(e) {
		if(this.targetMinElement.valueAsDate === null && this.targetMaxElement.valueAsDate === null) {
			this.results = undefined;
		} else {
			this._ParseDate();
		}
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output._MakeInputElement = function(name) {
		var inputElement = document.createElement('input');
		inputElement.setAttribute("type", "date");
		inputElement.setAttribute("id", name);
		inputElement.addEventListener("input", this, false);
		return inputElement;
	};
	output.init = function(minName, maxName, lookup, updateCallback) {
		this.targetMinElement = this._MakeInputElement(minName);
		this.targetMaxElement = this._MakeInputElement(maxName);
		this.lookup = lookup;
		this._updateCallback = updateCallback;
	};
	output.init(minName, maxName, lookup, updateCallback);
	return output;
}

function newRangeSearcher(name, lookup, updateCallback) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._updateCallback = undefined;
	output.edited = false;
	output.results = undefined;

	output._ExtractValues = function(valueString) {
		//TODO: Rewrite?
		//TODO: What if we leave one of these blank? Default to highest?
		return valueString.split(",").map( function(e) {
											var pair = e.split("-", 2);
											var output = pair;
										 	if(pair.length === 2) {
												var pair0 = pair[0].trim();
												var pair1 = pair[1].trim();
												if(pair1 < pair0) {
													output = [ pair1, pair0 ];
												} else {
													output = [ pair0, pair1 ];
												}
											} else if(pair.length === 1) {
												var pair0 = pair[0].trim();
												output = [ pair0, pair0 ];
											}
											return output;
									       }
										 )
									 .filter( function(e) { return e.length === 2; } );
	};
	output._ParseRanges = function() {
		var values = this._ExtractValues(this.targetMinElement.value);
		var valuesLength = values.length;
		var idx = undefined;
		this.results = newIdRecord([], []);
		for(idx = 0; idx < valuesLength; ++idx) {
			this.results.extend( this.lookup.GetRange(values[idx][0], values[idx][1]) )
		}
		this.edited = true;
		this._updateCallback();
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseRanges();
		}
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, lookup, updateCallback) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Value 1>-<Value 1>[,<Value 1>-<Value 1>...]");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._updateCallback = updateCallback;
	};
	output.init(name, lookup, updateCallback);
	return output;
}

function newAutocompleteSearcher(name, listName, lookup, updateCallback) {
	var output = {};
	output.targetElement = undefined;
	output.targetElementList = undefined;
	output.lookup = undefined;
	output._updateCallback = undefined;
	output.edited = false;
	output.results = undefined;

	output._datalistKeys = undefined;
	output._datalistValues = undefined;

	output._EscapeHTML = function(text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	};
	output._SetDataList = function(prefix, currentValue, keys, values) {
		var datalistLength = this._datalistKeys.length;
		var idx = undefined;
		this.targetElementList.innerHTML = "";
		for(idx = 0; idx < datalistLength; ++idx) {
			if(currentValue in keys[idx]) {
				var option = document.createElement('option');
				option.setAttribute("value", prefix + keys[idx]);
				option.value = this._EscapeHTML(values[idx]);
				this.targetElementList.appendChild(option);
			}
		}
	};
	output._update = function() {
		if(this.targetElement.value === "") {
			this.results = undefined;
		}
		else if( !this.targetElement.value.includes(',') ) {
			var value = keywords[idx].trim();
			if(value === "-") {
				value = "";
			}
			this.results = newIdRecord([], []);
			this.results.extend(value);
			this._setDataList("", this._datalistKeys, this._datalistValues);
		} else {
			var values = this.targetElement.value.split(',');
			this.results = newIdRecord([], []);
			//TODO: Rewrite?
			this.results.extend( this.lookup.get( values.map( function(r) {
																var newR = r;
																if(newR === "-") {
																	newR = "";
																}
																return newR.trim();
															   }
															 ) ) );
			this._setDataList(values.slice(0, values.length - 1), this._datalistKeys, this._datalistValues);
		}
		this.edited = true;
		this._updateCallback();
	};
	output._InputListener = function(e) {
		this._update();
	};
	//TODO: Optimize output slicing.
	output._longestCommonPrefix = function(values) {
		var output = undefined;
		var valuesLength = values.length;
		if(valuesLength === 0) {
			output = "";
		} else if(valuesLength === 1) {
			output = values[0];
		} else {
			var min = values[0];
			var minLength = min.length;
			var max = max;
			var maxLength = max.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				var val = values[idx];
				var valLength = val.length;
				if(valLength < min.length) {
					min = val;
					minLength = valLength;
				}
				if(valLength > max.length) {
					max = val;
					maxLength = valLength;
				}
			}
			output = min;
			for(idx = 0; idx < minLength && idx < maxLength; ++idx) {
				if(min[idx] !== max[idx]) {
					output = min.slice(0, idx);
				}
			}
		}
		return output;
	};
	output._KeyDownListener = function(e) {
		if(e.keyCode === 9) {
			var allValues = this.targetElement.value.split(',');
			var val = allValues[allValues.length - 1];
			var orig = val.toLowerCase();
			var ContainsOrig = [];
			var prefixes = [];
			var datalistLength = this._datalistKeys.length;
			var idx = undefined;
			for(idx = 0; idx < datalistLength; ++idx) {
				var s = this._datalistKeys[idx];
				var sLower = s.toLowerCase();
				if( sLower.includes(orig) ) {
					ContainsOrig.push(s);
				}
				if( sLower.includes( val.toLowerCase() ) ) {
					if(s.length > val.length) {
						val = s;
					}
				} else {
					prefixes.push(this._longestCommonPrefix);
				}
			}
			if(ContainsOrig.length === 1) {
				val = ContainsOrig[0];
			} else {
				val = prefixes.reduce(function (a, b) { return a.length > b.length ? a : b; });
			}
			this.targetElement.value = val;
			this._update();
		}
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "input") {
			this._InputListener(e);
		} else if(eType === "keydown") {
			this._KeyDownListener(e);
		}
	};
	output._BuildDatalistValues = function() {
		var values = this.lookup.GetAll();
		var valuesLength = values.keys.length;
		var idx = undefined;
		this._datalistKeys = [];
		this._datalistValues = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			this._datalistKeys.push(values.keys[idx]);
			this._datalistValues.push(values.keys[idx] + " [" + values.values[idx].size.toString() + "]");
		}
	};
	output.init = function(name, listName, lookup, updateCallback) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("list", listName);
		this.targetElement.setAttribute("autocomplete", "on");
		this.targetElement.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElement.addEventListener("input", this, false);
		this.targetElement.addEventListener("keydown", this, false);
		this.targetElementList = document.createElement('datalist');
		this.targetElementList.setAttribute("id", listName);
		this.lookup = lookup;
		this._updateCallback = updateCallback;
		this._BuildDatalistValues();
	};
	output.init(name, listName, lookup, updateCallback);
	return output;
}

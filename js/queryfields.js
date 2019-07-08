//TODO: Functionalize some loops
//TODO: Use ternary conditions where possible
//TODO: Trim all?
"use strict";

function newFulltextSearcher(name, searcher, manager) {
	var output = {};
	output.targetElement = undefined;
	output.searcher = undefined;
	output._manager = undefined;
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
			if( !this.index.hasOwnProperty(kw) ) {
				this.index[kw] = this.searcher.LookupBody(kw);
			}
			this.results.extend(this.index[kw]);
		}
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseKeywords();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, searcher, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElement.addEventListener("input", this, false);
		this.searcher = searcher;
		this._manager = manager;
	};
	output.init(name, searcher, manager);
	return output;
}

function newKeywordSearcher(name, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._manager = undefined;
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
			if( !this.index.hasOwnProperty(kw) ) {
				this.index[kw] = this.lookup.GetFuzzy(kw);
			}
			this.results.extend(this.index[kw]);
		}
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseKeywords();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, lookup, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._manager = manager;
	};
	output.init(name, lookup, manager);
	return output;
}

function newDateSearcher(minName, maxName, lookup, manager) {
	var output = {};
	output.targetMinElement = undefined;
	output.targetMaxElement = undefined;
	output.lookup = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;

	output._ParseDate = function() {
		//TODO: Formatting
		var minDateTime = this.targetMinElement.valueAsDate === null ? new Date(1970, 0, 1, 0, 0, 0).getTime() : this.targetMinElement.valueAsDate.getTime();
		var maxDateTime = this.targetMaxElement.valueAsDate === null ? new Date(2038, 0, 19, 3, 14, 7).getTime() : this.targetMaxElement.valueAsDate.getTime();
		this.results = newIdRecord([], []);
		if(minDateTime <= maxDateTime) {
			this.results.extend( this.lookup.GetNumericalRange(minDateTime, maxDateTime) )
		} else {
			this.results.extend( this.lookup.GetNumericalRange(maxDateTime, minDateTime) )
		}
	};
	output._InputListener = function(e) {
		if(this.targetMinElement.valueAsDate === null && this.targetMaxElement.valueAsDate === null) {
			this.results = undefined;
		} else {
			this._ParseDate();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
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
	output.init = function(minName, maxName, lookup, manager) {
		this.targetMinElement = this._MakeInputElement(minName);
		this.targetMaxElement = this._MakeInputElement(maxName);
		this.lookup = lookup;
		this._manager = manager;
	};
	output.init(minName, maxName, lookup, manager);
	return output;
}

//TODO: Deal with naked ends and decimals
function newRangeSearcher(name, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._manager = undefined;
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
												pair0 = pair0 !== "" ? pair0 : undefined;
												pair1 = pair1 !== "" ? pair1 : undefined;
												if(pair1 < pair0) {
													output = [ pair1, pair0 ];
												} else {
													output = [ pair0, pair1 ];
												}
											} else if(pair.length === 1) {
												var pair0 = pair[0].trim();
												pair0 = pair0 !== "" ? pair0 : undefined;
												output = [ pair0, pair0 ];
											}
											return output;
									       }
										 )
									 .filter( function(e) { return e.length === 2; } );
	};
	output._ParseRanges = function() {
		var values = this._ExtractValues(this.targetElement.value);
		var valuesLength = values.length;
		var idx = undefined;
		this.results = newIdRecord([], []);
		for(idx = 0; idx < valuesLength; ++idx) {
			this.results.extend( this.lookup.GetNumericalRange(values[idx][0], values[idx][1]) )
		}
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
		} else {
			this._ParseRanges();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output.handleEvent = function(e) {
		this._InputListener(e);
	};
	output.init = function(name, lookup, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<Value 1>-<Value 2>[,<Value 1>-<Value 2>...]");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._manager = manager;
	};
	output.init(name, lookup, manager);
	return output;
}

function newAutocompleteSearcher(name, listName, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.targetElementInput = undefined;
	output.targetElementList = undefined;
	output.lookup = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;

	output._datalistKeys = undefined;
	output._datalistValues = undefined;

	output._EscapeHTML = function(text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	};
	output._FindPrefix = function(value) {
		var output = 0;
		var valueLength = value.length;
		var idx = undefined;
		for(idx = 0; idx < valueLength; ++idx) {
			if( value[idx] === ',' || value[idx] !== value[idx].trim() ) {
				output = idx;
			}
		}
		return output;
	};
	output._SetDataList = function(prefix, currentValue, keys, values) {
		var datalistLength = this._datalistKeys.length;
		var idx = undefined;
		this.targetElementList.innerHTML = "";
		for(idx = 0; idx < datalistLength; ++idx) {
			if(keys[idx].indexOf(currentValue) !== -1) {
				var option = document.createElement('option');
				option.setAttribute("value", prefix + keys[idx]);
				option.innerHTML = this._EscapeHTML(values[idx]);
				this.targetElementList.appendChild(option);
			}
		}
	};
	output._update = function() {
		var fullValue = this.targetElementInput.value;
		if(fullValue === "") {
			this.results = undefined;
			this._SetDataList("", "", this._datalistKeys, this._datalistValues);
		} else if( !fullValue.includes(',') ) {
			var value = fullValue.trim();
			if(value === "-") {
				value = "";
			}
			this.results = newIdRecord([], []);
			this.results.extend( this.lookup.get(value) );
			this._SetDataList("", value, this._datalistKeys, this._datalistValues);
		} else {
			var cleanValues = [];
			var values = fullValue.split(',');
			var valuesLength = values.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				var trimmed = values[idx].trim();
				if(trimmed === "") {
					continue;
				} else if(trimmed === "-") {
					cleanValues.push("");
				} else {
					cleanValues.push(trimmed);
				}
			}
			this.results = this.lookup.get(cleanValues);
			this._SetDataList(fullValue.slice(0, this._FindPrefix(fullValue) + 1), values[valuesLength - 1].trim(), this._datalistKeys, this._datalistValues);
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
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
			var max = values[0];
			var maxLength = max.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				var val = values[idx];
				var valLength = val.length;
				if(val < min) {
					min = val;
					minLength = valLength;
				}
				if(val > max) {
					max = val;
					maxLength = valLength;
				}
			}
			output = min;
			for(idx = 0; idx < minLength && idx < maxLength; ++idx) {
				if(min[idx] !== max[idx]) {
					output = min.slice(0, idx);
					break;
				}
			}
		}
		return output;
	};
	output._KeyDownListener = function(e) {
		if(e.keyCode === 9) {
			var fullVal = this.targetElementInput.value;
			var allValues = fullVal.split(',');
			var allValuesLength = allValues.length;
			var prefixValues = allValues.slice(0, allValuesLength - 1).join(',');
			var rawVal = allValues[allValuesLength - 1];
			var val = rawVal.trim().toLowerCase();
			var valSpace = rawVal.slice(0, rawVal.length - rawVal.trimLeft().length);
			var containsVal = [];
			var startsVal = [];
			var datalistLength = this._datalistKeys.length;
			var idx = undefined;
			for(idx = 0; idx < datalistLength; ++idx) {
				var s = this._datalistKeys[idx];
				var sLower = s.toLowerCase();
				if( sLower.indexOf(val) !== -1 ) {
					containsVal.push(s);
				}
				if( sLower.startsWith(val) ) {
					startsVal.push(s);
				}
			}
			if(prefixValues.length > 0) {
				prefixValues += ',';
			}
			if(containsVal.length === 1) {
				this.targetElementInput.value = prefixValues + valSpace + containsVal[0];
			} else {
				this.targetElementInput.value = prefixValues + valSpace + this._longestCommonPrefix(startsVal);
			}
			this._update();
			if(fullVal.length > 0) {
				e.preventDefault();
			}
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
			var val = values.keys[idx];
			if(val === "") {
				val = "-";
			}
			this._datalistKeys.push(val);
			this._datalistValues.push(val + " [" + values.values[idx].size.toString() + "]");
		}
		this._SetDataList("", "", this._datalistKeys, this._datalistValues);
	};
	output.init = function(name, listName, lookup, manager) {
		this.targetElementInput = document.createElement('input');
		this.targetElementInput.setAttribute("type", "text");
		this.targetElementInput.setAttribute("id", name);
		this.targetElementInput.setAttribute("list", listName);
		this.targetElementInput.setAttribute("autocomplete", "on");
		this.targetElementInput.setAttribute("placeholder", "<Keyword>[,<Keyword>]...");
		this.targetElementInput.addEventListener("input", this, false);
		this.targetElementInput.addEventListener("keydown", this, false);
		this.targetElementList = document.createElement('datalist');
		this.targetElementList.setAttribute("id", listName);
		this.targetElement = document.createElement('div');
		this.targetElement.appendChild(this.targetElementInput);
		this.targetElement.appendChild(this.targetElementList);
		this.lookup = lookup;
		this._manager = manager;
		this._BuildDatalistValues();
	};
	output.init(name, listName, lookup, manager);
	return output;
}

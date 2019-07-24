//TODO: Functionalize some loops
//TODO: Use ternary conditions where possible
//TODO: Trim all?
"use strict";

function newChecksumSearcher(name, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;

	output._ParseKeywords = function() {
		var cleanChecksums = [];
		var checksums = this.targetElement.value.split(",");
		var checksumsLength = checksums.length;
		var idx = undefined;
		for(idx = 0; idx < checksumsLength; ++idx) {
			cleanChecksums.push( checksums[idx].trim() );
		}
		this.results = lookup.get(cleanChecksums);
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
		this.targetElement.setAttribute("placeholder", "<checksum>[,...]");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._manager = manager;
	};
	output.init(name, lookup, manager);
	return output;
}

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
		this.targetElement.setAttribute("placeholder", "<keyword>[,...]");
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
		this.targetElement.setAttribute("placeholder", "<keyword>[,...]");
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
		var minDateTime = ( this.targetMinElement.valueAsDate === null ? new Date(1970, 0, 1, 0, 0, 0).getTime() : this.targetMinElement.valueAsDate.getTime() ) / 1000;
		var maxDateTime = ( this.targetMaxElement.valueAsDate === null ? new Date(2038, 0, 19, 3, 14, 7).getTime() : this.targetMaxElement.valueAsDate.getTime() ) / 1000;
		if(minDateTime <= maxDateTime) {
			this.results = this.lookup.GetNumericalRange(minDateTime, maxDateTime);
		} else {
			this.results = this.lookup.GetNumericalRange(maxDateTime, minDateTime);
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

function newRangeSearcher(name, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.lookup = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;

	output._ExtractValues = function(valueString) {
		var output = [];
		var values = valueString.split(",")
		var valuesLength = values.length;
		var idx = undefined;
		for(idx = 0; idx < valuesLength; ++idx) {
			var pair = values[idx].split("-", 2);
			var cleanPair = pair;
			if(pair.length === 2) {
				var pair0 = pair[0].trim();
				var pair1 = pair[1].trim();
				pair0 = pair0 !== "" ? pair0 : undefined;
				pair1 = pair1 !== "" ? pair1 : undefined;
				if(pair1 < pair0) {
					output.push([ pair1, pair0 ]);
				} else {
					output.push([ pair0, pair1 ]);
				}
			} else if(pair.length === 1) {
				var pair0 = pair[0].trim();
				if(pair0 !== "") {
					output.push([ pair0, pair0 ]);
				}
			}
		}
		return output;
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
		this.targetElement.setAttribute("placeholder", "<[value 1]-[value 2]>[,...]");
		this.targetElement.addEventListener("input", this, false);
		this.lookup = lookup;
		this._manager = manager;
	};
	output.init(name, lookup, manager);
	return output;
}

function newAutocompleteSearcher(name, listHeight, classes, lookup, manager) {
	var output = {};
	output.targetElement = undefined;
	output.targetElementInput = undefined;
	output.targetList = undefined;
	output.lookup = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;
	output.negativeResults = undefined;

	output._datalistKeys = undefined;
	output._datalistValues = undefined;

	output._currentKeys = undefined;
	output._currentValues = undefined;

	output._FindPrefix = function(value) {
		var output = 0;
		var lastSpace = -1;
		var nonSpaceEncountered = false;
		var valueLength = value.length;
		var idx = undefined;
		for(idx = 0; idx < valueLength; ++idx) {
			if( value[idx] === ',' && (value[idx] === 0 || value[idx - 1] !== '\\') ) {
				output = idx + 1;
				nonSpaceEncountered = false;
			} else if( !nonSpaceEncountered && value[idx] !== value[idx].trim() ) {
				lastSpace = idx + 1;
			} else {
				nonSpaceEncountered = true;
			}
		}
		if(lastSpace > output) {
			output = lastSpace;
		}
		return output;
	};
	output._SplitValues = function(value) {
		var output = undefined;
		if( value.indexOf('\\,') !== -1 ) {
			output = [];
			var currentString = "";
			var slash = false;
			var valueLength = value.length;
			var idx = 0;
			while(idx < valueLength) {
				var v = value[idx];
				if(slash) {
					currentString += v;
					slash = false;
				} else if(v === '\\') {
					currentString += v;
					slash = true;
				} else if(v === ',') {
					output.push(currentString);
					currentString = "";
				} else {
					currentString += v;
				}
				idx += 1;
			}
			if(currentString !== "") {
				output.push(currentString);
			}
		} else {
			output = value.split(',');
		}
		return output;
	}
	output._SetDataList = function(prefix, currentValue, excludedValues) {
		var negator = "";
		var prefixedKeys = [];
		var prefixedValues = [];
		var datalistLength = this._datalistKeys.length;
		var idx = undefined;
		if( currentValue !== "-" && currentValue.startsWith("-") ) {
			negator = "-";
		}
		this._currentKeys = [];
		this._currentValues = [];
		for(idx = 0; idx < datalistLength; ++idx) {
			var k =  negator + this._datalistKeys[idx];
			var kLower = k.toLowerCase();
			if( kLower.indexOf(currentValue) !== -1 &&
			    !excludedValues.includes(this._datalistKeys[idx]) ) {
				var v = negator + this._datalistValues[idx];
				var strongStart = v.toLowerCase().indexOf(currentValue);
				var strongEnd = strongStart + currentValue.length;
				if(strongEnd > strongStart) {
					var strongStartSlice = document.createTextNode( v.slice(0, strongStart) );
					var strong = document.createElement('strong');
					var strongEndSlice = document.createTextNode( v.slice(strongEnd, v.length) );
					strong.appendChild( document.createTextNode( v.slice(strongStart, strongEnd) ) )
					prefixedValues.push([strongStartSlice, strong, strongEndSlice]);
				} else {
					prefixedValues.push([document.createTextNode(v)]);
				}
				this._currentKeys.push(k);
				this._currentValues.push(v);
				prefixedKeys.push(prefix + k);
			}
		}
		this.targetList.update(prefixedKeys, prefixedValues);
	};
	output._update = function() {
		//TODO: Make this smaller?
		var fullValue = this.targetElementInput.value;
		if(fullValue === "") {
			this.results = undefined;
			this.negativeResults = undefined;
			this._SetDataList("", "", []);
		} else {
			var negativeResults = undefined;
			var results = undefined;
			var cleanValues = [];
			var negativeValues = [];
			var searchValues = [];
			var currentValue = undefined;
			var values = this._SplitValues(fullValue);
			var valuesLength = values.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				currentValue = values[idx].trim();
				if(currentValue === "") {
					searchValues.push(currentValue);
				} else if(currentValue === "-") {
					cleanValues.push("");
					searchValues.push(currentValue);
				} else if(currentValue === "--") {
					negativeValues.push("");
					searchValues.push(currentValue);
				} else if( currentValue.startsWith("-") ) {
					negativeValues.push( currentValue.slice(1, currentValue.length).replace(/\\,/g, ',') );
					searchValues.push( currentValue.slice(1, currentValue.length).replace(/\\,/g, ',') );
				} else {
					cleanValues.push( currentValue.replace(/\\,/g, ',') );
					searchValues.push(currentValue);
				}
			}
			results = this.lookup.get(cleanValues);
			if(results.keys.length > 0) {
				this.results = results
			} else {
				this.results = undefined;
			}
			negativeResults = this.lookup.get(negativeValues);
			if(negativeResults.keys.length > 0) {
				this.negativeResults = negativeResults;
			} else {
				this.negativeResults = undefined;
			}
			this._SetDataList( fullValue.slice( 0, this._FindPrefix(fullValue) ),
							   currentValue.toLowerCase(),
							   searchValues.slice(0, valuesLength - 1)
							 );
		}
		if(this._currentKeys.length > 0) {
			this.targetList.activate();
		} else {
			this.targetList.deactivate();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output._InputListener = function(e) {
		this._update();
	};
	output._KeyDownListener = function(e) {
		if(e.keyCode === 9) {
			var fullVal = this.targetElementInput.value;
			var allValues = this._SplitValues(fullVal);
			var allValuesLength = allValues.length;
			var prefixValues = allValues.slice(0, allValuesLength - 1).join(',');
			var rawVal = allValues[allValuesLength - 1];
			var val = rawVal.trim();
			var valLower = val.toLowerCase();
			var valSpace = rawVal.slice(0, rawVal.length - rawVal.trimLeft().length);
			var containsVal = [];
			var startsVal = [];
			var exactStartsVal = [];
			var currentLength = this._currentKeys.length;
			var idx = undefined;
			for(idx = 0; idx < currentLength; ++idx) {
				var s = this._currentKeys[idx];
				var sLower = s.toLowerCase();
				if( sLower.indexOf(valLower) !== -1 ) {
					containsVal.push(s);
				}
				if( s.startsWith(val) ) {
					exactStartsVal.push(s);
				}
				if( sLower.startsWith(valLower) ) {
					startsVal.push(s);
				}
			}
			if(prefixValues.length > 0) {
				prefixValues += ',';
			}
			if(containsVal.length === 1) {
				this.targetElementInput.value = prefixValues + valSpace + containsVal[0] + ", ";
			} else {
				var useVal = undefined;
				if(exactStartsVal.length > 0) {
					useVal = exactStartsVal;
				} else {
					useVal = startsVal;
				}
				var lcp = LongestCommonPrefix(useVal);
				if(useVal.includes(lcp) && useVal.length === 1) {
					this.targetElementInput.value = prefixValues + valSpace + lcp + ", ";
				} else if(lcp.length > 0) {
					this.targetElementInput.value = prefixValues + valSpace + lcp;
				}
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
			var val = values.keys[idx].replace(/,/g, '\\,');
			if(val === "") {
				val = "-";
			}
			this._datalistKeys.push(val);
			this._datalistValues.push( val + " [" + values.values[idx].size.toString() + "]" );
		}
		this._SetDataList("", "", []);
	};
	output.init = function(name, listHeight, classes, lookup, manager) {
		this.targetElementInput = document.createElement('input');
		this.targetElementInput.setAttribute("type", "text");
		this.targetElementInput.setAttribute("id", name);
		this.targetElementInput.setAttribute("autocomplete", "on");
		this.targetElementInput.setAttribute("placeholder", "<keyword>[,...]");
		this.targetElementInput.addEventListener("input", this, false);
		this.targetElementInput.addEventListener("keydown", this, false);
		this.targetList = newAutocompleteList(listHeight, classes, this.targetElementInput);
		this.targetElement = document.createElement('div');
		this.targetElement.appendChild(this.targetElementInput);
		this.targetElement.appendChild(this.targetList.targetElement);
		this.lookup = lookup;
		this._manager = manager;
		this._BuildDatalistValues();
	};
	output.init(name, listHeight, classes, lookup, manager);
	return output;
}

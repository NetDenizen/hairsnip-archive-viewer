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
		var keywords = SplitUnescapedCommas(this.targetElement.value);
		var keywordsLength = keywords.length;
		var idx = undefined;
		this.results = newIdRecord([], []);
		for(idx = 0; idx < keywordsLength; ++idx) {
			var kw = keywords[idx].trim().replace(/\\,/g, ',');
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
	output.NegativeIndex = {};
	output.results = undefined;
	output.negativeResults = undefined;

	output._ParseKeywords = function() {
		var keywords = SplitUnescapedCommas(this.targetElement.value);
		var keywordsLength = keywords.length;
		var idx = undefined;
		var results = newIdRecord([], []);
		var negativeResults = newIdRecord([], []);
		for(idx = 0; idx < keywordsLength; ++idx) {
			var kw = keywords[idx].trim().replace(/\\,/g, ',').toLowerCase();
			if(kw !== '') {
				var index = this.index;
				var usedResults = results;
				if( kw !== '-' && kw.startsWith('-') ) {
					kw = kw.slice(1, kw.length);
					index = this.NegativeIndex;
					usedResults = negativeResults;
				}
				if( !index.hasOwnProperty(kw) ) {
					if(kw === '-') {
						index[kw] = this.lookup.get('');
					} else {
						index[kw] = this.lookup.GetFuzzy(kw);
					}
				}
				usedResults.extend(index[kw]);
			}
		}
		this.results = results.keys.length > 0 ? results : undefined;
		this.negativeResults = negativeResults.keys.length > 0 ? negativeResults : undefined;
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
			this.negativeResults = undefined;
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
		var values = valueString.split(",");
		var valuesLength = values.length;
		var idx = undefined;
		for(idx = 0; idx < valuesLength; ++idx) {
			var pair = values[idx].split("-", 2);
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
			this.results.extend( this.lookup.GetNumericalRange(values[idx][0], values[idx][1]) );
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
	output._targetElementInputContainer = undefined;
	output._targetListElementSort = undefined;
	output._targetListElementSortMode = 'alphabetical';
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
		var lastComma = 0;
		var lastSpace = -1;
		var nonSpaceEncountered = false;
		var valueLength = value.length;
		var idx = undefined;
		for(idx = 0; idx < valueLength; ++idx) {
			if( value[idx] === ',' && (value[idx] === 0 || value[idx - 1] !== '\\') ) {
				lastComma = idx + 1;
				nonSpaceEncountered = false;
			} else if( !nonSpaceEncountered && value[idx] !== value[idx].trim() ) {
				lastSpace = idx + 1;
			} else {
				nonSpaceEncountered = true;
			}
		}
		return lastSpace > lastComma ? lastSpace : lastComma;
	};
	output._MatchGlob = function(value) {
		var output = [];
		var cleanValue = value.replace(/\\,/g, ',');
		var sliceEnd = cleanValue.indexOf('*');
		if(sliceEnd === -1) {
			output.push(cleanValue);
		} else {
			var slices = ProcessGlob( cleanValue.toLowerCase() );
			var idx = 0;
			var datalistLength = this._datalistKeys.length;
			for(idx = 0; idx < datalistLength; ++idx) {
				var kRaw = this._datalistKeys[idx].replace(/\\,/g, ',');
				var k = kRaw.toLowerCase();
				if( TestGlob(k, slices) ) {
					output.push(kRaw);
				}
			}
		}
		return output;
	};
	output._MarkupData = function(referenceValueSlices, negator, matchValue) {
		var output = [];
		var referenceValueSlicesLength = referenceValueSlices.length;
		var idx = undefined;
		var strongStart = 0;
		var strongEnd = 0;
		if(negator.length !== 0) {
			output.push( document.createTextNode(negator) );
		}
		for(idx = 0; idx < referenceValueSlicesLength; ++idx) {
			var weakStart = strongEnd;
			var slice = referenceValueSlices[idx];
			if(slice !== "") {
				strongStart = matchValue.toLowerCase().indexOf(slice);
				strongEnd = strongStart + slice.length;
				if(strongStart > weakStart) {
					output.push( document.createTextNode( matchValue.slice(weakStart, strongStart) ) );
				}
				if(strongEnd > strongStart) {
					var strong = document.createElement('strong');
					strong.appendChild( document.createTextNode( matchValue.slice(strongStart, strongEnd) ) );
					output.push(strong);
				}
			}
		}
		if(strongEnd < matchValue.length) {
			output.push( document.createTextNode( matchValue.slice(strongEnd, matchValue.length) ) );
		}
		return output;
	};
	output._SetDataList = function(prefix, currentValue, excludedValues) {
		var prefixedKeys = [];
		var prefixedValues = [];
		var datalistLength = this._datalistKeys.length;
		var idx = undefined;
		var rawCurrentValue = currentValue;
		var rawCurrentValueSlices = undefined;
		var negator = "";
		if( currentValue !== "-" && currentValue.startsWith("-") ) {
			rawCurrentValue = currentValue.slice(1, currentValue.length);
			negator = "-";
		}
		rawCurrentValueSlices = ProcessGlob(rawCurrentValue);
		this._currentKeys = [];
		this._currentValues = [];
		for(idx = 0; idx < datalistLength; ++idx) {
			var rawK = this._datalistKeys[idx];
			var k =  negator + rawK;
			if( ( rawK.toLowerCase().indexOf(rawCurrentValue) !== -1 ||
				  TestGlob(rawK.toLowerCase(), rawCurrentValueSlices) ) &&
			    !excludedValues.includes(rawK) ) {
				var v = this._datalistValues[idx];
				this._currentKeys.push(k);
				this._currentValues.push(v);
				prefixedValues.push( this._MarkupData(rawCurrentValueSlices, negator, v) );
				prefixedKeys.push(prefix + k);
			}
		}
		this.targetList.update(prefixedKeys, prefixedValues);
	};
	output._ParseKeywords = function() {
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
			var values = SplitUnescapedCommas(fullValue);
			var valuesLength = values.length;
			var idx = undefined;
			for(idx = 0; idx < valuesLength; ++idx) {
				var searchValue = values[idx].trim();
				currentValue = searchValue;
				if(searchValue === "-") {
					cleanValues.push("");
				} else if(searchValue === "--") {
					negativeValues.push("");
				} else if( searchValue.startsWith("-") ) {
					searchValue = searchValue.slice(1, searchValue.length);
					negativeValues = negativeValues.concat( this._MatchGlob(searchValue) );
				} else if(searchValue !== "") {
					cleanValues = cleanValues.concat( this._MatchGlob(searchValue) );
				}
				searchValues.push(searchValue);
			}
			results = this.lookup.get(cleanValues);
			this.results = results.keys.length > 0 ? results : undefined;
			negativeResults = this.lookup.get(negativeValues);
			this.negativeResults = negativeResults.keys.length > 0 ? negativeResults : undefined;
			this._SetDataList( fullValue.slice( 0, this._FindPrefix(fullValue) ),
							   currentValue.toLowerCase(),
							   searchValues.slice(0, valuesLength - 1)
							 );
		}
	};
	output._update = function(selected) {
		this._ParseKeywords();
		if(selected && this._currentKeys.length > 0) {
			this.targetList.activate();
		} else {
			this.targetList.deactivate();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output._InputListener = function(e) {
		this._update(true);
	};
	output._KeyDownListener = function(e) {
		if(e.keyCode === 9) {
			var fullVal = this.targetElementInput.value;
			var allValues = SplitUnescapedCommas(fullVal);
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
				var useVal = exactStartsVal.length > 0 ? exactStartsVal : startsVal;
				var lcp = LongestCommonPrefix(useVal);
				if(useVal.includes(lcp) && useVal.length === 1) {
					this.targetElementInput.value = prefixValues + valSpace + lcp + ", ";
				} else if(lcp.length > 0) {
					this.targetElementInput.value = prefixValues + valSpace + lcp;
				}
			}
			if(fullVal.length > 0) {
				e.preventDefault();
				this._update(true);
			} else {
				this._update(false);
			}
		}
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "input") {
			this._InputListener(e);
		} else if(eType === "keydown") {
			this._KeyDownListener(e);
		} else if(eType === "click") {
			this._ToggleSort(e);
		}
	};
	output._BuildDatalistValues = function(update) {
		var values = this.lookup.GetAll();
		if(this._targetListElementSortMode === 'numerical') {
			values.SortNumerical();
		}
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
		if(update) {
			this._update(true);
		} else {
			this._SetDataList("", "", []);
		}
	};
	output._ToggleSort = function() {
		if(this._targetListElementSortMode === 'alphabetical') {
			this._targetListElementSortMode = 'numerical';
			SetHTMLToText(this._targetListElementSort, "ABC");
		} else {
			this._targetListElementSortMode = 'alphabetical';
			SetHTMLToText(this._targetListElementSort, "123");
		}
		this._BuildDatalistValues(true);
	};
	output.init = function(name, listHeight, classes, lookup, manager) {
		this.targetElementInput = document.createElement('input');
		this.targetElementInput.setAttribute("type", "text");
		this.targetElementInput.setAttribute("id", name);
		this.targetElementInput.setAttribute("autocomplete", "on");
		this.targetElementInput.setAttribute("placeholder", "<keyword>[,...]");
		this.targetElementInput.addEventListener("input", this, false);
		this.targetElementInput.addEventListener("keydown", this, false);
		this._targetListElementSort = document.createElement('button');
		SetHTMLToText(this._targetListElementSort, "123");
		this._targetListElementSort.addEventListener("click", this, false);
		this._targetElementInputContainer = document.createElement('div');
		this._targetElementInputContainer.appendChild(this._targetListElementSort);
		this._targetElementInputContainer.appendChild( document.createTextNode(" ") );
		this._targetElementInputContainer.appendChild(this.targetElementInput);
		this.targetList = newAutocompleteList(listHeight, classes, this.targetElementInput);
		this.targetList.relevantTargets.push(this._targetListElementSort);
		this.targetElement = document.createElement('div');
		this.targetElement.appendChild(this._targetElementInputContainer);
		this.targetElement.appendChild(this.targetList.targetElement);
		this.lookup = lookup;
		this._manager = manager;
		this._BuildDatalistValues(false);
	};
	output.init(name, listHeight, classes, lookup, manager);
	return output;
}

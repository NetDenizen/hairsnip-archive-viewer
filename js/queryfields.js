"use strict";

function newBasicSearcher() {
	var output = {};
	output.targetElement = undefined;
	output._manager = undefined;
	output.edited = false;
	output.results = undefined;
	output.necessaryResults = undefined;
	output.negatedResultsCount = 0;

	output.targetListElementSort = undefined;
	output._targetListElementSortMode = 'alphabetical';
	output.targetListElementSortOrder = undefined;
	output._targetListElementSortOrderMode = 'normal';
	output.targetListSortedValues = undefined;

	output._CheckResultsNegate = function(encounteredValue) {
		if(!encounteredValue) {
			this.results = this.lookup.GetAll();
		}
	};
	output._SetNecessaryResults = function(necessaryResults) {
		if(necessaryResults.AllValues().length > 0) {
			this.necessaryResults = necessaryResults;
			this.results.intersect(necessaryResults);
		} else {
			this.necessaryResults = undefined;
		}
	};
	output._CheckOnlySoftNecessaryResults = function(encounteredValue) {
		if(!encounteredValue) {
			this.results = undefined;
		}
	};
	output._SetNegatedResultsCount = function(negatedResults) {
		this.negatedResultsCount = negatedResults.AllValues().length;
	};
	output._GetSortedLookup = function() {
		var values = this.lookup.GetAll();
		if(this._targetListElementSortMode === 'numerical') {
			if(this._targetListElementSortOrderMode === 'normal') {
				values.SortNumerical();
			} else {
				values.SortNumericalReverse();
			}
		} else if(this._targetListElementSortOrderMode === 'reverse') {
			values.reverse();
		}
		this.targetListSortedValues = values;
		return values;
	};
	output._ToggleSort = function() {
		if(this._targetListElementSortMode === 'alphabetical') {
			this._targetListElementSortMode = 'numerical';
			SetHTMLToText(this.targetListElementSort, "ABC");
			this.targetListElementSort.title = 'Sort list alphabetically.';
		} else {
			this._targetListElementSortMode = 'alphabetical';
			SetHTMLToText(this.targetListElementSort, "123");
			this.targetListElementSort.title = 'Sort list by occurrences.';
		}
	};
	output._ToggleOrder = function() {
		if(this._targetListElementSortOrderMode === 'normal') {
			this._targetListElementSortOrderMode = 'reverse';
			SetHTMLToText(this.targetListElementSortOrder, "v");
			this.targetListElementSortOrder.title = 'Sort list in normally (first to last).';
		} else {
			this._targetListElementSortOrderMode = 'normal';
			SetHTMLToText(this.targetListElementSortOrder, "^");
			this.targetListElementSortOrder.title = 'Sort list in reverse (last to first).';
		}
	};
	output._SortPostAction = function() {
		this._GetSortedLookup();
		this._manager.UpdateSearchCallback(this._manager);
	};
	output._InputListener = function(e) {
		if(this.targetElement.value === "") {
			this.results = undefined;
			this.negatedResultsCount = 0;
			this.necessaryResults = undefined;
		} else {
			this._ParseTarget();
		}
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
	};
	output._ClickListener = function(e) {
		if(e.currentTarget === this.targetListElementSort) {
			this._ToggleSort();
		} else {
			this._ToggleOrder();
		}
		this._SortPostAction();
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "input") {
			this._InputListener(e);
		} else if(eType === "click") {
			this._ClickListener(e);
		}
	};
	output._InitSortButtons = function() {
		this.targetListElementSort = document.createElement('button');
		this.targetListElementSort.title = 'Sort list by occurrences.';
		SetHTMLToText(this.targetListElementSort, "123");
		this.targetListElementSort.addEventListener("click", this, false);
	};
	output._InitSortOrderButtons = function() {
		this.targetListElementSortOrder = document.createElement('button');
		SetHTMLToText(this.targetListElementSortOrder, "^");
		this.targetListElementSortOrder.title = 'Sort list in reverse.';
		this.targetListElementSortOrder.addEventListener("click", this, false);
	};
	return output;
}

function newBasicIndexedSearcher() {
	var output = newBasicSearcher();
	output.index = {};
	output._AddToIndex = function(kw) {
		var cleanKw = kw.replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+');
		var key = "v" + cleanKw;
		var found = undefined;
		if( !this.index.hasOwnProperty(key) ) {
			found = this._GetKwValue(cleanKw);
			this.index[key] = found;
		} else {
			found = this.index[key];
		}
		return found;
	};
	output._CleanKw = function(kw) {
		return kw.trim().replace(/\\,/g, ',');
	};
	output._ParseTarget = function() {
		var encounteredValue = false;
		var keywords = SplitUnescapedCommas(this.targetElement.value);
		var keywordsLength = keywords.length;
		var idx = undefined;
		var necessaryResults = newIdRecord([], []);
		var negatedResults = newIdRecord([], []);
		this.results = newIdRecord([], []);
		for(idx = 0; idx < keywordsLength; ++idx) {
			var kw = this._CleanKw(keywords[idx]);
			if( kw.startsWith("?") ) {
				necessaryResults.extend( this._AddToIndex( kw.slice(1) ) );
			} else if(kw !== "") {
				if(kw === '--') {
					var result = this._AddToIndex("");
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if(kw === '-') {
					var result = this._AddToIndex("");
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				} else if( kw.startsWith("-") ) {
					var result = this._AddToIndex( kw.slice(1) );
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if( kw.startsWith("+") ) {
					var result = this._AddToIndex( kw.slice(1) );
					this.results.extend(result);
					necessaryResults.extend(result);
					negatedResults.NegateValues(result.values);
				} else {
					var result = this._AddToIndex(kw);
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				}
				encounteredValue = true;
			}
		}
		this._SetNecessaryResults(necessaryResults);
		this._SetNegatedResultsCount(negatedResults);
		this._CheckOnlySoftNecessaryResults(encounteredValue);
	};
	return output;
}

function newBasicLookupSearcher() {
	var output = newBasicSearcher();
	output.lookup = undefined;

	return output;
}

function newChecksumSearcher(name, lookup, manager) {
	var output = newBasicLookupSearcher();

	output._ParseTarget = function() {
		var encounteredValue = false;
		var checksums = SplitUnescapedCommas(this.targetElement.value);
		var checksumsLength = checksums.length;
		var idx = undefined;
		var necessaryResults = newIdRecord([], []);
		var negatedResults = newIdRecord([], []);
		this.results = newIdRecord([], []);
		for(idx = 0; idx < checksumsLength; ++idx) {
			var cs = checksums[idx].replace(/\\,/g, ',').trim();
			if( cs.startsWith("?") ) {
				necessaryResults.extend( lookup.get( cs.slice(1).replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim() ) );
			} else if(cs !== "") {
				if(cs === '--') {
					var result = lookup.get("");
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if(cs === '-') {
					var result = lookup.get("");
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				} else if( cs.startsWith("-") ) {
					var result = lookup.get( cs.slice(1).replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim() );
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if( cs.startsWith("+") ) {
					var result = lookup.get( cs.slice(1).replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim() );
					this.results.extend(result);
					necessaryResults.extend(result);
					negatedResults.NegateValues(result.values);
				} else {
					var result = lookup.get( cs.replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+') );
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				}
				encounteredValue = true;
			}
		}
		this._SetNecessaryResults(necessaryResults);
		this._SetNegatedResultsCount(negatedResults);
		this._CheckOnlySoftNecessaryResults(encounteredValue);
	};
	output.init = function(name, lookup, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<checksum>[,...]");
		this.targetElement.addEventListener("input", this, false);
		this._InitSortOrderButtons();
		this.lookup = lookup;
		this._manager = manager;
		this._GetSortedLookup();
	};
	output.init(name, lookup, manager);
	return output;
}

function newFulltextSearcher(name, searcher, manager) {
	var output = newBasicIndexedSearcher();
	output.searcher = undefined;

	output._CheckResultsNegate = function(encounteredValue) {
		if(!encounteredValue) {
			this.results = this.searcher.titleLookup.GetAll();
		}
	};
	output._CleanKw = function(kw) {
		return kw.trim().trim().replace(/\\,/g, ',').replace(/"/g, '""');
	};
	output._GetKwValue = function(kw) {
		return this.searcher.LookupBody('"' + kw + '"');
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
	var output = newBasicIndexedSearcher();
	output.lookup = undefined;

	output._GetKwValue = function(kw) {
		return kw === '' ? this.lookup.get('') : this.lookup.GetFuzzy(kw);
	};
	output.init = function(name, lookup, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<keyword>[,...]");
		this.targetElement.addEventListener("input", this, false);
		this._InitSortOrderButtons();
		this.lookup = lookup;
		this._manager = manager;
		this._GetSortedLookup();
	};
	output.init(name, lookup, manager);
	return output;
}

function newRangeSearcher(name, lookup, manager) {
	var output = newBasicLookupSearcher();

	output._ParseTarget = function() {
		var encounteredValue = false;
		var values = SplitUnescapedCommas(this.targetElement.value);
		var valuesLength = values.length;
		var idx = undefined;
 		var necessaryResults = newUnnegatableIdRecord([], []);
		var negatedResults = newIdRecord([], []);
		this.results = newIdRecord([], []);
		for(idx = 0; idx < valuesLength; ++idx) {
			var pair = [];
			var result = undefined;
			var startChar = undefined;
			var value = values[idx].replace(/\\,/g, ',').trim();
			if(value === '--') {
				value = '-';
			} else if(value === '-') {
				startChar = '-';
			} else if( value.startsWith('-') || value.startsWith('?') || value.startsWith('+') ) {
				startChar = value.charAt(0);
				value = value.slice(1);
			}
			if(value === '-') {
				result = this.lookup.GetNumericalRange(undefined, undefined);
			} else {
				pair = SplitUnescapedDashes(value);
				if(pair.length === 2) {
					var pair0 = pair[0].replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim();
					var pair1 = pair[1].replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim();
					if(pair0 !== "" && pair1 !== "") {
						result = parseFloat(pair1) < parseFloat(pair0) ? this.lookup.GetNumericalRange(pair1, pair0) :
																		 this.lookup.GetNumericalRange(pair0, pair1);
					}
				} else if(pair.length === 1) {
					var pair0 = pair[0].replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+').trim();
					if(pair0 !== "") {
						result = this.lookup.GetNumericalRange(pair0, pair0);
					}
				}
			}
			if(result !== undefined) {
				if(startChar === '-') {
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if(startChar === '?') {
					necessaryResults.extend(result);
				} else if(startChar === '+') {
					this.results.extend(result);
					necessaryResults.extend(result);
					negatedResults.NegateValues(result.values);
				} else {
					this.results.extend(result);
				}
			}
			if(value !== "" && startChar !== '?') {
				encounteredValue = true;
			}
		}
		this._SetNecessaryResults(necessaryResults);
		this._SetNegatedResultsCount(negatedResults);
		this._CheckOnlySoftNecessaryResults(encounteredValue);
	};
	output.init = function(name, lookup, manager) {
		this.targetElement = document.createElement('input');
		this.targetElement.setAttribute("type", "text");
		this.targetElement.setAttribute("id", name);
		this.targetElement.setAttribute("placeholder", "<<value 1>-<value 2>>[,...]");
		this.targetElement.addEventListener("input", this, false);
		this._InitSortOrderButtons();
		this.lookup = lookup;
		this._manager = manager;
		this._GetSortedLookup();
	};
	output.init(name, lookup, manager);
	return output;
}

function newDateSearcher(name, lookup, manager) {
	var output = newRangeSearcher(name, lookup, manager);
	output._ExtractValues = function(dateString) {
		var output = newIdRecord([], []);
		var parsed = chrono.parse( dateString.replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+') );
		var parsedLength = parsed.length;
		var idx = undefined;
		for(idx = 0; idx < parsedLength; ++idx) {
			var pair = undefined;
			if( (parsed[idx].start !== null && parsed[idx].start !== undefined) &&
				(parsed[idx].end !== null && parsed[idx].end !== undefined) ) {
				pair = [GetUnixEpochSeconds( parsed[idx].start.date() ),
						GetUnixEpochSeconds( parsed[idx].end.date() )];
			}
			if(pair !== undefined) {
				if(pair[1] < pair[0]) {
					var tmp = pair[0];
					pair[0] = pair[1];
					pair[1] = tmp;
				}
				output.extend( this.lookup.GetNumericalRange(pair[0], pair[1]) );
			}
		}
		return output;
	};
	output._ParseTarget = function() {
		var encounteredValue = false;
		var values = SplitUnescapedCommas(this.targetElement.value);
		var valuesLength = values.length;
		var idx = undefined;
 		var necessaryResults = newUnnegatableIdRecord([], []);
		var negatedResults = newIdRecord([], []);
		this.results = newIdRecord([], []);
		for(idx = 0; idx < valuesLength; ++idx) {
			var vTrimmed = values[idx].replace(/\\,/g, ',').trim();
			if( vTrimmed.startsWith('?') ) {
				necessaryResults.extend( this._ExtractValues( vTrimmed.slice(1) ) );
			} else if(vTrimmed !== "") {
				if(vTrimmed === '-') {
					var result = this.lookup.GetNumericalRange(undefined, undefined);
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				} else if(vTrimmed === '--') {
					var result = this.lookup.GetNumericalRange(undefined, undefined);
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if( vTrimmed.startsWith('-') ) {
					var result = this._ExtractValues( vTrimmed.slice(1) );
					this._CheckResultsNegate(encounteredValue);
					this.results.NegateValues(result.values);
					negatedResults.extend(result);
				} else if( vTrimmed.startsWith('+') ) {
					var result = this._ExtractValues( vTrimmed.slice(1) );
					this.results.extend(result);
					necessaryResults.extend(result);
					negatedResults.NegateValues(result.values);
				} else {
					var result = this._ExtractValues(vTrimmed);
					this.results.extend(result);
					negatedResults.NegateValues(result.values);
				}
				encounteredValue = true;
			}
		}
		this._SetNecessaryResults(necessaryResults);
		this._SetNegatedResultsCount(negatedResults);
		this._CheckOnlySoftNecessaryResults(encounteredValue);
	};
	output.targetElement.setAttribute("placeholder", "<date range>[,...]");
	return output;
}

function newAutocompleteSearcher(name, classes, lookup, manager) {
	var output = newBasicLookupSearcher();
	output.targetList = undefined;

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
		var cleanValue = value.replace(/\\,/g, ',').replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+');
		if( !cleanValue.includes('*') ) {
			output.push(cleanValue);
		} else {
			var slices = ProcessGlob( cleanValue.toLowerCase() );
			var idx = 0;
			var datalistLength = this._datalistKeys.length;
			for(idx = 0; idx < datalistLength; ++idx) {
				var kRaw = this._datalistKeys[idx].replace(/\\,/g, ',').replace(/\\-/g, '-').replace(/\\\?/g, '?').replace(/\\\+/g, '+');
				var k = kRaw.toLowerCase();
				if( TestGlob(k, slices) ) {
					output.push(kRaw);
				}
			}
		}
		return output;
	};
	output._MarkupData = function(referenceValueSlices, negator, softNecessitator, necessitator, matchValue) {
		var output = [];
		var referenceValueSlicesLength = referenceValueSlices.length;
		var idx = undefined;
		var strongStart = 0;
		var strongEnd = 0;
		if(negator.length !== 0) {
			output.push( document.createTextNode(negator) );
		}
		if(softNecessitator.length !== 0) {
			output.push( document.createTextNode(softNecessitator) );
		}
		if(necessitator.length !== 0) {
			output.push( document.createTextNode(necessitator) );
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
			output.push( document.createTextNode( matchValue.slice(strongEnd) ) );
		}
		return output;
	};
	output._SetDataList = function(prefix, currentValue, excludedValues) {
		var prefixedKeys = [];
		var prefixedValues = [];
		this._currentKeys = [];
		this._currentValues = [];
		if(currentValue !== null) {
			var datalistLength = this._datalistKeys.length;
			var idx = undefined;
			var rawCurrentValue = currentValue;
			var rawCurrentValueSlices = undefined;
			var negator = "";
			var softNecessitator = "";
			var necessitator = "";
			if(currentValue !== "-") {
				if( currentValue.startsWith("-") ) {
					rawCurrentValue = currentValue.slice(1);
					negator = "-";
				} else if( currentValue.startsWith("?") ) {
					rawCurrentValue = currentValue.slice(1);
					softNecessitator = "?";
				} else if( currentValue.startsWith("+") ) {
					rawCurrentValue = currentValue.slice(1);
					necessitator = "+";
				}
			}
			rawCurrentValueSlices = ProcessGlob(rawCurrentValue);
			for(idx = 0; idx < datalistLength; ++idx) {
				var rawK = this._datalistKeys[idx];
				var rawKLower = rawK.toLowerCase();
				var k =  negator + softNecessitator + necessitator + rawK;
				if( ( rawKLower.includes(rawCurrentValue) ||
					  TestGlob(rawKLower, rawCurrentValueSlices) ) &&
				    !excludedValues.includes(rawK) ) {
					var v = this._datalistValues[idx];
					this._currentKeys.push(k);
					this._currentValues.push(v);
					prefixedValues.push( this._MarkupData(rawCurrentValueSlices, negator, softNecessitator, necessitator, v) );
					prefixedKeys.push(prefix + k);
				}
			}
		}
		this.targetList.update(prefixedKeys, prefixedValues);
	};
	output._ParseKeywords = function() {
		var fullValue = this.targetElementInput.value;
		var negatedResults = newIdRecord([], []);
		if(fullValue === "") {
			this.results = undefined;
			this.necessaryResults = undefined;
			this._SetDataList("", "", []);
		} else {
			var encounteredValue = false;
			var necessaryResults = newUnnegatableIdRecord([], []);
			var searchValues = [];
			var currentValue = undefined;
			var values = SplitUnescapedCommas(fullValue);
			var valuesLength = values.length;
			var idx = undefined;
			this.results = newIdRecord([], []);
			for(idx = 0; idx < valuesLength; ++idx) {
				var searchValue = values[idx].trim();
				currentValue = searchValue;
				if( searchValue.startsWith("?") ) {
					searchValue = searchValue.slice(1);
					necessaryResults.extend( this.lookup.get( this._MatchGlob(searchValue) ) );
				} else if(searchValue !== "") {
					if(searchValue === "-") {
						var result = this.lookup.get("");
						this.results.extend(result);
						negatedResults.NegateValues(result.values);
					} else if(searchValue === "--") {
						var result = this.lookup.get("");
						searchValue = searchValue.slice(1);
						currentValue = null;
						this._CheckResultsNegate(encounteredValue);
						this.results.NegateValues(result.values);
						negatedResults.extend(result);
					} else if( searchValue.startsWith("-") ) {
						var result = undefined;
						this._CheckResultsNegate(encounteredValue);
						searchValue = searchValue.slice(1);
						result = this.lookup.get( this._MatchGlob(searchValue) );
						this.results.NegateValues(result.values);
						negatedResults.extend(result);
					} else if( searchValue.startsWith("+") ) {
						var result = undefined;
						searchValue = searchValue.slice(1);
						result = this.lookup.get( this._MatchGlob(searchValue) );
						necessaryResults.extend(result);
						this.results.extend(result);
						negatedResults.NegateValues(result.values);
					} else {
						var result = this.lookup.get( this._MatchGlob(searchValue) );
						this.results.extend(result);
						negatedResults.NegateValues(result.values);
					}
					encounteredValue = true;
				}
				searchValues.push(searchValue);
			}
			if(currentValue !== null) {
				currentValue = currentValue.toLowerCase();
			}
			this._SetNecessaryResults(necessaryResults);
			this._CheckOnlySoftNecessaryResults(encounteredValue);
			this._SetDataList( SliceRear( fullValue, this._FindPrefix(fullValue) ),
							   currentValue,
							   SliceRear(searchValues, valuesLength - 1)
							 );
		}
		this._SetNegatedResultsCount(negatedResults);
	};
	output._update = function(selected) {
		this._ParseKeywords();
		this.edited = true;
		this._manager.UpdateSearchCallback(this._manager);
		if(selected && this._currentKeys.length > 0) {
			this.targetList.activate();
		} else {
			this.targetList.deactivate();
		}
	};
	output._InputListener = function(e) {
		this._update(true);
	};
	output._BuildDatalistValues = function(update) {
		var values = this._GetSortedLookup();
		var valuesLength = values.keys.length;
		var idx = undefined;
		this._datalistKeys = [];
		this._datalistValues = [];
		for(idx = 0; idx < valuesLength; ++idx) {
			var val = values.keys[idx].replace(/,/g, '\\,')
									  .replace(/-/g, '\\-')
									  .replace(/\?/g, '\\?')
									  .replace(/\+/g, '\\+');
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
	output._KeyDownListener = function(e) {
		if(e.keyCode === 9) {
			var fullVal = this.targetElementInput.value;
			var allValues = SplitUnescapedCommas(fullVal);
			var allValuesLength = allValues.length;
			var prefixValues = SliceRear(allValues, allValuesLength - 1).join(',');
			var rawVal = allValues[allValuesLength - 1];
			var val = rawVal.trim();
			var valLower = val.toLowerCase();
			var valSpace = SliceRear(rawVal, rawVal.length - rawVal.trimLeft().length);
			var valSliceAmount = 0;
			var containsVal = [];
			var startsVal = [];
			var exactStartsVal = [];
			var currentLength = this._currentKeys.length;
			var idx = undefined;
			if( ( valLower !== "-" && valLower.startsWith("-") ) || valLower.startsWith("+") || valLower.startsWith("?") ) {
				valSliceAmount = 1;
			}
			valLower = valLower.slice(valSliceAmount);
			for(idx = 0; idx < currentLength; ++idx) {
				var s = this._currentKeys[idx];
				var sLower = s.toLowerCase().slice(valSliceAmount);
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
	output._SortPostAction = function() {
		this._BuildDatalistValues(true);
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "input") {
			this._InputListener(e);
		} else if(eType === "keydown") {
			this._KeyDownListener(e);
		} else if(eType === "click") {
			this._ClickListener(e);
		}
	};
	output.init = function(name, classes, lookup, manager) {
		this.targetElementInput = document.createElement('input');
		this.targetElementInput.setAttribute("type", "text");
		this.targetElementInput.setAttribute("id", name);
		this.targetElementInput.setAttribute("autocomplete", "on");
		this.targetElementInput.setAttribute("placeholder", "<keyword>[,...]");
		this.targetElementInput.addEventListener("input", this, false);
		this.targetElementInput.addEventListener("keydown", this, false);
		this._InitSortButtons();
		this._InitSortOrderButtons();
		this.targetList = newAutocompleteList(classes, this.targetElementInput);
		this.targetList.relevantTargets.push(this.targetListElementSort);
		this.targetList.relevantTargets.push(this.targetListElementSortOrder);
		this.targetElement = document.createElement('div');
		this.targetElement.appendChild(this.targetElementInput);
		this.targetElement.appendChild(this.targetList.targetElement);
		this.lookup = lookup;
		this._manager = manager;
		this._BuildDatalistValues(false);
	};
	output.init(name, classes, lookup, manager);
	return output;
}

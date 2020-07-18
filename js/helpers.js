"use strict";

// DOM Manipulations
function AppendChildren(e, children) {
	var childrenLength = children.length;
	var idx = undefined;
	for(idx = 0; idx < childrenLength; ++idx) {
		e.appendChild(children[idx]);
	}
}

function ClearChildren(e) {
	while(true) {
		var child = e.firstChild;
		if(child === null) {
			break;
		}
		e.removeChild(child);
	}
}

function HasChildren(e) {
	return e.firstChild !== null ? true : false;
}

function SetHTMLToText(e, text) {
	ClearChildren(e);
	e.appendChild( document.createTextNode(text) );
}

// String Matching
function LongestCommonPrefix(values) {
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
}

function SplitUnescaped(character, value) {
	var output = undefined;
	if( value.includes('\\' + character) ) {
		var currentString = "";
		var slash = false;
		var valueLength = value.length;
		var idx = 0;
		output = [];
		while(idx < valueLength) {
			var v = value[idx];
			if(slash) {
				currentString += v;
				slash = false;
			} else if(v === '\\') {
				currentString += v;
				slash = true;
			} else if(v === character) {
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
		output = value.split(character);
	}
	return output;
}

function SplitUnescapedCommas(value) {
	return SplitUnescaped(',', value);
}

function SplitUnescapedDashes(value) {
	return SplitUnescaped('-', value);
}

//// Wildcard Matching
function ProcessGlob(value) {
	var output = [];
	var sliceEnd = value.indexOf('*');
	if(sliceEnd === -1) {
		output.push(value);
	} else {
		var idx = 0;
		while(sliceEnd !== -1) {
			output.push( value.slice(idx, sliceEnd) );
			idx = sliceEnd + 1;
			sliceEnd = value.indexOf('*', idx);
		}
		if(idx < value.length) {
			output.push( value.slice(idx, value.length) );
		}
		if(value[value.length - 1] === "*") {
			output.push("");
		}
	}
	return output;
}

function TestGlob(value, slices) {
	var output = true;
	var valueIdx = 0;
	var slicesLength = slices.length;
	var currentSlice = undefined;
	for(currentSlice = 0; currentSlice < slicesLength; ++currentSlice) {
		valueIdx = value.indexOf(slices[currentSlice], valueIdx);
		if(valueIdx === -1 ||
		   ( currentSlice === 0 && !value.startsWith(slices[currentSlice]) ) ||
		   ( currentSlice === slicesLength - 1 && !value.endsWith(slices[currentSlice]) )
		  ) {
			output = false;
			break;
		}
	}
	return output;
}

// String Manipulations
function SliceRear(input, end) {
	return input.slice(0, end);
}

// Miscellaneous
function range(start, end) {
	var idx = undefined;
	var output = [];
	for(idx = start; idx < end; ++idx) {
		output.push(idx);
	}
	return output;
}

function ConcatInplace(to, from) {
	var fromLength = from.length;
	var idx = undefined;
	for(idx = 0; idx < fromLength; ++idx){
	  to.push(from[idx]);
	}
}

function InitArray(val, length) {
	var output = [];
	var idx = undefined;
	for(idx = 0; idx < length; ++idx) {
		output.push(val);
	}
	return output;
}

// Datetime Manipulations
var unixEpochStartSeconds = 0;
var unixEpochEndSeconds = 2147483647;

function GetUnixEpochSeconds(datetime) {
	return (datetime.getTime() - datetime.getTimezoneOffset() * 60 * 1000) / 1000;
}

function GetUnixEpochSecondsDatetime(seconds) {
	return new Date(parseInt(seconds) * 1000);
}

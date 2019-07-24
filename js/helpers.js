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
		if(child !== null) {
			e.removeChild(child);
		} else {
			break;
		}
	}
}

function HasChildren(e) {
	return e.firstChild !== null ? true : false;
}

function SetHTMLToText(e, text) {
	ClearChildren(e);
	e.appendChild( document.createTextNode(text) );
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

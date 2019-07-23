"use strict";

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
	var output = false;
	if(e.firstChild !== null) {
		output = true;
	}
	return output;
}

function SetHTMLToText(e, text) {
	ClearChildren(e);
	e.appendChild( document.createTextNode(text) );
}

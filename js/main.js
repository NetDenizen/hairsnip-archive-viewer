"use strict";

var config = {
	locateFile: filename => `/js/${filename}`
}

var dbId = "DbFile";

var db = undefined;
var searcher = undefined;
var documentUi = undefined;

function LoadSearcher() {
	searcher = newStorySearcher(db);
	documentUi = newUiManager(searcher, 'documentUi', defaultListClasses, defaultPageNumber, defaultResultsPerPage);
	OnBodyResize();
}

function OpenDb(path) {
	var reader = new FileReader();
	reader.onload = function() {
		var raw = new Uint8Array(reader.result);
		db = new SQL.Database(raw);
		LoadSearcher();
	};
	reader.readAsArrayBuffer(path);
}

function OnSQLSelect() {
	var path = document.getElementById(dbId).files[0];
	OpenDb(path);
}

function OnPageLoad() {
	initSqlJs(config);
	OnBodyResize();
}

document.addEventListener("DOMContentLoaded", OnPageLoad);

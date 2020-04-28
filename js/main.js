"use strict";

var config = {
	locateFile: function(filename) { return '/js/' + filename; }
};

var dbId = "DbFile";

var SQL = undefined;
var db = undefined;
var searcher = undefined;
var documentUi = undefined;

function LoadSearcher() {
	var startTime = new Date();
	SetHTMLToText( document.getElementById("DbLoadStatus"), "Failed to open SQLite file" );
	searcher = newStorySearcher(db);
	documentUi = newUiManager(searcher, 'documentUi', defaultListClasses, defaultPageNumber, defaultResultsPerPage);
	SetHTMLToText( document.getElementById("DbLoadStatus"),
				   "SQLite file loaded in " + ( ( new Date() - startTime ) / 1000.0 ).toString()  + " seconds."
				 );
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
	try {
		SQL = initSqlWasmJs(config);
	} catch(err) {
		SQL = initSqlAsmJs(config);
	}
	if(initSqlWasmError) {
		SQL = initSqlAsmJs(config);
	}
	SetHTMLToText( document.getElementById("DbLoadStatus"), "Waiting for SQLite file" );
}

document.addEventListener("DOMContentLoaded", OnPageLoad);

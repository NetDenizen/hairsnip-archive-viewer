"use strict";

var config = {
	locateFile: filename => `/js/${filename}`
}

var dbId = "DbFile";

var logger = undefined;
var db = undefined;
var searcher = undefined;
var documentUi = undefined;

function LoadSearcher() {
	var startTime = new Date();
	SetHTMLToText( document.getElementById("DbLoadStatus"), "Opening SQLite file" );
	searcher = newStorySearcher(logger, db);
	logger.LogInfo("Building UI.");
	documentUi = newUiManager(searcher, 'documentUi', defaultListClasses, defaultPageNumber, defaultResultsPerPage);
	OnBodyResize();
	logger.LogInfo("Init completed.");
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
	logger.LogInfo("Loading DB file at path: '" + path.name + "'");
	OpenDb(path);
}

function OnPageLoad() {
	logger = newLogManager(errorId, undefined);
	logger.LogInfo("Log started.");
	initSqlJs(config);
	logger.LogInfo("SQL.js initialized.");
	OnBodyResize();
	SetHTMLToText( document.getElementById("DbLoadStatus"), "Waiting for SQLite file" );
}

document.addEventListener("DOMContentLoaded", OnPageLoad);

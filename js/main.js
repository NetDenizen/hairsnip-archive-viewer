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
	searcher = newStorySearcher(logger, db);
	logger.LogInfo("Building UI.");
	documentUi = newUiManager(logger, searcher, defaultUpdateInterval, defaultPageNumber, defaultResultsPerPage);
	logger.LogInfo("Init completed.");
}

function OpenDb(path) {
	try {
		var reader = new FileReader();
		reader.onload = function() {
			var raw = new Uint8Array(reader.result);
			db = new SQL.Database(raw);
			LoadSearcher();
		};
		reader.readAsArrayBuffer(path);
	} catch (err) {
		logger.LogError("Failed to open database file at '" + path + "' because: " + err);
	}
}

function main() {
	logger = newLogManager(errorId, undefined);
	initSqlJs(config);
	logger.LogInfo("SQL.js initialized.");
	OpenDb(document.getElementById(dbId).files[0]);
}

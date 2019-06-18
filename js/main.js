"use strict";

var config = {
	locateFile: filename => `/js/${filename}`
}

var dbId = "DbFile";

var logger = undefined;
var db = undefined;
var searcher = undefined;
var documentUi = undefined;

function OpenDb(path) {
	var result = false;
	try {
		var reader = new FileReader();
		reader.onload = function() {
			var raw = new Uint8Array(reader.result);
			db = new SQL.Database(raw);
		};
		reader.readAsArrayBuffer(path);
		result = true;
	} catch (err) {
		logger.LogError("Failed to open database file at '" + path + "' because: " + err);
	}
	return result;
}

function main() {
	logger = newLogManager(errorId, undefined);
	initSqlJs(config);
	if( OpenDb(document.getElementById(dbId).files[0]) ) {
		searcher = newStorySearcher(logger, db);
		documentUi = newUiManager(logger, searcher, defaultUpdateInterval, defaultPageNumber, defaultResultsPerPage);
	}
}

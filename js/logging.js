"use strict";

var errorId = "ErrorField";

var logRecord = {
	timestamp: undefined,
	level: undefined,
	message: undefined,
	toString: function() {
		return this.timestamp.toISOString() + " " + this.level + ": " + this.message;
	}
}
function newLogRecord(timestamp, level, message) {
	var output = Object.create(logRecord);
	output.timestamp = timestamp;
	output.level = level;
	output.message = message;
	return output;
}

//TODO: Clean this up?
var logManager = {
	_targetElement: undefined,
	_records: [],
	_updateCallback: undefined,
	edited: false,
	_FlushSingle: function() {
		var record = this._records.shift();
		var contentSpan = document.createElement('span');
		contentSpan.textContent = record.toString();
		this._targetElement.appendChild(contentSpan);
		this._targetElement.appendChild( document.createElement('br') );
	},
	FlushAll: function(level, values) {
		while(this._records.length > 0) {
			this._FlushSingle();
		}
	},
	_update: function() {
		this.edited = true;
		if(this._updateCallback === undefined) {
			this.FlushAll();
		} else {
			this._updateCallback();
		}
	},
	LogError: function(value) {
		this._records.push( newLogRecord(new Date(), "ERROR", value) );
		this._update();
	},
	LogWarning: function(value) {
		this._records.push( newLogRecord(new Date(), "WARNING", value) );
		this._update();
	},
	init: function(id, updateCallback) {
		this._targetElement = document.getElementById(id);
		this._updateCallback = updateCallback;
	},
}
function newLogManager(id, updateCallback) {
	var output = Object.create(logManager);
	output.init(id, updateCallback);
	return output;
}

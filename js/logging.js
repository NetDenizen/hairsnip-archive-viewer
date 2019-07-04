"use strict";

var errorId = "ErrorField";

function newLogRecord(timestamp, level, message) {
	var output = {}
	output.timestamp = timestamp;
	output.level = level;
	output.message = message;
	output.toString = function() {
		return this.timestamp.toISOString() + " " + this.level + ": " + this.message;
	}
	return output;
}

function newLogManager(id, updateCallback) {
	var output = {};
	output._targetElement = document.getElementById(id);
	output._records = [];
	output._updateCallback = updateCallback;
	output.edited = false;
	output._FlushSingle = function() {
		var record = this._records.shift();
		var contentSpan = document.createElement('span');
		contentSpan.textContent = record.toString();
		this._targetElement.appendChild(contentSpan);
		this._targetElement.appendChild( document.createElement('br') );
	};
	output.FlushAll = function(level, values) {
		while(this._records.length > 0) {
			setTimeout(this._FlushSingle(), 0);
		}
	};
	output._update = function() {
		this.edited = true;
		if(this._updateCallback === undefined) {
			this.FlushAll();
		} else {
			this._updateCallback();
		}
	};
	output._LogNow = function(level, value) {
		this._records.push( newLogRecord(new Date(), level, value) );
		this._update();
	};
	output.LogError = function(value) {
		this._LogNow("ERROR", value);
	};
	output.LogWarning = function(value) {
		this._LogNow("WARNING", value);
	};
	output.LogInfo = function(value) {
		this._LogNow("INFO", value);
	};
	return output;
}
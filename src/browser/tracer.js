var __recognizer = new function () {
	'use strict';

	var _calls = [];

	this.addCall = function (id, args) {
		_calls.push({id: id, args: args});
	};
	this.getCalls = function () {
		return _calls;
	};
	this.getCallCount = function () {
		return _calls.length;
	};
	this.test = function () {
		console.log('[recognizer tracer] test function successfully run');
	};
	this.connect = function () {
		return this;
	}

};

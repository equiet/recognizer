/**
 * This code has been instrumented using Recognizer
 * https://github.com/equiet/recognizer
 */

var __recognizer{{tracerId}} = (function () {
	'use strict';

	function Tracer() {
		this._calls = [];
	}
	Tracer.prototype = {
		logEntry: function (location, args) {
			this._calls.push({position: location, args: Array.prototype.slice.call(args)});
		},
		getCalls: function () {
			return this._calls;
		},
		getCallCount: function () {
			return this._calls.length;
		},
		test: function () {
			if (console) {
				console.log('[recognizer tracer] test function run successfully');
			}
		},
		connect: function () {
			return this;
		}
	};

	return new Tracer();

}());


/**
 * Instrumented code
 */


/*
 * Copyright (c) 2012 Massachusetts Institute of Technology, Adobe Systems
 * Incorporated, and other contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

var test = require('tap').test;
var simulate = require('./helper/simulate');

function nodeWithTypeName(nodes, type, name) {
	return nodes.filter(function (n) { return n.type === type && n.name === name })[0];
};

test('logs', function (t) {
	var o = simulate('scripts/logs.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var logOk = function (log) {
		t.ok(log.timestamp);
		t.ok(log.invocationId);
		t.ok(log.topLevelInvocationId);
	};

	var fooNode = nodeWithTypeName(nodes, 'function', 'foo');
	var barNode = nodeWithTypeName(nodes, 'function', 'bar');
	var timeoutNode = nodeWithTypeName(nodes, 'function', 'timeout');
	[fooNode, barNode, timeoutNode].forEach(t.ok.bind(t));

	var handle1 = tracer.trackLogs({ ids: [fooNode.id, barNode.id] });
	var handle2 = tracer.trackLogs({ ids: [fooNode.id, barNode.id] });

	var expectedLog = [{
		nodeId: fooNode.id,
		arguments: [{
			name: 'a',
			value: { type: 'number', value: 1 },
		}, {
			value: { type: 'string', value: 'unnamed' },
		}],
	}, {
		nodeId: barNode.id,
		arguments: [{
			name: 'b',
			value: { type: 'number', value: 2 },
		}],
	}, {
		nodeId: barNode.id,
		arguments: [{
			name: 'b',
			value: { type: 'number', value: 3 },
		}],
	}];

	// test that you can page log entries
	var log = tracer.logDelta(handle1, 1);
	t.similar(log, expectedLog.slice(0, 1));
	logOk(log[0]);
	var aInvocationId = log[0].invocationId;

	log = tracer.logDelta(handle1, 1);
	t.similar(log, expectedLog.slice(1, 1));
	logOk(log[0]);
	t.similar(log[0].parents, [{
		type: 'call',
		inbetween: [],
	}]);
	t.equal(log[0].parents[0].invocationId, aInvocationId);

	// test that there are no more before the timeout
	t.equal(tracer.logDelta(handle1).length, 0);

	setTimeout(function () {
		// test that the delayed function call has a log entry
		log = tracer.logDelta(handle1, 1);
		t.similar(log, expectedLog.slice(2, 1));
		logOk(log[0]);
		t.equal(tracer.logDelta(handle1).length, 0);

		// test that the second handle can get all the logs at once
		log = tracer.logDelta(handle2, 3);
		t.similar(log, expectedLog);
		log.forEach(logOk);
		t.equal(tracer.logDelta(handle2).length, 0);

		// test that a new handle gets all the logs up to this point
		var handle3 = tracer.trackLogs({ ids: [fooNode.id, barNode.id] });
		log = tracer.logDelta(handle3, 3);
		t.similar(log, expectedLog);
		log.forEach(logOk);
		t.equal(tracer.logDelta(handle3).length, 0);

		// test timer logs
		var handle4 = tracer.trackLogs({ ids: [timeoutNode.id] });
		log = tracer.logDelta(handle4, 1);
		t.similar(log, [{
			nodeId: timeoutNode.id,
			arguments: [],
			this: {
				type: 'object',
				preview: '[object Object]',
				ownProperties: {},
			},
		}]);
		log.forEach(logOk);
		t.equal(log[0].invocationId, log[0].topLevelInvocationId);
		t.equal(tracer.logDelta(handle4).length, 0);

		t.end();
	}, 200);
});

test('logs (backtrace)', function (t) {
	var o = simulate('scripts/logs-backtrace.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var aNode = nodeWithTypeName(nodes, 'function', 'a');
	var bNode = nodeWithTypeName(nodes, 'function', 'b');
	var cNode = nodeWithTypeName(nodes, 'function', 'c');
	[aNode, bNode, cNode].forEach(t.ok.bind(t));

	var handle = tracer.trackLogs({ ids: [cNode.id] });
	var log = tracer.logDelta(handle, 1);
	t.similar(log, [{}]);

	var invocationId = log[0].invocationId;
	t.ok(invocationId);

	var expectedTrace = [{
		nodeId: cNode.id,
		arguments: [{ value: { type: 'number', value: 3 }}],
	}, {
		nodeId: bNode.id,
		arguments: [{ value: { type: 'number', value: 2 }}],
	}, {
		nodeId: aNode.id,
		arguments: [{ value: { type: 'number', value: 1 }}],
	}];

	t.similar(tracer.backtrace({ invocationId: invocationId, range: [0, 10] }), expectedTrace);
	t.similar(tracer.backtrace({ invocationId: invocationId, range: [0, 1] }), expectedTrace.slice(0, 1));
	t.similar(tracer.backtrace({ invocationId: invocationId, range: [1, 2] }), expectedTrace.slice(1, 1));
	t.similar(tracer.backtrace({ invocationId: invocationId, range: [2, 3] }), expectedTrace.slice(2, 1));
	t.similar(tracer.backtrace({ invocationId: invocationId, range: [3, 4] }), []);

	t.end();
});

test('logs (parents)', function (t) {
	var o = simulate('scripts/logs-backtrace.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var aNode = nodeWithTypeName(nodes, 'function', 'a');
	var bNode = nodeWithTypeName(nodes, 'function', 'b');
	var cNode = nodeWithTypeName(nodes, 'function', 'c');
	[aNode, bNode, cNode].forEach(t.ok.bind(t));

	var handle1 = tracer.trackLogs({ ids: [aNode.id, bNode.id, cNode.id] });
	var log = tracer.logDelta(handle1, 3);
	t.similar(log, [{
		nodeId: aNode.id,
	}, {
		nodeId: bNode.id,
		parents: [{
			invocationId: log[0].invocationId,
			type: 'call',
			inbetween: [],
		}],
	}, {
		nodeId: cNode.id,
		parents: [{
			invocationId: log[1].invocationId,
			type: 'call',
			inbetween: [],
		}],
	}]);

	var handle2 = tracer.trackLogs({ ids: [aNode.id, cNode.id] });
	var log = tracer.logDelta(handle2, 3);
	t.similar(log, [{
		nodeId: aNode.id,
	}, {
		nodeId: cNode.id,
		parents: [{
			invocationId: log[0].invocationId,
			type: 'call',
			inbetween: [],
		}],
	}]);

	t.end();
});

test('logs (console.log)', function (t) {
	var o = simulate('scripts/logs-console.log.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var aNode = nodeWithTypeName(nodes, 'function', 'a');
	var bNode = nodeWithTypeName(nodes, 'function', 'b');
	var logNode = nodeWithTypeName(nodes, 'callsite', 'console.log');
	[aNode, bNode, logNode].forEach(t.ok.bind(t));

	var handleA = tracer.trackLogs({ ids: [aNode.id] });
	var handleB = tracer.trackLogs({ ids: [bNode.id] });

	var logB = tracer.logDelta(handleB, 4);
	t.equal(logB.length, 2);
	t.similar(logB, [
		{ nodeId: bNode.id, arguments: [] },
		{ nodeId: logNode.id, arguments: [{ value: { type: 'number', value: 1 } }] },
	]);

	// only return console.logs that are called directly
	var logA = tracer.logDelta(handleA, 4);
	t.similar(logA, [
		{ nodeId: aNode.id, arguments: [] },
	]);

	setTimeout(function () {
		logB = tracer.logDelta(handleB, 4);
		t.equal(logB.length, 2);
		t.similar(logB, [
			{ nodeId: bNode.id, arguments: [] },
			{ nodeId: logNode.id, arguments: [{ value: { type: 'number', value: 1 } }] },
		]);

		// only return console.logs that are called directly
		logA = tracer.logDelta(handleA, 4);
		t.equal(logA.length, 1);
		t.similar(logA, [
			{ nodeId: aNode.id, arguments: [] }, // the asynchronous one
		]);

		t.end();
	}, 200);
});

test('logs (async)', function (t) {
	var o = simulate('scripts/logs-async.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var aNode = nodeWithTypeName(nodes, 'function', 'a');
	var bNode = nodeWithTypeName(nodes, 'function', 'b');
	var callNode = nodeWithTypeName(nodes, 'function', 'call');
	[aNode, bNode, callNode].forEach(t.ok.bind(t));

	var handle = tracer.trackLogs({ ids: [aNode.id, bNode.id, callNode.id] });
	var log = tracer.logDelta(handle, 3);
	t.similar(log, [{
		nodeId: aNode.id,
	}, {
		nodeId: callNode.id,
		parents: [{
			invocationId: log[0].invocationId,
			type: 'call',
			inbetween: [],
		}],
	}, {
		nodeId: bNode.id,
		parents: [{
			invocationId: log[1].invocationId,
			type: 'call',
			inbetween: [],
		}, {
			invocationId: log[0].invocationId,
			type: 'async',
			inbetween: [],
		}],
	}]);

	t.equal(tracer.logDelta(handle).length, 0);

	t.end();
});

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

test('manual-bail', function (t) {
	var o = simulate('scripts/manual-bail.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var nodeWithTypeName = function (type, name) {
		return nodes.filter(function (n) { return n.type === type && n.name === name })[0];
	};

	var fooNode = nodeWithTypeName('function', 'foo');
	var barNode = nodeWithTypeName('function', 'bar');
	var timerHandlerNode = nodes.filter(function (n) { return n.type === 'function' && /timer/.test(n.name) })[0];

	var hitsHandle = tracer.trackHits();

	// check that the call graph doesn't contain bar (since foo() bails the first time)
	var deltas = tracer.hitCountDeltas(hitsHandle);
	t.equal(deltas[fooNode.id], 1);
	t.equal(deltas[barNode.id], undefined);

	setTimeout(function () {
		// check that the call graph contains bar now
		var deltas = tracer.hitCountDeltas(hitsHandle);
		t.equal(deltas[fooNode.id], 1);
		t.equal(deltas[barNode.id], 1);

		// check that the call graph seems okay
		// by checking that the backtrace from bar is
		//   timer handler -> foo -> bar
		var logHandle = tracer.trackLogs({ ids: [barNode.id] });
		var log = tracer.logDelta(logHandle, 1);
		var invocationId = log[0].invocationId;
		var backtrace = tracer.backtrace({ invocationId: invocationId });
		t.equivalent(backtrace.map(function (b) { return b.nodeId }), [barNode.id, fooNode.id, timerHandlerNode.id]);

		t.end();
	}, 200);
});

test('auto-bail', function (t) {
	var o = simulate('scripts/auto-bail.js', { maxInvocationsPerTick: 1024 });
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var nodeWithTypeName = function (type, name) {
		return nodes.filter(function (n) { return n.type === type && n.name === name })[0];
	};

	var fooNode = nodeWithTypeName('function', 'foo');
	var barNode = nodeWithTypeName('function', 'bar');
	var bazNode = nodeWithTypeName('function', 'baz');
	var timerHandlerNode = nodes.filter(function (n) { return n.type === 'function' && /timer/.test(n.name) })[0];

	var hitsHandle = tracer.trackHits();

	// there should be 1024 total invocations since it should bail at 1024
	var deltas = tracer.hitCountDeltas(hitsHandle);
	var sum = 0;
	for (var nodeId in deltas) { sum += deltas[nodeId] }
	t.equal(sum, 1023);

	// the call to baz should not have been recorded
	t.equal(deltas[bazNode.id], undefined);

	setTimeout(function () {
		var deltas = tracer.hitCountDeltas(hitsHandle);

		// the call to baz should have been recorded
		t.equal(deltas[bazNode.id], 1);

		t.end();
	}, 200);
});

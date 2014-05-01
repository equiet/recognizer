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

test('node-events (logs)', function (t) {
	var o = simulate('scripts/node-events-logs.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var functions = nodes.filter(function (n) { return n.type === 'function' });
	var fooNode = functions.filter(function (n) { return n.name === 'foo' })[0];
	var barNode = functions.filter(function (n) { return n.name === 'bar' })[0];
	var bazNode = functions.filter(function (n) { return n.name === 'baz' })[0];

	var handle = tracer.trackLogs({ ids: [fooNode.id, barNode.id, bazNode.id] });
	var log = tracer.logDelta(handle, 3);
	t.similar(log, [
		{ nodeId: fooNode.id, epoch: { eventName: 'boop' }, epochDepth: 0 },
		{ nodeId: barNode.id, epoch: { eventName: 'boop' }, epochDepth: 2 },
		{ nodeId: bazNode.id },
	]);
	t.equal(log[0].epoch.id, log[1].epoch.id);
	t.equal(log[0].epoch.emitterID, log[1].epoch.emitterID);
	t.notOk('epoch' in log[2]);
	t.notOk('epochDepth' in log[2]);

	t.end();
});

test('node-events (epochs)', function (t) {
	var o = simulate('scripts/node-events-epochs.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var functions = nodes.filter(function (n) { return n.type === 'function' });
	var fooNode = functions.filter(function (n) { return n.name === 'foo' })[0];
	var barNode = functions.filter(function (n) { return n.name === 'bar' })[0];

	var handle = tracer.trackEpochs();
	var delta = tracer.epochDelta(handle);
	t.equivalent(delta, {
		event1: { hits: 2 },
		event2: { hits: 1 },
	});

	setTimeout(function () {
		var delta = tracer.epochDelta(handle);
		t.equivalent(delta, {
			event2: { hits: 1 },
		});

		t.end();
	}, 200);
});

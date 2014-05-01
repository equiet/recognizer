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

test('hits', function (t) {
	var o = simulate('scripts/hits.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var nodeWithTypeName = function (type, name) {
		return nodes.filter(function (n) { return n.type === type && (!name || (n.name === name)) })[0];
	};

	var handle1 = tracer.trackHits();
	var handle2 = tracer.trackHits();

	var fooNode = nodeWithTypeName('function', 'foo');
	var fooCallSiteNode = nodeWithTypeName('callsite', 'foo');
	var timeoutCallSiteNode = nodeWithTypeName('callsite', 'setTimeout');
	var toplevelNode = nodeWithTypeName('toplevel');

	var expected = {};
	expected[fooNode.id] = 1;
	expected[fooCallSiteNode.id] = 1;
	expected[timeoutCallSiteNode.id] = 1;
	expected[toplevelNode.id] = 1;
	t.equivalent(tracer.hitCountDeltas(handle1), expected);
	t.equivalent(tracer.hitCountDeltas(handle2), expected);

	setTimeout(function () {
		expected[fooNode.id] = 1;
		delete expected[fooCallSiteNode.id];
		delete expected[timeoutCallSiteNode.id];
		delete expected[toplevelNode.id];
		t.equivalent(tracer.hitCountDeltas(handle1), expected);
		t.equivalent(tracer.hitCountDeltas(handle2), expected);

		delete expected[fooNode.id];
		delete expected[fooCallSiteNode.id];
		delete expected[timeoutCallSiteNode.id];
		t.equivalent(tracer.hitCountDeltas(handle1), expected);
		t.equivalent(tracer.hitCountDeltas(handle2), expected);

		t.end();
	}, 200);
});

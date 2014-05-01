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
	var o = simulate('scripts/exceptions.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;
	var nodes = tracer.nodes();

	var nodeWithTypeName = function (type, name) {
		return nodes.filter(function (n) { return n.type === type && n.name === name })[0];
	};

	var nodesWithTypeName = function (type, name) {
		return nodes.filter(function (n) { return n.type === type && n.name === name });
	};

	var handle1 = tracer.trackExceptions();
	var handle2 = tracer.trackExceptions();
	var fooNode = nodeWithTypeName('function', 'foo');
	var exceptNode = nodeWithTypeName('function', 'except');
	var fooCallSiteNode = nodeWithTypeName('callsite', 'foo');
	var exceptCallSiteNode = nodeWithTypeName('callsite', 'except');
	var fooTimeoutCallSiteNode = nodesWithTypeName('callsite', 'setTimeout')[0];

	var expected = { counts: {} };
	expected.counts[exceptNode.id] = 1;
	t.equivalent(tracer.newExceptions(handle1), expected);
	t.equivalent(tracer.newExceptions(handle2), expected);

	setTimeout(function () {
		t.equivalent(tracer.newExceptions(handle1), expected);
		t.equivalent(tracer.newExceptions(handle2), expected);

		t.equivalent(tracer.newExceptions(handle1), { counts: {} });
		t.equivalent(tracer.newExceptions(handle2), { counts: {} });

		t.end();
	}, 200);
});

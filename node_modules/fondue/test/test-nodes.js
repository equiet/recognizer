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

test('nodes', function (t) {
	var o = simulate('scripts/nodes.js');
	t.ok(o.tracer); t.notOk(o.exception);
	var tracer = o.tracer;

	var nodes = tracer.nodes();
	t.equal(nodes.length, 11);

	var nodeWithId = function (id) {
		return nodes.filter(function (n) { return n.id === id })[0];
	};

	var nodeWithTypeName = function (type, name, i) {
		return nodes.filter(function (n) { return n.type === type && n.name === name })[i || 0];
	};

	// built-ins

	t.similar(nodeWithId('log'), {
		id: 'log',
		type: 'function',
		start: { line: 0, column: 0 },
		end: { line: 0, column: 0 },
	});

	// top-level

	t.similar(nodeWithTypeName('toplevel', '(nodes.js toplevel)'), {
		id: 'scripts/nodes.js-toplevel-1-0-9-21',
		type: 'toplevel',
	});

	// function declaration

	t.similar(nodeWithTypeName('function', 'a'), {
		id: 'scripts/nodes.js-function-1-0-4-1',
		start: { line: 1, column: 0 },
		end: { line: 4, column: 1 },
		params: [
			{
				name: 'alpha',
				start: { line: 1, column: 11 },
				end: { line: 1, column: 16 },
			},
			{
				name: 'beta',
				start: { line: 1, column: 18 },
				end: { line: 1, column: 22 },
			}
		],
	});

	t.similar(nodeWithTypeName('function', 'b'), {
		id: 'scripts/nodes.js-function-2-1-2-16',
		start: { line: 2, column: 1 },
		end: { line: 2, column: 16 },
		params: [],
	});

	t.similar(nodeWithTypeName('function', 'c'), {
		id: 'scripts/nodes.js-function-3-8-3-23',
		start: { line: 3, column: 8 },
		end: { line: 3, column: 23 },
		params: [],
	});

	t.similar(nodeWithTypeName('function', 'x.y'), {
		id: 'scripts/nodes.js-function-8-13-8-28',
		start: { line: 8, column: 13 },
		end: { line: 8, column: 28 },
		params: [],
	});

	t.similar(nodeWithTypeName('function', "('a' callback)"), {
		id: 'scripts/nodes.js-function-6-2-6-17',
		start: { line: 6, column: 2 },
		end: { line: 6, column: 17 },
		params: [],
	});

	t.similar(nodeWithTypeName('function', "('y' callback)"), {
		id: 'scripts/nodes.js-function-9-4-9-19',
		start: { line: 9, column: 4 },
		end: { line: 9, column: 19 },
		params: [],
	});

	// call site

	t.similar(nodeWithTypeName('callsite', 'a'), {
		id: 'scripts/nodes.js-callsite-5-0-5-3',
		start: { line: 5, column: 0 },
		end: { line: 5, column: 3 },
	});

	t.similar(nodeWithTypeName('callsite', 'a', 1), {
		id: 'scripts/nodes.js-callsite-6-0-6-18',
		start: { line: 6, column: 0 },
		end: { line: 6, column: 18 },
	});

	t.similar(nodeWithTypeName('callsite', 'x.y'), {
		id: 'scripts/nodes.js-callsite-9-0-9-20',
		start: { line: 9, column: 0 },
		end: { line: 9, column: 20 },
		nameStart: { line: 9, column: 2 },
		nameEnd: { line: 9, column: 3 },
	});

	t.end();
});

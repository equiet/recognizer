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

var fondue = require('../../');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var wrapper = fs.readFileSync(path.join(__dirname, 'wrapper.js_'), 'utf8');

// adds keys from options to defaultOptions, overwriting on conflicts & returning defaultOptions
function mergeInto(options, defaultOptions) {
	for (var key in options) {
		defaultOptions[key] = options[key];
	}
	return defaultOptions;
}

function wrap(src) {
	return wrapper.replace("[[script]]", src);
}

// returns { tracer: ..., exception: ... }
module.exports = function (filename, options) {
	options = mergeInto(options, { nodejs: true, path: filename });
	var src = fondue.instrument(fs.readFileSync(filename, 'utf8'), options).toString();
	return vm.runInNewContext(wrap(src), {
		setTimeout: setTimeout,
		console: console,
		require: require,
	})();
};

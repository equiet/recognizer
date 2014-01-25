/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/*global exports:true, require:true, define:true*/

define(function (require, exports, module) {
	'use strict';

	exports.SourceMapGenerator = require('thirdparty/source-map/source-map-generator').SourceMapGenerator;
	exports.SourceMapConsumer = require('thirdparty/source-map/source-map-consumer').SourceMapConsumer;
	exports.SourceNode = require('thirdparty/source-map/source-node').SourceNode;

});
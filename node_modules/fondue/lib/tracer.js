/*
The following code was inserted automatically by fondue to collect information
about the execution of all the JavaScript on this page or in this program.

https://github.com/adobe-research/fondue
*/

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

/*
The source of source-map is included below on the line beginning with "var sourceMap",
and its license is as follows:

Copyright (c) 2009-2011, Mozilla Foundation and contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the names of the Mozilla Foundation nor the names of project
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

if (typeof {name} === 'undefined') {
{name} = new (function () {
	var sourceMap = (function () {function define(e,t,n){if(typeof e!="string")throw new TypeError("Expected string, got: "+e);arguments.length==2&&(n=t);if(e in define.modules)throw new Error("Module already defined: "+e);define.modules[e]=n}function Domain(){this.modules={},this._currentModule=null}define.modules={},function(){function e(e){var t=e.split("/"),n=1;while(n<t.length)t[n]===".."?t.splice(n-1,1):t[n]==="."?t.splice(n,1):n++;return t.join("/")}function t(e,t){return e=e.trim(),t=t.trim(),/^\//.test(t)?t:e.replace(/\/*$/,"/")+t}function n(e){var t=e.split("/");return t.pop(),t.join("/")}Domain.prototype.require=function(e,t){if(Array.isArray(e)){var n=e.map(function(e){return this.lookup(e)},this);return t&&t.apply(null,n),undefined}return this.lookup(e)},Domain.prototype.lookup=function(r){/^\./.test(r)&&(r=e(t(n(this._currentModule),r)));if(r in this.modules){var i=this.modules[r];return i}if(r in define.modules){var i=define.modules[r];if(typeof i=="function"){var s={},o=this._currentModule;this._currentModule=r,i(this.require.bind(this),s,{id:r,uri:""}),this._currentModule=o,i=s}return this.modules[r]=i,i}throw new Error("Module not defined: "+r)}}(),define.Domain=Domain,define.globalDomain=new Domain;var require=define.globalDomain.require.bind(define.globalDomain);define("source-map/source-map-generator",["require","exports","module","source-map/base64-vlq","source-map/util","source-map/array-set"],function(e,t,n){function o(e){this._file=i.getArg(e,"file"),this._sourceRoot=i.getArg(e,"sourceRoot",null),this._sources=new s,this._names=new s,this._mappings=[],this._sourcesContents=null}function u(e,t){var n=(e&&e.line)-(t&&t.line);return n?n:(e&&e.column)-(t&&t.column)}function a(e,t){return e=e||"",t=t||"",(e>t)-(e<t)}function f(e,t){return u(e.generated,t.generated)||u(e.original,t.original)||a(e.source,t.source)||a(e.name,t.name)}var r=e("./base64-vlq"),i=e("./util"),s=e("./array-set").ArraySet;o.prototype._version=3,o.fromSourceMap=function(t){var n=t.sourceRoot,r=new o({file:t.file,sourceRoot:n});return t.eachMapping(function(e){var t={generated:{line:e.generatedLine,column:e.generatedColumn}};e.source&&(t.source=e.source,n&&(t.source=i.relative(n,t.source)),t.original={line:e.originalLine,column:e.originalColumn},e.name&&(t.name=e.name)),r.addMapping(t)}),t.sources.forEach(function(e){var n=t.sourceContentFor(e);n&&r.setSourceContent(e,n)}),r},o.prototype.addMapping=function(t){var n=i.getArg(t,"generated"),r=i.getArg(t,"original",null),s=i.getArg(t,"source",null),o=i.getArg(t,"name",null);this._validateMapping(n,r,s,o),s&&!this._sources.has(s)&&this._sources.add(s),o&&!this._names.has(o)&&this._names.add(o),this._mappings.push({generated:n,original:r,source:s,name:o})},o.prototype.setSourceContent=function(t,n){var r=t;this._sourceRoot&&(r=i.relative(this._sourceRoot,r)),n!==null?(this._sourcesContents||(this._sourcesContents={}),this._sourcesContents[i.toSetString(r)]=n):(delete this._sourcesContents[i.toSetString(r)],Object.keys(this._sourcesContents).length===0&&(this._sourcesContents=null))},o.prototype.applySourceMap=function(t,n){n||(n=t.file);var r=this._sourceRoot;r&&(n=i.relative(r,n));var o=new s,u=new s;this._mappings.forEach(function(e){if(e.source===n&&e.original){var s=t.originalPositionFor({line:e.original.line,column:e.original.column});s.source!==null&&(r?e.source=i.relative(r,s.source):e.source=s.source,e.original.line=s.line,e.original.column=s.column,s.name!==null&&e.name!==null&&(e.name=s.name))}var a=e.source;a&&!o.has(a)&&o.add(a);var f=e.name;f&&!u.has(f)&&u.add(f)},this),this._sources=o,this._names=u,t.sources.forEach(function(e){var n=t.sourceContentFor(e);n&&(r&&(e=i.relative(r,e)),this.setSourceContent(e,n))},this)},o.prototype._validateMapping=function(t,n,r,i){if(t&&"line"in t&&"column"in t&&t.line>0&&t.column>=0&&!n&&!r&&!i)return;if(t&&"line"in t&&"column"in t&&n&&"line"in n&&"column"in n&&t.line>0&&t.column>=0&&n.line>0&&n.column>=0&&r)return;throw new Error("Invalid mapping.")},o.prototype._serializeMappings=function(){var t=0,n=1,i=0,s=0,o=0,u=0,a="",l;this._mappings.sort(f);for(var c=0,h=this._mappings.length;c<h;c++){l=this._mappings[c];if(l.generated.line!==n){t=0;while(l.generated.line!==n)a+=";",n++}else if(c>0){if(!f(l,this._mappings[c-1]))continue;a+=","}a+=r.encode(l.generated.column-t),t=l.generated.column,l.source&&l.original&&(a+=r.encode(this._sources.indexOf(l.source)-u),u=this._sources.indexOf(l.source),a+=r.encode(l.original.line-1-s),s=l.original.line-1,a+=r.encode(l.original.column-i),i=l.original.column,l.name&&(a+=r.encode(this._names.indexOf(l.name)-o),o=this._names.indexOf(l.name)))}return a},o.prototype.toJSON=function(){var t={version:this._version,file:this._file,sources:this._sources.toArray(),names:this._names.toArray(),mappings:this._serializeMappings()};return this._sourceRoot&&(t.sourceRoot=this._sourceRoot),this._sourcesContents&&(t.sourcesContent=t.sources.map(function(e){return t.sourceRoot&&(e=i.relative(t.sourceRoot,e)),Object.prototype.hasOwnProperty.call(this._sourcesContents,i.toSetString(e))?this._sourcesContents[i.toSetString(e)]:null},this)),t},o.prototype.toString=function(){return JSON.stringify(this)},t.SourceMapGenerator=o}),define("source-map/base64-vlq",["require","exports","module","source-map/base64"],function(e,t,n){function a(e){return e<0?(-e<<1)+1:(e<<1)+0}function f(e){var t=(e&1)===1,n=e>>1;return t?-n:n}var r=e("./base64"),i=5,s=1<<i,o=s-1,u=s;t.encode=function(t){var n="",s,f=a(t);do s=f&o,f>>>=i,f>0&&(s|=u),n+=r.encode(s);while(f>0);return n},t.decode=function(t){var n=0,s=t.length,a=0,l=0,c,h;do{if(n>=s)throw new Error("Expected more digits in base 64 VLQ value.");h=r.decode(t.charAt(n++)),c=!!(h&u),h&=o,a+=h<<l,l+=i}while(c);return{value:f(a),rest:t.slice(n)}}}),define("source-map/base64",["require","exports","module"],function(e,t,n){var r={},i={};"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("").forEach(function(e,t){r[e]=t,i[t]=e}),t.encode=function(t){if(t in i)return i[t];throw new TypeError("Must be between 0 and 63: "+t)},t.decode=function(t){if(t in r)return r[t];throw new TypeError("Not a valid base 64 digit: "+t)}}),define("source-map/util",["require","exports","module"],function(e,t,n){function r(e,t,n){if(t in e)return e[t];if(arguments.length===3)return n;throw new Error('"'+t+'" is a required argument.')}function s(e){var t=e.match(i);return t?{scheme:t[1],auth:t[3],host:t[4],port:t[6],path:t[7]}:null}function o(e){var t=e.scheme+"://";return e.auth&&(t+=e.auth+"@"),e.host&&(t+=e.host),e.port&&(t+=":"+e.port),e.path&&(t+=e.path),t}function u(e,t){var n;return t.match(i)?t:t.charAt(0)==="/"&&(n=s(e))?(n.path=t,o(n)):e.replace(/\/$/,"")+"/"+t}function a(e){return"$"+e}function f(e){return e.substr(1)}function l(e,t){e=e.replace(/\/$/,"");var n=s(e);return t.charAt(0)=="/"&&n&&n.path=="/"?t.slice(1):t.indexOf(e+"/")===0?t.substr(e.length+1):t}t.getArg=r;var i=/([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;t.urlParse=s,t.urlGenerate=o,t.join=u,t.toSetString=a,t.fromSetString=f,t.relative=l}),define("source-map/array-set",["require","exports","module","source-map/util"],function(e,t,n){function i(){this._array=[],this._set={}}var r=e("./util");i.fromArray=function(t){var n=new i;for(var r=0,s=t.length;r<s;r++)n.add(t[r]);return n},i.prototype.add=function(t){if(this.has(t))return;var n=this._array.length;this._array.push(t),this._set[r.toSetString(t)]=n},i.prototype.has=function(t){return Object.prototype.hasOwnProperty.call(this._set,r.toSetString(t))},i.prototype.indexOf=function(t){if(this.has(t))return this._set[r.toSetString(t)];throw new Error('"'+t+'" is not in the set.')},i.prototype.at=function(t){if(t>=0&&t<this._array.length)return this._array[t];throw new Error("No element indexed by "+t)},i.prototype.toArray=function(){return this._array.slice()},t.ArraySet=i}),define("source-map/source-map-consumer",["require","exports","module","source-map/util","source-map/binary-search","source-map/array-set","source-map/base64-vlq"],function(e,t,n){function u(e){var t=e;typeof e=="string"&&(t=JSON.parse(e.replace(/^\)\]\}'/,"")));var n=r.getArg(t,"version"),i=r.getArg(t,"sources"),o=r.getArg(t,"names"),u=r.getArg(t,"sourceRoot",null),a=r.getArg(t,"sourcesContent",null),f=r.getArg(t,"mappings"),l=r.getArg(t,"file",null);if(n!==this._version)throw new Error("Unsupported version: "+n);this._names=s.fromArray(o),this._sources=s.fromArray(i),this.sourceRoot=u,this.sourcesContent=a,this.file=l,this._generatedMappings=[],this._originalMappings=[],this._parseMappings(f,u)}var r=e("./util"),i=e("./binary-search"),s=e("./array-set").ArraySet,o=e("./base64-vlq");u.prototype._version=3,Object.defineProperty(u.prototype,"sources",{get:function(){return this._sources.toArray().map(function(e){return this.sourceRoot?r.join(this.sourceRoot,e):e},this)}}),u.prototype._parseMappings=function(t,n){var r=1,i=0,s=0,u=0,a=0,f=0,l=/^[,;]/,c=t,h,p;while(c.length>0)if(c.charAt(0)===";")r++,c=c.slice(1),i=0;else if(c.charAt(0)===",")c=c.slice(1);else{h={},h.generatedLine=r,p=o.decode(c),h.generatedColumn=i+p.value,i=h.generatedColumn,c=p.rest;if(c.length>0&&!l.test(c.charAt(0))){p=o.decode(c),h.source=this._sources.at(a+p.value),a+=p.value,c=p.rest;if(c.length===0||l.test(c.charAt(0)))throw new Error("Found a source, but no line and column");p=o.decode(c),h.originalLine=s+p.value,s=h.originalLine,h.originalLine+=1,c=p.rest;if(c.length===0||l.test(c.charAt(0)))throw new Error("Found a source and line, but no column");p=o.decode(c),h.originalColumn=u+p.value,u=h.originalColumn,c=p.rest,c.length>0&&!l.test(c.charAt(0))&&(p=o.decode(c),h.name=this._names.at(f+p.value),f+=p.value,c=p.rest)}this._generatedMappings.push(h),typeof h.originalLine=="number"&&this._originalMappings.push(h)}this._originalMappings.sort(this._compareOriginalPositions)},u.prototype._compareOriginalPositions=function(t,n){if(t.source>n.source)return 1;if(t.source<n.source)return-1;var r=t.originalLine-n.originalLine;return r===0?t.originalColumn-n.originalColumn:r},u.prototype._compareGeneratedPositions=function(t,n){var r=t.generatedLine-n.generatedLine;return r===0?t.generatedColumn-n.generatedColumn:r},u.prototype._findMapping=function(t,n,r,s,o){if(t[r]<=0)throw new TypeError("Line must be greater than or equal to 1, got "+t[r]);if(t[s]<0)throw new TypeError("Column must be greater than or equal to 0, got "+t[s]);return i.search(t,n,o)},u.prototype.originalPositionFor=function(t){var n={generatedLine:r.getArg(t,"line"),generatedColumn:r.getArg(t,"column")},i=this._findMapping(n,this._generatedMappings,"generatedLine","generatedColumn",this._compareGeneratedPositions);if(i){var s=r.getArg(i,"source",null);return s&&this.sourceRoot&&(s=r.join(this.sourceRoot,s)),{source:s,line:r.getArg(i,"originalLine",null),column:r.getArg(i,"originalColumn",null),name:r.getArg(i,"name",null)}}return{source:null,line:null,column:null,name:null}},u.prototype.sourceContentFor=function(t){if(!this.sourcesContent)return null;this.sourceRoot&&(t=r.relative(this.sourceRoot,t));if(this._sources.has(t))return this.sourcesContent[this._sources.indexOf(t)];var n;if(this.sourceRoot&&(n=r.urlParse(this.sourceRoot))){var i=t.replace(/^file:\/\//,"");if(n.scheme=="file"&&this._sources.has(i))return this.sourcesContent[this._sources.indexOf(i)];if((!n.path||n.path=="/")&&this._sources.has("/"+t))return this.sourcesContent[this._sources.indexOf("/"+t)]}throw new Error('"'+t+'" is not in the SourceMap.')},u.prototype.generatedPositionFor=function(t){var n={source:r.getArg(t,"source"),originalLine:r.getArg(t,"line"),originalColumn:r.getArg(t,"column")};this.sourceRoot&&(n.source=r.relative(this.sourceRoot,n.source));var i=this._findMapping(n,this._originalMappings,"originalLine","originalColumn",this._compareOriginalPositions);return i?{line:r.getArg(i,"generatedLine",null),column:r.getArg(i,"generatedColumn",null)}:{line:null,column:null}},u.GENERATED_ORDER=1,u.ORIGINAL_ORDER=2,u.prototype.eachMapping=function(t,n,i){var s=n||null,o=i||u.GENERATED_ORDER,a;switch(o){case u.GENERATED_ORDER:a=this._generatedMappings;break;case u.ORIGINAL_ORDER:a=this._originalMappings;break;default:throw new Error("Unknown order of iteration.")}var f=this.sourceRoot;a.map(function(e){var t=e.source;return t&&f&&(t=r.join(f,t)),{source:t,generatedLine:e.generatedLine,generatedColumn:e.generatedColumn,originalLine:e.originalLine,originalColumn:e.originalColumn,name:e.name}}).forEach(t,s)},t.SourceMapConsumer=u}),define("source-map/binary-search",["require","exports","module"],function(e,t,n){function r(e,t,n,i,s){var o=Math.floor((t-e)/2)+e,u=s(n,i[o]);return u===0?i[o]:u>0?t-o>1?r(o,t,n,i,s):i[o]:o-e>1?r(e,o,n,i,s):e<0?null:i[e]}t.search=function(t,n,i){return n.length>0?r(-1,n.length,t,n,i):null}}),define("source-map/source-node",["require","exports","module","source-map/source-map-generator","source-map/util"],function(e,t,n){function s(e,t,n,r,i){this.children=[],this.sourceContents={},this.line=e===undefined?null:e,this.column=t===undefined?null:t,this.source=n===undefined?null:n,this.name=i===undefined?null:i,r!=null&&this.add(r)}var r=e("./source-map-generator").SourceMapGenerator,i=e("./util");s.fromStringWithSourceMap=function(t,n){function f(e,t){e===null||e.source===undefined?r.add(t):r.add(new s(e.originalLine,e.originalColumn,e.source,t,e.name))}var r=new s,i=t.split("\n"),o=1,u=0,a=null;return n.eachMapping(function(e){if(a===null){while(o<e.generatedLine)r.add(i.shift()+"\n"),o++;if(u<e.generatedColumn){var t=i[0];r.add(t.substr(0,e.generatedColumn)),i[0]=t.substr(e.generatedColumn),u=e.generatedColumn}}else if(o<e.generatedLine){var n="";do n+=i.shift()+"\n",o++,u=0;while(o<e.generatedLine);if(u<e.generatedColumn){var t=i[0];n+=t.substr(0,e.generatedColumn),i[0]=t.substr(e.generatedColumn),u=e.generatedColumn}f(a,n)}else{var t=i[0],n=t.substr(0,e.generatedColumn-u);i[0]=t.substr(e.generatedColumn-u),u=e.generatedColumn,f(a,n)}a=e},this),f(a,i.join("\n")),n.sources.forEach(function(e){var t=n.sourceContentFor(e);t&&r.setSourceContent(e,t)}),r},s.prototype.add=function(t){if(Array.isArray(t))t.forEach(function(e){this.add(e)},this);else{if(!(t instanceof s||typeof t=="string"))throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+t);t&&this.children.push(t)}return this},s.prototype.prepend=function(t){if(Array.isArray(t))for(var n=t.length-1;n>=0;n--)this.prepend(t[n]);else{if(!(t instanceof s||typeof t=="string"))throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got "+t);this.children.unshift(t)}return this},s.prototype.walk=function(t){this.children.forEach(function(e){e instanceof s?e.walk(t):e!==""&&t(e,{source:this.source,line:this.line,column:this.column,name:this.name})},this)},s.prototype.join=function(t){var n,r,i=this.children.length;if(i>0){n=[];for(r=0;r<i-1;r++)n.push(this.children[r]),n.push(t);n.push(this.children[r]),this.children=n}return this},s.prototype.replaceRight=function(t,n){var r=this.children[this.children.length-1];return r instanceof s?r.replaceRight(t,n):typeof r=="string"?this.children[this.children.length-1]=r.replace(t,n):this.children.push("".replace(t,n)),this},s.prototype.setSourceContent=function(t,n){this.sourceContents[i.toSetString(t)]=n},s.prototype.walkSourceContents=function(t){this.children.forEach(function(e){e instanceof s&&e.walkSourceContents(t)},this),Object.keys(this.sourceContents).forEach(function(e){t(i.fromSetString(e),this.sourceContents[e])},this)},s.prototype.toString=function(){var t="";return this.walk(function(e){t+=e}),t},s.prototype.toStringWithSourceMap=function(t){var n={code:"",line:1,column:0},i=new r(t),s=!1;return this.walk(function(e,t){n.code+=e,t.source!==null&&t.line!==null&&t.column!==null?(i.addMapping({source:t.source,original:{line:t.line,column:t.column},generated:{line:n.line,column:n.column},name:t.name}),s=!0):s&&(i.addMapping({generated:{line:n.line,column:n.column}}),s=!1),e.split("").forEach(function(e){e==="\n"?(n.line++,n.column=0):n.column++})}),this.walkSourceContents(function(e,t){i.setSourceContent(e,t)}),{code:n.code,map:i}},t.SourceNode=s});return {SourceMapConsumer:require("source-map/source-map-consumer").SourceMapConsumer,SourceMapGenerator:require("source-map/source-map-generator").SourceMapGenerator,SourceNode:require("source-map/source-node").SourceNode}})();

	var TRACER_ID = String(Math.random());

	var globalThis = undefined;

	var nodes = []; // objects describing functions, branches, call sites, etc
	var nodeById = {}; // id(string) -> node
	var invocationStack = [];
	var invocationById = {}; // id(string) -> invocation
	var invocationsByNodeId = {}; // id(string) -> array of invocations
	var exceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }
	var nodeHitCounts = {}; // { query-handle: { nodeId: hit-count } }
	var exceptionCounts = {}; // { query-handle: { nodeId: exception-count } }
	var logEntries = {}; // { query-handle: [invocation id] }
	var anonFuncParentInvocation, lastException; // yucky globals track state between trace* calls
	var nextInvocationId = 0;
	var _hitQueries = [];
	var _exceptionQueries = [];
	var _logQueries = [];
	var _fileCallGraph = [];
	var _sourceMaps = {};

	var _connected = false;

	// epochs
	var _lastEpochID = 0;
	var _lastEmitterID = 0;
	var _epochsById = []; // int -> epoch (only epochs that end up as part of the call graph are saved)
	var _epochsByName = {}; // string -> [epoch] (only epochs that end up as part of the call graph are saved)
	var _topLevelEpochsByName = {}; // string -> [epoch]
	var _epochStack = [];
	var _epochInvocationDepth = []; // stack of how deep into the invocation stack of each epoch we are
	var _topLevelInvocationsByEventName = {};

	// bail
	var _bailedTick = false;
	var _invocationsThisTick = 0;
	var _invocationStackSize = 0;
	var _explainedBails = false;

	function _resetTrace() {
		console.log("[fondue] resetting trace data...");

		invocationStack = [];
		invocationById = {}; // id(string) -> invocation
		invocationsByNodeId = {}; // id(string) -> array of invocations
		exceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }
		nodeHitCounts = {}; // { query-handle: { nodeId: hit-count } }
		exceptionCounts = {}; // { query-handle: { nodeId: exception-count } }
		logEntries = {}; // { query-handle: [invocation id] }
		anonFuncParentInvocation, lastException; // yucky globals track state between trace* calls
		_hitQueries = [];
		_exceptionQueries = [];
		_logQueries = [];
		_fileCallGraph = [];

		// epochs
		_epochsById = []; // int -> epoch (only epochs that end up as part of the call graph are saved)
		_epochsByName = {}; // string -> [epoch] (only epochs that end up as part of the call graph are saved)
		_topLevelEpochsByName = {}; // string -> [epoch]
		_epochStack = [];
		_epochInvocationDepth = []; // stack of how deep into the invocation stack of each epoch we are
		_topLevelInvocationsByEventName = {};

		// bail
		_bailedTick = false;
		_invocationsThisTick = 0;
		_invocationStackSize = 0;
		_explainedBails = false;

		nodeTracker.reset();
		epochTracker.reset();
		fileCallGraphTracker.reset();
	}

	/*
	Fetching data from fondue happens by requesting a handle for the data you
	want, then calling another function to get the latest data from that handle.
	Typically, the first call to that function returns all the historical data
	and subsequent calls return the changes since the last call.

	The bookkeeping was the same in all the cases. Now this 'base class' handles
	it. Just make a new instance and override backfill() and updateSingle().
	*/
	function Tracker(handlePrefix) {
		this.lastHandleID = 0;
		this.handlePrefix = handlePrefix;
		this.queries = {}; // handle -> query
		this.data = {}; // handle -> data
	}
	Tracker.prototype = {
		track: function (query) {
			var handleID = ++this.lastHandleID;
			var handle = this.handlePrefix + '-' + handleID;
			this.queries[handle] = query;
			this.data[handle] = this.backfill(query);
			return handle;
		},
		untrack: function (handle) {
			this._checkHandle(handle);

			delete this.queries[handle];
			delete this.data[handle];
		},
		/** return the data to be returned from the first call to delta() */
		backfill: function (query) {
			// override this
			return {};
		},
		update: function () {
			for (var handle in this.data) {
				var data = this.data[handle];
				var args = [data].concat(Array.prototype.slice.apply(arguments));
				this.data[handle] = this.updateSingle.apply(this, args);
			}
		},
		/**
		data: the previous data for this query
		arguments passed to update() will be passed after the data argument.
		*/
		updateSingle: function (data, extraData1, extraData2) {
			// override this
			data['foo'] = 'bar';
			return data;
		},
		delta: function (handle) {
			this._checkHandle(handle);

			var result = this.data[handle];
			this.data[handle] = this.emptyData(handle);
			return result;
		},
		/** after a call to delta(), the data for a handle is reset to this */
		emptyData: function (handle) {
			return {};
		},
		reset: function () {
			this.queries = {}; // handle -> query
			this.data = {}; // handle -> data
		},
		_checkHandle: function (handle) {
			if (!(handle in this.queries)) {
				throw new Error("unrecognized query");
			}
		},
	}

	var nodeTracker = new Tracker('node');
	nodeTracker.emptyData = function () {
		return [];
	};
	nodeTracker.backfill = function () {
		return nodes.slice();
	};
	nodeTracker.updateSingle = function (data, newNodes) {
		data.push.apply(data, newNodes);
		return data;
	};

	var epochTracker = new Tracker('epoch');
	epochTracker.backfill = function () {
		var data = {};
		for (var epochName in _topLevelEpochsByName) {
			data[epochName] = { hits: _topLevelEpochsByName[epochName].length };
		}
		return data;
	};
	epochTracker.updateSingle = function (data, epoch) {
		if (!(epoch.eventName in data)) {
			data[epoch.eventName] = { hits: 0 };
		}
		data[epoch.eventName].hits++;
		return data;
	};

	var fileCallGraphTracker = new Tracker('file-call-graph');
	fileCallGraphTracker.emptyData = function () {
		return [];
	};
	fileCallGraphTracker.backfill = function () {
		return _fileCallGraph.slice();
	};
	fileCallGraphTracker.updateSingle = function (data, item) {
		data.push(item);
		return data;
	};

	function _addSpecialNodes() {
		var node = {
			path: "[built-in]",
			start: { line: 0, column: 0 },
			end: { line: 0, column: 0 },
			id: "log",
			type: "function",
			childrenIds: [],
			parentId: undefined,
			name: "[log]",
			params: []
		};
		nodes.push(node);
		nodeById[node.id] = node;
	}
	_addSpecialNodes();


	// helpers

	// adds keys from options to defaultOptions, overwriting on conflicts & returning defaultOptions
	function mergeInto(options, defaultOptions) {
		for (var key in options) {
			defaultOptions[key] = options[key];
		}
		return defaultOptions;
	}

	/**
	 * calls callback with (item, index, collect) where collect is a function
	 * whose argument should be one of the strings to be de-duped.
	 * returns an array where each string appears only once.
	 */
	function dedup(collection, callback) {
		var o = {};
		var collect = function (str) {
			o[str] = true;
		};
		for (var i in collection) {
			callback(collect, collection[i], i);
		}
		var arr = [];
		for (var str in o) {
			arr.push(str);
		}
		return arr;
	};

	function count(collection, callback) {
		var o = {};
		var collect = function (str) {
			if (str in o) {
				o[str]++;
			} else {
				o[str] = 1;
			}
		};
		for (var i in collection) {
			callback(collect, collection[i], i);
		}
		return o;
	};

	function flattenmap(collection, callback) {
		var arr = [];
		var collect = function (o) {
			arr.push(o);
		};
		for (var i in collection) {
			callback(collect, collection[i], i, collection);
		}
		return arr;
	};

	/**
	 * behaves like de-dup, but collect takes a second, 'value' argument.
	 * returns an object whose keys are the first arguments to collect,
	 * and values are arrays of all the values passed with that key
	 */
	function cluster(collection, callback) {
		var o = {};
		var collect = function (key, value) {
			if (key in o) {
				o[key].push(value);
			} else {
				o[key] = [value];
			}
		};
		for (var i in collection) {
			callback(collect, collection[i], i);
		}
		return o;
	};

	/**
	 * returns a version of an object that's safe to JSON,
	 * and is very conservative
	 *
	 *   undefined -> { type: 'undefined', value: undefined }
	 *   null -> { type: 'undefined', value: null }
	 *   true -> { type: 'boolean', value: true }
	 *   4 -> { type: 'number', value: 4 }
	 *   "foo" -> { type: 'string', value: "foo" }
	 *   (function () { }) -> { type: 'object' }
	 *   { a: "b" } -> { type: 'object' }
	 */
	function marshalForTransmission(val, maxDepth) {
		if (maxDepth === undefined) {
			maxDepth = 1;
		}

		var o = { type: typeof(val) };
		if (["undefined", "boolean", "number", "string"].indexOf(o.type) !== -1 || val === null) {
			if (typeof(val) === "undefined" && val !== undefined) {
				// special case: document.all claims to be undefined http://stackoverflow.com/questions/10350142/why-is-document-all-falsy
				o.type = "object";
				o.preview = "" + val;
			} else if (val === null) {
				o.type = "null";
				o.preview = "null";
			} else {
				o.value = val;
			}
		} else if (o.type === "object") {
			var newDepth = maxDepth - 1;

			if (val instanceof Array) {
				var len = val.length;
				if (val.__theseusTruncated && val.__theseusTruncated.length) {
					len += val.__theseusTruncated.length;
				}
				o.preview = "[Array:" + len + "]";
				newDepth = maxDepth - 0.5; // count for half
			} else if (typeof(Buffer) === "function" && (val instanceof Buffer)) {
				var len = val.length;
				if (val.__theseusTruncated && val.__theseusTruncated.length) {
					len += val.__theseusTruncated.length;
				}
				o.preview = "[Buffer:" + len + "]";
			} else {
				try { o.preview = String(val) } catch (e) { o.preview = "[Object]" }
			}

			if (maxDepth > 0) {
				o.ownProperties = {};
				for (var key in val) {
					if (val.hasOwnProperty(key) && !/^__theseus/.test(key)) {
						o.ownProperties[key] = marshalForTransmission(val[key], newDepth);
					}
				}
			}

			if ("__theseusTruncated" in val) {
				o.truncated = {};
				if ("length" in val.__theseusTruncated) {
					o.truncated.length = {
						amount: val.__theseusTruncated.length,
					};
				}
				if ("keys" in val.__theseusTruncated) {
					o.truncated.keys = {
						amount: val.__theseusTruncated.keys,
					};
				}
			}
		}
		return o;
	}

	function scrapeObject(object, depth) {
		var MAX_BUFFER_LENGTH = 32;
		var MAX_TOTAL_SIZE = 512;

		/**
		It's everyone's favorite game: bin packing!

		There's a big bin: total memory
		There's a smaller bin: the memory used by this scraped object
		There's smaller bins: the memory used by each child of this scraped object

		Our job is to copy as much useful information we can without overflowing
		the big bin (total memory). For now, we pretend that bin is bottomless.

		So our job is really to copy as much useful information as we can into
		the MAX_TOTAL_SIZE "bytes" allocated to this scraped object. We do this
		by performing a deep copy, and any time we encounter an object that's
		sufficiently large to put us over the limit, we store a reference to it
		instead of copying it.

		In this function, the "size" of a copy is approximated by summing the
		lengths of all strings, the lengths of all keys, and the count of
		objects of any other type, ignoring the overhead of array/object storage.
		**/

		// returns array: [approx size of copy, copy]
		var scrape = function (o, depth) {
			if (typeof(o) === "string") return [o.length, o]; // don't worry about retaining strings > MAX_TOTAL_SIZE, for now

			if (depth <= 0) return [1, o]; // XXX: even if there's a ton there, count it as 1
			if (o === null || typeof(o) !== "object") return [1, o];

			// return only the first MAX_BUFFER_LENGTH bytes of a Buffer
			if (typeof(Buffer) === "function" && (o instanceof Buffer)) {
				var len = Math.min(o.length, MAX_BUFFER_LENGTH);
				var o2 = new Buffer(len);
				if (o.length > MAX_BUFFER_LENGTH) {
					o2.__theseusTruncated = { length: o.length - MAX_BUFFER_LENGTH };
				}
				try { o.copy(o2, 0, 0, len); } catch (e) { }
				return [len, o2];
			}

			try {
				var size = 0;
				var o2 = (o instanceof Array) ? [] : {};
				for (var key in o) {
					if ((o.__lookupGetter__ instanceof Function) && o.__lookupGetter__(key))
						continue;
					if (!(o.hasOwnProperty instanceof Function) || !o.hasOwnProperty(key))
						continue;
					var scraped = scrape(o[key], depth - 1);
					var childSize = key.length + scraped[0];
					if (size + childSize <= MAX_TOTAL_SIZE) {
						size += childSize;
						o2[key] = scraped[1];
					} else {
						// XXX: if it's an array and this is a numeric key, count it as truncating the length instead
						if (!("__theseusTruncated" in o2)) {
							o2.__theseusTruncated = { keys: 0 };
						}
						o2.__theseusTruncated.keys++;
						o2[key] = o[key];
					}
				}
				return [size, o2];
			} catch (e) {
				console.log("[fondue] couldn't scrape", o, e);
				return [1, o];
			}
		};

		return scrape(object, 1)[1];
	}

	function Invocation(info, type) {
		this.tick = nextInvocationId++;
		this.id = TRACER_ID + "-" + this.tick;
		this.timestamp = new Date().getTime();
		this.type = type;
		this.f = nodeById[info.nodeId];
		this.childLinks = [];
		this.parentLinks = [];
		this.returnValue = undefined;
		this.exception = undefined;
		this.topLevelInvocationId = undefined;
		this.epochID = undefined;
		this.epochDepth = undefined;
		this.arguments = info.arguments ? info.arguments.map(function (a) { return scrapeObject(a) }) : undefined;
		this.this = (info.this && info.this !== globalThis) ? scrapeObject(info.this) : undefined;

		invocationById[this.id] = this;
	}
	Invocation.prototype.equalToInfo = function (info) {
		return this.f.id === info.nodeId;
	};
	Invocation.prototype.linkToChild = function (child, linkType) {
		this.childLinks.push(new InvocationLink(child.id, linkType));
		child.parentLinks.push(new InvocationLink(this.id, linkType));
		if (['call', 'branch-enter'].indexOf(linkType) !== -1) {
			child.topLevelInvocationId = this.topLevelInvocationId;
		}
	};
	Invocation.prototype.getChildren = function (linkFilter) {
		var links = this.childLinks;
		if (linkFilter) {
			links = links.filter(linkFilter);
		}
		return links.map(function (link) { return invocationById[link.id]; });
	};
	Invocation.prototype.getParents = function () {
		return this.parentLinks.map(function (link) { return invocationById[link.id]; });
	};
	Invocation.prototype.getParentLinks = function () {
		return this.parentLinks;
	};
	/**
	calls iter(invocation) for all children in sub-graph; if iter returns true,
	treats that invocation as a leaf and continues
	**/
	Invocation.prototype.walk = function (iter) {
		this.getChildren().forEach(function (child) {
			if (iter(child) !== true) {
				child.walk(iter);
			}
		});
	};

	function InvocationLink(destId, type) {
		this.id = destId;
		this.type = type;
	}

	function Epoch(id, emitterID, eventName) {
		this.id = id;
		this.emitterID = emitterID;
		this.eventName = eventName;
	}

	function nextEpoch(emitterID, eventName) {
		var epochID = ++_lastEpochID;
		var epoch = new Epoch(epochID, emitterID, eventName);
		return epoch;
	}

	function hit(invocation) {
		var id = invocation.f.id;
		for (var handle in nodeHitCounts) {
			var hits = nodeHitCounts[handle];
			hits[id] = (hits[id] || 0) + 1;
		}

		// if this is console.log, we'll want the call site in a moment
		var callSite;
		if (invocation.f.id === "log") {
			callSite = invocation.getParents().filter(function (inv) { return inv.type === "callsite" })[0];
		}

		// add this invocation to all the relevant log queries
		for (var handle in _logQueries) {
			var query = _logQueries[handle];
			if (query.logs && invocation.f.id === "log") {
				if (callSite) {
					logEntries[handle].push(callSite.id);
				} else {
					console.log("no call site! I needed one!", invocation.getParents());
				}
			}
			if (query.ids && query.ids.indexOf(id) !== -1) {
				logEntries[handle].push(invocation.id);
			}
		}
	}

	function calculateHitCounts() {
		var hits = {};
		nodes.forEach(function (n) {
			if (n.id in invocationsByNodeId) {
				hits[n.id] = invocationsByNodeId[n.id].length;
			}
		});
		return hits;
	}

	function calculateExceptionCounts() {
		var counts = {};
		nodes.forEach(function (n) {
			if (n.id in exceptionsByNodeId) {
				counts[n.id] = exceptionsByNodeId[n.id].length;
			}
		});
		return counts;
	}

	/** return ordered list of invocation ids for the given log query */
	function backlog(query) {
		var seenIds = {};
		var ids = [];

		function addIfUnseen(id) {
			if (!(id in seenIds)) {
				ids.push(id);
				seenIds[id] = true;
			}
		}

		var getId = function (invocation) { return invocation.id };

		if (query.ids) {
			query.ids.forEach(function (nodeId) {
				var invocations = (invocationsByNodeId[nodeId] || []);
				invocations.map(getId).forEach(addIfUnseen);

				// add logs that are called directly from this function
				invocations.forEach(function (invocation) {
					invocation.walk(function (child) {
						var isFunction = child.type === "function";
						if (isFunction && child.f.id === "log") {
							var callSite = child.getParents().filter(function (inv) { return inv.type === "callsite" })[0];
							if (callSite) {
								addIfUnseen(callSite.id);
							}
						}
						return isFunction;
					})
				});
			});
		}

		if (query.eventNames) {
			query.eventNames.forEach(function (name) {
				(_topLevelInvocationsByEventName[name] || []).map(getId).forEach(addIfUnseen);
			});
		}

		if (query.exceptions) {
			for (var nodeId in exceptionsByNodeId) {
				exceptionsByNodeId[nodeId].map(function (o) { return o.invocationId }).forEach(addIfUnseen);
			}
		}

		if (query.logs) {
			(invocationsByNodeId["log"] || []).forEach(function (invocation) {
				var callSite = invocation.getParents().filter(function (inv) { return inv.type === "callsite" })[0];
				if (callSite) {
					addIfUnseen(callSite.id);
				}
			});
		}

		ids = ids.sort(function (a, b) { return invocationById[a].tick - invocationById[b].tick });
		return ids;
	}


	// instrumentation

	function bailThisTick(fromNode) {
		_bailedTick = true;
		invocationStack = [];
		_epochStack = [];
		_epochInvocationDepth = [];
		anonFuncParentInvocation = undefined;
		lastException = undefined;

		if (fromNode) {
			console.log("[fondue] bailing from " + (fromNode.name ? (fromNode.name + " at ") : "") + fromNode.path + " line " + fromNode.start.line + ", character " + fromNode.start.column);
		} else {
			console.log("[fondue] bailing! trace collection will resume next tick");
		}
		if (!_explainedBails) {
			console.log("[fondue] (fondue is set to automatically bail after {maxInvocationsPerTick} invocations within a single tick. If you are using node-theseus, you can use the --theseus-max-invocations-per-tick=XXX option to raise the limit, but it will require more memory)");
			_explainedBails = true;
		}
	}

	function endBail() {
		_bailedTick = false;
		_invocationsThisTick = 0;

		console.log('[fondue] resuming trace collection after bailed tick');
	}

	function pushNewInvocation(info, type) {
		if (_bailedTick) {
			_invocationStackSize++;
			return;
		}

		var invocation = new Invocation(info, type);
		pushInvocation(invocation);
		return invocation;
	}

	function pushInvocation(invocation) {
		_invocationStackSize++;

		if (_bailedTick) return;

		_invocationsThisTick++;
		if (_invocationsThisTick === {maxInvocationsPerTick}) {
			bailThisTick(invocation.f);
			return;
		}

		// associate with epoch, if there is one
		if (_epochStack.length > 0) {
			var epoch = _epochStack[_epochStack.length - 1];
			var depth = _epochInvocationDepth[_epochInvocationDepth.length - 1];
			invocation.epochID = epoch.id;
			invocation.epochDepth = depth;

			_epochInvocationDepth[_epochInvocationDepth.length - 1]++;

			// hang on to the epoch now that it's part of the call graph
			_epochsById[epoch.id] = epoch;

			if (!(epoch.eventName in _epochsByName)) {
				_epochsByName[epoch.eventName] = [];
			}
			_epochsByName[epoch.eventName].push(epoch);

			if (depth === 0) {
				epochTracker.update(epoch);

				if (!(epoch.eventName in _topLevelEpochsByName)) {
					_topLevelEpochsByName[epoch.eventName] = [];
					_topLevelInvocationsByEventName[epoch.eventName] = [];
				}
				_topLevelEpochsByName[epoch.eventName].push(epoch);
				_topLevelInvocationsByEventName[epoch.eventName].push(invocation);

				for (var handle in _logQueries) {
					var query = _logQueries[handle];
					if (query.eventNames && query.eventNames.indexOf(epoch.eventName) !== -1) {
						logEntries[handle].push(invocation.id);
					}
				}
			}
		}

		// add to invocationsByNodeId
		if (!invocationsByNodeId[invocation.f.id]) {
			invocationsByNodeId[invocation.f.id] = [];
		}
		invocationsByNodeId[invocation.f.id].push(invocation);

		// associate with caller, if there is one; otherwise, save as a top-level invocation
		var top = invocationStack[invocationStack.length - 1];
		if (top) {
			top.linkToChild(invocation, 'call');
		} else {
			invocation.topLevelInvocationId = invocation.id;
		}

		// associate with the invocation where this anonymous function was created
		if (anonFuncParentInvocation) {
			anonFuncParentInvocation.linkToChild(invocation, 'async');
			anonFuncParentInvocation = undefined;
		}

		// update hit counts
		hit(invocation);

		invocationStack.push(invocation);
	}

	function popInvocation(info) {
		_invocationStackSize--;
		if (_bailedTick && _invocationStackSize === 0) {
			endBail();
			return;
		}

		if (_bailedTick) return;

		var top = invocationStack.pop();

		if (top) {
			// if the tick was bailed or something, there might not be an invocation
			top.endTimestamp = new Date().getTime();
			top.duration = top.endTimestamp - top.timestamp;
		}

		if (invocationStack.length === 0) {
			_invocationsThisTick = 0;
			lastException = undefined;

			// make the file call graph for this tick

			// if the tick was bailed or something, there might not be an invocation
			if (top) {
				function makeSubgraph(invocation, node) {
					if (!node) {
						node = { path: invocation.f.path, nodeId: invocation.f.id, eventNames: [], children: [] };
					} else if (node.path !== invocation.f.path) {
						var parent = node;
						node = { path: invocation.f.path, nodeId: invocation.f.id, eventNames: [], children: [] };
						parent.children.push(node);
					}
					if (invocation.epochID) {
						var epoch = _epochsById[invocation.epochID];
						if (epoch.eventName !== undefined && node.eventNames.indexOf(epoch.eventName) === -1) {
							node.eventNames.push(epoch.eventName);
						}
					}
					invocation.getChildren(function (link) { return link.type === "call" }).forEach(function (child) {
						makeSubgraph(child, node);
					});
					return node;
				}

				var item = makeSubgraph(top);
				_fileCallGraph.push(item);
				fileCallGraphTracker.update(item);
			}
		}

		if (_epochStack.length > 0) {
			_epochInvocationDepth[_epochInvocationDepth.length - 1]--;
		}
	}

	/**
	 * called from the top of every script processed by the rewriter
	 */
	this.add = function (path, options) {
		nodes.push.apply(nodes, options.nodes);
		options.nodes.forEach(function (n) { nodeById[n.id] = n; });

		nodeTracker.update(options.nodes);

		_sendNodes(options.nodes);
	};

	this.addSourceMap = function (path, mapJSON) {
		_sourceMaps[path] = _sourceMaps[path + ".fondue"] = new sourceMap.SourceMapConsumer(mapJSON);
	};

	this.traceFileEntry = function (info) {
		pushNewInvocation(info, 'toplevel');
	};

	this.traceFileExit = function (info) {
		popInvocation(info);
	};

	this.setGlobal = function (gthis) {
		globalThis = gthis;
	}

	/**
	 * the rewriter wraps every anonymous function in a call to traceFunCreate.
	 * a new function is returned that's associated with the parent invocation.
	 */
	this.traceFunCreate = function (f, src) {
		var creatorInvocation = invocationStack[invocationStack.length - 1];
		var creatorInvocationId = creatorInvocation ? creatorInvocation.id : undefined;
		var newF;

		// Some code changes its behavior depending on the arity of the callback.
		// Therefore, we construct a replacement function that has the same arity.
		// The most direct route seems to be to use eval() (as opposed to
		// new Function()), so that creatorInvocation can be accessed from the
		// closure.

		var arglist = '';
		for (var i = 0; i < f.length; i++) {
			arglist += (i > 0 ? ', ' : '') + 'v' + i;
		}

		var sharedBody = 'return f.apply(this, arguments);';

		if (creatorInvocation) {
			// traceEnter checks anonFuncParentInvocation and creates
			// an edge in the graph from the creator to the new invocation.
			// Look up by ID instead of using creatorInvocation directly in case
			// the trace has been cleared and the original invocation no longer
			// exists.
			var asyncBody = 'anonFuncParentInvocation = invocationById[creatorInvocationId];';
			var newSrc = '(function (' + arglist + ') { ' + asyncBody + sharedBody + '})';
			newF = eval(newSrc);
		} else {
			var newSrc = '(function (' + arglist + ') { ' + sharedBody + '})';
			newF = eval(newSrc);
		}
		newF.toString = function () { return src };
		return newF;
	};

	/** helper for traceFunCall below */
	var _traceLogCall = function (info) {
		var queryMatchesInvocation = function (handle, invocation) {
			var query = _logQueries[handle];
			var epoch = _epochsById[invocation.epochID];
			if (query.logs && invocation.f.id === "log") {
				return true;
			} else if (query.exceptions && invocation.exception) {
				return true;
			} else if (query.ids && query.ids.indexOf(invocation.f.id) !== -1) {
				return true;
			} else if (query.eventNames && epoch && query.eventNames.indexOf(epoch.eventName) !== -1) {
				return true;
			}
			return false;
		};
		var matchingQueryHandles = function (invocation) {
			return Object.keys(_logQueries).filter(function (handle) {
				return queryMatchesInvocation(handle, invocation);
			});
		};

		return function () {
			console.log.apply(console, arguments);

			var callerInvocation = invocationStack[invocationStack.length - 1];

			info.arguments = Array.prototype.slice.apply(arguments); // XXX: mutating info may not be okay, but we want the arguments

			var callSiteInvocation = pushNewInvocation(info, 'callsite');
			pushNewInvocation({ nodeId: "log", arguments: info.arguments }, 'function');
			popInvocation();
			popInvocation();

			// if called directly from an invocation that's in the query, add
			// this log statement invocation as well
			// (callSiteInvocation might be falsy if this tick was bailed)
			if (callerInvocation && callSiteInvocation) {
				matchingQueryHandles(callerInvocation).forEach(function (handle) {
					logEntries[handle].push(callSiteInvocation.id);
				});
			}
		}
	};

	/**
	 * the rewriter wraps the callee portion of every function call with a call
	 * to traceFunCall like this:
	 *
	 *   a.b('foo') -> (traceFunCall({ this: a, property: 'b', nodeId: '...', vars: {}))('foo')
	 *   b('foo') -> (traceFunCall({ func: b, nodeId: '...', vars: {}))('foo')
	 */
	this.traceFunCall = function (info) {
		var customThis = false, fthis, func;

		if ('func' in info) {
			func = info.func;
		} else {
			customThis = true;
			fthis = info.this;
			func = fthis[info.property];
		}

		// if it doesn't look like a function, it's faster not to wrap it with
		// all of the cruft below
		if (!func) {
			return func;
		}

		if (typeof console !== 'undefined' && func === console.log) {
			return _traceLogCall(info);
		}

		return function () {
			info.arguments = Array.prototype.slice.apply(arguments); // XXX: mutating info may not be okay, but we want the arguments
			var invocation = pushNewInvocation(info, 'callsite');

			try {
				// this used to be func.apply(t, arguments), but not all functions
				// have apply. so we apply Function.apply instead.
				var t = customThis ? fthis : this;
				return Function.apply.apply(func, [t].concat(arguments));
			} finally {
				popInvocation();
			}
		}
	};

	/**
	 * the rewriter calls traceEnter from just before the try clause it wraps
	 * function bodies in. info is an object like:
	 *
	 *   {
	 *     start: { line: ..., column: ... },
	 *     end: { line: ..., column: ... },
	 *     vars: { a: a, b: b, ... }
	 *   }
	 */
	this.traceEnter = function (info) {
		pushNewInvocation(info, 'function');
	};

	/**
	 * the rewriter calls traceExit from the finally clause it wraps function
	 * bodies in. info is an object like:
	 *
	 *   {
	 *     start: { line: ..., column: ... },
	 *     end: { line: ..., column: ... }
	 *   }
	 *
	 * in the future, traceExit will be passed an object with all the
	 * local variables of the instrumented function.
	 */
	this.traceExit = function (info) {
		popInvocation(info);
	};

	this.traceReturnValue = function (value) {
		if (_bailedTick) return value;

		var top = invocationStack[invocationStack.length - 1];
		if (!top) {
			throw new Error('value returned with nothing on the stack');
		}
		top.returnValue = scrapeObject(value);
		return value;
	}

	/**
	 * the rewriter calls traceExceptionThrown from the catch clause it wraps
	 * function bodies in. info is an object like:
	 *
	 *   {
	 *     start: { line: ..., column: ... },
	 *     end: { line: ..., column: ... }
	 *   }
	 */
	this.traceExceptionThrown = function (info, exception) {
		if (_bailedTick) return;

		if (exception === lastException) {
			return;
		}
		lastException = exception;

		var parsedStack;
		if (exception.stack) {
			var mapFrame = function (frame) {
				if (frame.path in _sourceMaps) {
					var pos = _sourceMaps[frame.path].originalPositionFor({ line: frame.line, column: frame.column });
					frame.path = pos.source;
					frame.line = pos.line;
					frame.column = pos.column;
				}
				return frame;
			};

			var shouldIgnoreFrame = function (frame) {
				return /node-theseus\.js/.test(frame.path) || /^Module\.(load|_compile)$/.test(frame.at);
			};

			parsedStack = [];
			var match, match2,
				wholeMatchRegexp = /\n    at ([^(]+) \((.*):(\d+):(\d+)\)/g; // TODO: match lines without column numbers
				partialMatchRegexp = /at ([^(]+) \((.*):(\d+):(\d+)\)/g;
			while (match = wholeMatchRegexp.exec(exception.stack)) {
				var frame = mapFrame({
					at: match[1],
					path: match[2],
					line: parseInt(match[3]),
					column: parseInt(match[4]),
				});
				if (/^eval at /.test(match[2]) && (match2 = partialMatchRegexp.exec(match[2]))) {
					frame.evalFrame = mapFrame({
						at: match2[1],
						path: match2[2],
						line: parseInt(match2[3]),
						column: parseInt(match2[4]),
					});
				}
				if (!shouldIgnoreFrame(frame) && (!frame.evalFrame || !shouldIgnoreFrame(frame.evalFrame))) {
					parsedStack.push(frame);
				}
			}
		}

		var top = invocationStack[invocationStack.length - 1];
		if (!top || !top.equalToInfo(info)) {
			throw new Error('exception thrown from a non-matching enter');
		}
		top.exception = exception;
		top.rawStack = exception.stack;
		if (parsedStack) top.exceptionStack = parsedStack;

		if (!exceptionsByNodeId[top.f.id]) {
			exceptionsByNodeId[top.f.id] = [];
		}
		exceptionsByNodeId[top.f.id].push({ exception: exception, invocationId: top.id });

		var id = top.f.id;
		for (var handle in exceptionCounts) {
			var hits = exceptionCounts[handle];
			hits[id] = (hits[id] || 0) + 1;
		}

		for (var handle in _logQueries) {
			if (_logQueries[handle].exceptions) {
				logEntries[handle].push(top.id);
			}
		}
	};

	/** cease collecting trace information until the next tick **/
	this.bailThisTick = bailThisTick;

	this.pushEpoch = function (epoch) {
		_epochStack.push(epoch);
		_epochInvocationDepth.push(0);
	};

	this.popEpoch = function () {
		_epochStack.pop();
		_epochInvocationDepth.pop();
	}

	if ({nodejs}) {
		// override EventEmitter.emit() to automatically begin epochs when events are thrown
		var EventEmitter = require('events').EventEmitter;
		var oldEmit = EventEmitter.prototype.emit;
		EventEmitter.prototype.emit = function (ev) {
			// give this emitter an identifier if it doesn't already have one
			if (!this._emitterID) {
				this._emitterID = ++_lastEmitterID;
			}

			// start an epoch & emit the event
			var epoch = nextEpoch(this._emitterID, ev);
			{name}.pushEpoch(epoch);
			try {
				return oldEmit.apply(this, arguments);
			} finally {
				{name}.popEpoch();
			}
		};
	}

	this.augmentjQuery = function ($) {
		var trigger = $.event.trigger, triggerHandler = $.event.triggerHandler;
		var core_hasOwn = {}.hasOwnProperty;
		$.event.trigger = function (event) {
			var type = core_hasOwn.call(event, "type") ? event.type : event;
			var epoch = nextEpoch(-1 /* emitterID */, type);

			{name}.pushEpoch(epoch);
			try {
				return trigger.apply($.event, arguments);
			} finally {
				{name}.popEpoch();
			}
		};
		$.event.triggerHandler = function (event) {
			var type = core_hasOwn.call(event, "type") ? event.type : event;
			var epoch = nextEpoch(-1 /* emitterID */, type);

			{name}.pushEpoch(epoch);
			try {
				return triggerHandler.apply($.event, arguments);
			} finally {
				{name}.popEpoch();
			}
		};
	};


	// remote prebuggin' (from Brackets)

	var _sendNodes = function (nodes) {
		if (_connected) {
			_sendBracketsMessage('scripts-added', JSON.stringify({ nodes: nodes }));
		}
	};

	function _sendBracketsMessage(name, value) {
		var key = "data-{name}-" + name;
		document.body.setAttribute(key, value);
		window.setTimeout(function () { document.body.removeAttribute(key); });
	}

	this.version = function () {
		return {version};
	};

	// deprecated
	this.connect = function () {
		if (typeof console !== 'undefined') console.log("Opening the Developer Console will break the connection with Brackets!");
		_connected = true;
		_sendNodes(nodes);
		return this;
	};

	this.resetTrace = _resetTrace;

	// accessors

	// this is mostly here for unit tests, and not necessary or encouraged
	// use trackNodes instead
	this.nodes = function () {
		return nodes;
	};

	this.trackNodes = function () {
		return nodeTracker.track();
	};

	this.untrackNodes = function () {
		return nodeTracker.untrack();
	};

	this.newNodes = function (handle) {
		return nodeTracker.delta(handle);
	};

	this.trackHits = function () {
		var handle = _hitQueries.push(true) - 1;
		nodeHitCounts[handle] = calculateHitCounts();
		return handle;
	};

	this.trackExceptions = function () {
		var handle = _exceptionQueries.push(true) - 1;
		exceptionCounts[handle] = calculateExceptionCounts();
		return handle;
	};

	this.trackLogs = function (query) {
		var handle = _logQueries.push(query) - 1;
		logEntries[handle] = backlog(query);
		return handle;
	};

	this.trackEpochs = function () {
		return epochTracker.track();
	};

	this.untrackEpochs = function (handle) {
		return epochTracker.untrack(handle);
	};

	this.trackFileCallGraph = function () {
		return fileCallGraphTracker.track();
	};

	this.untrackFileCallGraph = function (handle) {
		return fileCallGraphTracker.untrack(handle);
	};

	this.fileCallGraphDelta = function (handle) {
		return fileCallGraphTracker.delta(handle);
	};

	this.hitCountDeltas = function (handle) {
		if (!(handle in _hitQueries)) {
			throw new Error("unrecognized query");
		}
		var result = nodeHitCounts[handle];
		nodeHitCounts[handle] = {};
		return result;
	};

	this.newExceptions = function (handle) {
		if (!(handle in _exceptionQueries)) {
			throw new Error("unrecognized query");
		}
		var result = exceptionCounts[handle];
		exceptionCounts[handle] = {};
		return { counts: result };
	};

	this.epochDelta = function (handle) {
		return epochTracker.delta(handle);
	};

	// okay, the second argument is kind of a hack
	function makeLogEntry(invocation, parents) {
		parents = (parents || []);
		var entry = {
			timestamp: invocation.timestamp,
			tick: invocation.tick,
			invocationId: invocation.id,
			topLevelInvocationId: invocation.topLevelInvocationId,
			nodeId: invocation.f.id,
		};
		if (invocation.epochID !== undefined) {
			var epoch = _epochsById[invocation.epochID];
			entry.epoch = {
				id: epoch.id,
				emitterID: epoch.emitterID,
				eventName: epoch.eventName,
			};
			entry.epochDepth = invocation.epochDepth;
		}
		if (invocation.returnValue !== undefined) {
			entry.returnValue = marshalForTransmission(invocation.returnValue);
		}
		if (invocation.exception !== undefined) {
			entry.exception = marshalForTransmission(invocation.exception);
		}
		if (invocation.f.params || invocation.arguments) {
			entry.arguments = [];
			var params = invocation.f.params || [];
			for (var i = 0; i < params.length; i++) {
				var param = params[i];
				entry.arguments.push({
					name: param.name,
					value: marshalForTransmission(invocation.arguments[i]),
				});
			}
			for (var i = params.length; i < invocation.arguments.length; i++) {
				entry.arguments.push({
					value: marshalForTransmission(invocation.arguments[i]),
				});
			}
		}
		if (invocation.this !== undefined) {
			entry.this = marshalForTransmission(invocation.this);
		}
		if (parents.length > 0) {
			entry.parents = parents;
		}
		return entry;
	}

	this.logCount = function (handle) {
		if (!(handle in _logQueries)) {
			throw new Error("unrecognized query");
		}

		return logEntries[handle].length;
	};

	this.logDelta = function (handle, maxResults) {
		if (!(handle in _logQueries)) {
			throw new Error("unrecognized query");
		}

		maxResults = maxResults || 10;

		var ids = logEntries[handle].splice(0, maxResults);
		var results = ids.map(function (invocationId, i) {
			var invocation = invocationById[invocationId];
			return makeLogEntry(invocation, findParentsInQuery(invocation, _logQueries[handle]));
		});

		return results;
	};

	this.backtrace = function (options) {
		options = mergeInto(options, {
			range: [0, 10],
		});

		var invocation = invocationById[options.invocationId];
		if (!invocation) {
			throw new Error("invocation not found");
		}

		var stack = [];
		if (options.range[0] <= 0) {
			stack.push(invocation);
		}

		function search(invocation, depth) {
			// stop if we're too deep
			if (depth+1 >= options.range[1]) {
				return;
			}

			var callers = findCallers(invocation);
			var directCallers = callers.filter(function (c) { return c.type === "call" })
			var caller = directCallers[0];

			if (caller) {
				var parent = invocationById[caller.invocationId];
				if (options.range[0] <= depth+1) {
					stack.push(parent);
				}
				search(parent, depth + 1);
			}
		}
		search(invocation, 0);
		var results = stack.map(function (invocation) {
			return makeLogEntry(invocation);
		});
		return results;
	};

	function findParentsInQuery(invocation, query) {
		if (!query.ids || query.ids.length === 0) {
			return [];
		}

		var matches = {}; // invocation id -> link
		var seen = {}; // invocation id -> true
		var types = ['async', 'call', 'branch-enter']; // in priority order
		function promoteType(type, newType) {
			if (types.indexOf(type) === -1 || types.indexOf(newType) === -1) {
				throw new Exception("invocation link type not known")
			}
			if (types.indexOf(newType) < types.indexOf(type)) {
				return newType;
			}
			return type;
		}
		function search(link, type) {
			if (link.id in seen) {
				return;
			}
			seen[link.id] = true;

			var targetInvocation = invocationById[link.id];
			if (query.ids.indexOf(targetInvocation.f.id) !== -1) { // if the called function is in the query
				if (link.id in matches) { // if we've already found this one
					if (link.type === 'call' && matches[link.id].type === 'async') { // if we found an async one before but this one is synchronous
						// overwrite the previous match
						matches[link.id] = {
							invocationId: link.id,
							type: type,
							inbetween: []
						};
					}
				} else { // if we haven't found this link before, store it
					matches[link.id] = {
						invocationId: link.id,
						type: type,
						inbetween: []
					};
				}
			} else {
				targetInvocation.getParentLinks().forEach(function (link) { search(link, promoteType(type, link.type)); });
			}
		}
		invocation.getParentLinks().forEach(function (link) { search(link, link.type); });

		// convert matches to an array
		var matchesArr = [];
		for (var id in matches) {
			matchesArr.push(matches[id]);
		}
		return matchesArr;
	}

	function findCallers(invocation) {
		var matches = {}; // invocation id -> link
		var seen = {}; // invocation id -> true
		var types = ['async', 'call', 'branch-enter']; // in priority order
		function promoteType(type, newType) {
			if (types.indexOf(type) === -1 || types.indexOf(newType) === -1) {
				throw new Exception("invocation link type not known")
			}
			if (types.indexOf(newType) < types.indexOf(type)) {
				return newType;
			}
			return type;
		}
		function search(link, type) {
			if (link.id in seen) {
				return;
			}
			seen[link.id] = true;

			if (invocationById[link.id].f.type === "function") {
				if (link.id in matches) {
					if (link.type === 'call' && matches[link.id].type === 'async') {
						matches[link.id] = {
							invocationId: link.id,
							type: type,
						};
					}
				} else {
					matches[link.id] = {
						invocationId: link.id,
						type: type,
					};
				}
				return; // search no more down this path
			}
			invocationById[link.id].getParentLinks().forEach(function (link) { search(link, promoteType(type, link.type)); });
		}
		invocation.getParentLinks().forEach(function (link) { search(link, link.type); });

		// convert matches to an array
		var matchesArr = [];
		for (var id in matches) {
			matchesArr.push(matches[id]);
		}
		return matchesArr;
	}

	this.Array = Array;
});
}
(function () { {name}.setGlobal(this); })();

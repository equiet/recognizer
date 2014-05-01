fondue
======

Collect real-time JavaScript traces (number of times a function has been called, locations where exceptions have been thrown, etc).

Easily instrument an entire program with [node-theseus](https://github.com/adobe-research/node-theseus).

Plain objects are returned from all API calls so that they can be passed around as JSON. [node-theseus](https://github.com/adobe-research/node-theseus) does this with a WebSocket. [Theseus](https://github.com/adobe-research/theseus) does it over Chrome's Remote Debugging API (which boils down to a WebSocket).

[![Build Status](https://travis-ci.org/adobe-research/fondue.png)](https://travis-ci.org/adobe-research/fondue)

Install
-------

    npm install fondue

Use
---

Execute instrumented code:

````javascript
var fondue = require('fondue'),
    vm = require('vm');

var src = fondue.instrument('function foo(a) { return a * 2 }; foo(4)');
var sandbox = { __tracer: undefined };
var output = vm.runInNewContext(src, sandbox);
var tracer = sandbox.__tracer; // created by fondue when instrumented code is run
````

Track trace points (functions, call sites, etc):

````javascript
var functions = {};
var nodesHandle = tracer.trackNodes();
tracer.newNodes(nodesHandle).forEach(function (n) {
	if (n.type === 'function') {
		functions[n.name] = n;
	}
});

var fooNode = functions['foo'];
console.log('foo started at', fooNode.start, 'and ended at', fooNode.end);

// call tracer.newNodes() periodically if you expect new code to be required over time
````

Track hit counts:

````javascript
// check how many times trace points have been hit
var hitsHandle = tracer.trackHits();
var hits1 = tracer.hitCountDeltas(hitsHandle);
console.log('foo was called ' + (hits1[fooNode.id] || 0) + ' time');

// call repeatedly to track hit counts over time
var hits2 = tracer.hitCountDeltas(hitsHandle);
console.log('foo was called ' + (hits2[fooNode.id] || 0) + ' times (since last check)');
````

Access function arguments and return values (and unhandled exceptions):

````javascript
var logHandle = tracer.trackLogs({ ids: [fooNode.id] });
var invocations = tracer.logDelta(logHandle);
console.log('foo returned:', invocations[0].returnValue);
console.log('foo accepted arguments:', invocations[0].arguments);
````

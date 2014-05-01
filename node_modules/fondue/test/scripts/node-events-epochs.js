var EventEmitter = require('events').EventEmitter;
var emitter1 = new EventEmitter;
emitter1.on('event1', function foo() { });
emitter1.on('event2', function bar() { });
emitter1.emit('event1');
emitter1.emit('event2');
emitter1.emit('event1');
setTimeout(function () {
	emitter1.emit('event2');
}, 100);

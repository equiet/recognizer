var EventEmitter = require('events').EventEmitter;
var emitter1 = new EventEmitter;
function bar() { };
emitter1.on('boop', function foo() {
	bar();
});
function baz() { }
emitter1.emit('boop', 'arg');
baz();

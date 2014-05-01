function foo(count) {
	for (var i = 0; i < count; i++) {
		bar();
	}
}
function bar() { }
function baz() { }

foo(5000);
setTimeout(function () {
	foo(50);
	baz();
});

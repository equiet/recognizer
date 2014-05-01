function foo(bail) {
	if (bail) {
		__tracer.bailThisTick();
	}

	bar();
}
function bar() {}

foo(true);
setTimeout(function () {
	foo(false);
}, 100);

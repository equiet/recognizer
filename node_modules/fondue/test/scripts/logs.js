function foo(a) {
	bar(a + 1);
}
function bar(b) {
}
foo(1, 'unnamed');
setTimeout(function timeout() { bar(3); }, 100)

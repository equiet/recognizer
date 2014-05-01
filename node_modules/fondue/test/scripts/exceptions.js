function foo() {
	function except() { throw 'lol' }
	try {
		except();
	} catch (e) {
	}
}
foo();
setTimeout(foo, 100);

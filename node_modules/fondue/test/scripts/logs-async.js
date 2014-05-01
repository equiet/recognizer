function call(f) {
	f();
}

function a() {
	call(function () {
		b();
	});
}
function b() {}

a();

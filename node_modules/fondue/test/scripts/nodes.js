function a(alpha, beta) {
	function b() {}
	return function c() {};
}
a();
a(function () { });

var x = { y: function () { } };
x.y(function () { });

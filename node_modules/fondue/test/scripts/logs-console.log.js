function a() { b() }
function b() { console.log(1) }
a();
setTimeout(function () { a(); }, 100);

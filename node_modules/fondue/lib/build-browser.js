var child_process = require('child_process');
var fs = require('fs');

process.chdir(__dirname);

var browserify = child_process.spawn('browserify', [__dirname + '/browser-main.js']);
var fondueSource = '';

browserify.stdout.on('data', function (data) {
	fondueSource += data.toString();
});

browserify.stderr.on('data', function (data) {
	console.error(data.toString());
});

browserify.on('close', function (code) {
	if (code !== 0) {
		console.error('browserify exited with', code);
		return;
	}

	var tracerRegexp = /\/\*tracer.js{\*\/.+\/\*}tracer.js\*\//;
	if (!tracerRegexp.test(fondueSource)) {
		console.error('location where tracer.js is was not found in browserified fondue.js');
		return;
	}

	var tracerStubRegexp = /\/\*tracer-stub.js{\*\/.+\/\*}tracer-stub.js\*\//;
	if (!tracerStubRegexp.test(fondueSource)) {
		console.error('location where tracer-stub.js is was not found in browserified fondue.js');
		return;
	}

	var tracerSource = fs.readFileSync(__dirname + '/lib/tracer.js', 'utf8');
	var tracerStubSource = fs.readFileSync(__dirname + '/lib/tracer-stub.js', 'utf8');
	var newFondueSource = fondueSource
		.replace(tracerRegexp, JSON.stringify(tracerSource))
		.replace(tracerStubRegexp, JSON.stringify(tracerStubSource));
	fs.writeFileSync(__dirname + '/fondue.browser.js', newFondueSource);
});

/*
The following code has been modified by fondue to collect information about its
execution.

https://github.com/adobe-research/fondue
*/

if (typeof {name} === 'undefined') {
	{name} = {};
	var methods = ["add", "addSourceMap", "traceFileEntry", "traceFileExit", "setGlobal", "traceFunCreate", "traceEnter", "traceExit", "traceReturnValue", "traceExceptionThrown", "bailThisTick", "pushEpoch", "popEpoch", "augmentjQuery", "version", "connect", "nodes", "trackNodes", "untrackNodes", "newNodes", "trackHits", "trackExceptions", "trackLogs", "trackEpochs", "untrackEpochs", "trackFileCallGraph", "untrackFileCallGraph", "fileCallGraphDelta", "hitCountDeltas", "newExceptions", "epochDelta", "logCount", "logDelta", "backtrace"];
	for (var i = 0; i < methods.length; i++) {
		{name}[methods[i]] = function () { return arguments[0] };
	}

	{name}.traceFunCall = function (info) {
		var customThis = false, fthis, func;

		if ('func' in info) {
			func = info.func;
		} else {
			customThis = true;
			fthis = info.this;
			func = fthis[info.property];
		}

		return function () {
			return func.apply(customThis ? fthis : this, arguments);
		};
	};

	{name}.Array = Array;
}

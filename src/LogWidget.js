define(function (require, exports, module) {
	'use strict';

	var EditorManager = brackets.getModule('editor/EditorManager'),
		DebugInlineWidget = require('src/DebugInlineWidget').InlineWidget;

	function LogWidget(position) {
		var hostEditor = EditorManager.getCurrentFullEditor();
		this.widget = new DebugInlineWidget(hostEditor);
		hostEditor.addInlineWidget({line: position.line - 1, ch: position.ch}, this.widget).done(function () {});
	}

	LogWidget.prototype.addRow = function (timestamp, args) {
		var d = new Date(timestamp);
		this.widget.addRow(this.widget.$lastGroup, ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2), ('00' + d.getMilliseconds()).slice(-3), args);
	};

	exports.LogWidget = LogWidget;

});
define(function (require, exports, module) {
	'use strict';

	var EditorManager = brackets.getModule('editor/EditorManager');

	function CounterWidget(position) {
		var _codeMirror = EditorManager.getCurrentFullEditor()._codeMirror;
		this.$el = $('<a href="#" />').addClass('recognizer-counter').text('23');
		this.marker = _codeMirror.setBookmark(
			{line: position.line - 1, ch: _codeMirror.lineInfo(position.line - 1).text.length},
			{widget: this.$el.get(0)}
		);
	}

	CounterWidget.prototype.updateCounter = function (count) {
		this.count = count;
		this.$el.text(count);
	};

	exports.CounterWidget = CounterWidget;

});
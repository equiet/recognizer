define(function (require, exports, module) {
	'use strict';

	var EditorManager = brackets.getModule('editor/EditorManager');

	function CounterWidget(position) {
		this.$el = $('<span />').addClass('recognizer-counter').text('23');
		this.marker = EditorManager.getCurrentFullEditor()._codeMirror.markText(
			{line: position.line - 1, ch: position.ch},
			{line: position.line - 1, ch: position.ch + 1},
			{replacedWith: this.$el.get(0), readOnly: true}
		);
	}

	CounterWidget.prototype.updateCounter = function (count) {
		this.count = count;
		this.$el.text(count);
	};

	exports.CounterWidget = CounterWidget;

});
define(function (require, exports, module) {
	'use strict';

	var EditorManager = brackets.getModule('editor/EditorManager');

	function CounterWidget(position) {
		var self = this;
		var _codeMirror = EditorManager.getCurrentFullEditor()._codeMirror;

		this.count = 0;

		this.$el = $('<a href="#" />')
			.addClass('recognizer-counter')
			.click(function(e) {
				e.preventDefault();
				$(self).trigger('click');
			});

		this.marker = _codeMirror.setBookmark(
			{line: position[2] - 1, ch: position[3]},
			{widget: this.$el.get(0)}
		);
	}

	CounterWidget.prototype.toggle = function(show) {
		this.$el.toggleClass('is-active', show);
	};

	CounterWidget.prototype.updateCounter = function (count) {
		this.count = count;
		this.$el.text(count);
	};

	CounterWidget.prototype.increaseCounter = function (count) {
		this.updateCounter(this.count + 1);
	};

	exports.CounterWidget = CounterWidget;

});
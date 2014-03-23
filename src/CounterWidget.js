define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        DocumentManager = brackets.getModule('document/DocumentManager');

    function CounterWidget(filepath, position) {
        var self = this;

        this.count = 0;
        this.$el = $('<a href="#" />')
            .addClass('recognizer-counter')
            .click(function(e) {
                e.preventDefault();
                $(self).trigger('click');
            });

        DocumentManager.getDocumentForPath(filepath).then(function(doc) {
            var codeMirror;
            doc._ensureMasterEditor();
            codeMirror = doc._masterEditor._codeMirror;

            this.marker = codeMirror.setBookmark(
                {line: position[2] - 1, ch: position[3]},
                {widget: this.$el.get(0)}
            );
        }.bind(this));
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

    CounterWidget.prototype.remove = function() {
        this.marker.clear();
    };

    exports.CounterWidget = CounterWidget;

});
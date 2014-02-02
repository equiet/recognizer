define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        CounterWidget = require('src/CounterWidget').CounterWidget,
        LogWidget = require('src/LogWidget').LogWidget;

    function FunctionWidget(position) {
        this.hostEditor = EditorManager.getCurrentFullEditor();
        this.counterWidget = new CounterWidget(position);
        this.logWidget = new LogWidget(position);

        this._expanded = false;

        $(this.counterWidget).on('click', function() {
            this._expanded = !this._expanded;
            this.counterWidget.toggle(this._expanded);
            this.logWidget.toggle(this._expanded);
        }.bind(this));
    }

    FunctionWidget.prototype.addEntry = function (entry, tracerId) {
        this.counterWidget.increaseCounter();
        this.logWidget.addRow(entry.time, entry.argsCount, entry.index, tracerId);
    };

    FunctionWidget.prototype.remove = function() {
        this.counterWidget.remove();
        this.logWidget.remove();
    };

    exports.FunctionWidget = FunctionWidget;

});
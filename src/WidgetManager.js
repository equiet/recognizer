define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        FunctionWidget = require('src/FunctionWidget').FunctionWidget;

    var widgets = {};

    function getWidget(position) {
        var id = JSON.stringify(position);

        if (widgets[id] === undefined) {
            widgets[id] = new FunctionWidget(position);
        }

        return widgets[id];
    }

    function removeAll() {
        Object.keys(widgets).forEach(function(id) {
            widgets[id].remove();
            delete widgets[id];
        });
    }

    exports.getWidget = getWidget;
    exports.removeAll = removeAll;

});
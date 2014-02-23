define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        FunctionWidget = require('src/FunctionWidget').FunctionWidget,
        ProbeWidget = require('src/ProbeWidget').ProbeWidget;

    var widgets = {},
        probeWidgets = {};

    function getWidget(position) {
        var id = JSON.stringify(position);

        if (widgets[id] === undefined) {
            widgets[id] = new FunctionWidget(position);
        }

        return widgets[id];
    }

    function getProbeWidget(position) {
        var id = JSON.stringify(position);

        if (probeWidgets[id] === undefined) {
            probeWidgets[id] = new ProbeWidget(position);
        }

        return probeWidgets[id];
    }

    function removeAll() {
        Object.keys(widgets).forEach(function(id) {
            widgets[id].remove();
            delete widgets[id];
        });
    }

    exports.getWidget = getWidget;
    exports.getProbeWidget = getProbeWidget;
    exports.removeAll = removeAll;

});
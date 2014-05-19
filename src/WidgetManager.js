define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        FunctionWidget = require('src/FunctionWidget').FunctionWidget,
        ProbeWidget = require('src/ProbeWidget').ProbeWidget;

    var widgets = {},
        probeWidgets = {};

    // Returns a function widget (and creates it if needed)
    function getWidget(filepath, position) {
        var id = JSON.stringify(position);

        if (widgets[id] === undefined) {
            widgets[id] = new FunctionWidget(filepath, position);
        }

        return widgets[id];
    }

    // Returns a probe widget (and creates it if needed)
    function getProbeWidget(filepath, position) {
        var id = JSON.stringify(position);

        if (probeWidgets[id] === undefined) {
            probeWidgets[id] = new ProbeWidget(filepath, position);
        }

        return probeWidgets[id];
    }

    function removeAll() {
        Object.keys(widgets).forEach(function(id) {
            widgets[id].remove();
            delete widgets[id];
        });
        Object.keys(probeWidgets).forEach(function(id) {
            probeWidgets[id].remove();
            delete probeWidgets[id];
        });
    }

    exports.getWidget = getWidget;
    exports.getProbeWidget = getProbeWidget;
    exports.removeAll = removeAll;

});
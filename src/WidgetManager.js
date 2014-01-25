define(function (require, exports, module) {
    'use strict';

    var FunctionWidget = require('src/FunctionWidget').FunctionWidget;

    var _widgets = {};

    function _matchPosition(id) {
        return id.match(/function-(\d+)-(\d+)-(\d+)-(\d+)$/i);
    }

    function _getPositionFromId(id) {
        var values = _matchPosition(id);
        return {
            line: parseInt(values[1], 10),
            ch: parseInt(values[2], 10)
        };
    }

    function getWidget(position) {
        var id = JSON.stringify(position);

        if (_widgets[id] === undefined) {
            _widgets[id] = new FunctionWidget(position);
        }

        return _widgets[id];
    }

    exports.getWidget = getWidget;

});
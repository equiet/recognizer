define(function (require, exports, module) {
    'use strict';

    var CounterWidget = require('src/CounterWidget').CounterWidget,
        LogWidget = require('src/LogWidget').LogWidget;

    var _widgets = {};

    function _createWidget(id) {
        return {
            counter: new CounterWidget(_getPositionFromId(id), function () { _widgets[id].log.widget.showToggle(); }),
            log: new LogWidget(_getPositionFromId(id))
        };
    }

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

    function getWidget(id) {
        // Throw away some weird ids that are not really our functions
        if (!_matchPosition(id)) {
            return null;
        }
        if (_widgets[id] === undefined) {
            _widgets[id] = _createWidget(id);
        }
        return _widgets[id];
    }

    exports.getWidget = getWidget;

});
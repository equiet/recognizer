define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        WebInspector = require('thirdparty/WebInspector');

    function ProbeWidget(position) {
        var _codeMirror = EditorManager.getCurrentFullEditor()._codeMirror;

        this.$el = $('<span />').addClass('recognizer-probe-widget');

        position = position.split(',');

        this.marker = _codeMirror.setBookmark(
            {line: parseInt(position[2], 10) - 1, ch: parseInt(position[3], 10)},
            {widget: this.$el.get(0)}
        );

    }

    ProbeWidget.prototype.updateValue = function (position, tracerId) {

        Inspector.Runtime.evaluate('__recognizer' + tracerId + '._probeValues["' + position + '"]', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
            var result = WebInspector.RemoteObject.fromPayload(res.result);
            var message = new WebInspector.ConsoleCommandResult(result, !!res.wasThrown, '', WebInspector.Linkifier, undefined, undefined, undefined);
            this.$el.html(message.toMessageElement());
        }.bind(this));

    };

    ProbeWidget.prototype.remove = function() {
        this.marker.clear();
    };


    exports.ProbeWidget = ProbeWidget;

});
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        WebInspector = require('thirdparty/WebInspector'),
        DocumentManager = brackets.getModule('document/DocumentManager');

    function ProbeWidget(filepath, position) {
        this._lastResult = undefined;

        this.$el = $('<span />').addClass('recognizer-probe-widget');
        position = position.split(',');

        // Setup a marker
        DocumentManager.getDocumentForPath(filepath).then(function(doc) {
            var codeMirror;
            doc._ensureMasterEditor();
            codeMirror = doc._masterEditor._codeMirror;

            this.marker = codeMirror.setBookmark(
                {line: parseInt(position[2], 10) - 1, ch: parseInt(position[3], 10)},
                {widget: this.$el.get(0)}
            );
        }.bind(this));
    }

    ProbeWidget.prototype.updateValue = function (position, tracerId) {
        Inspector.Runtime.evaluate('__recognizer' + tracerId + '._probeValues["' + position + '"]', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
            var result = WebInspector.RemoteObject.fromPayload(res.result);
            var message = new WebInspector.ConsoleCommandResult(result, !!res.wasThrown, '', WebInspector.Linkifier, undefined, undefined, undefined);
            var messageElement = message.toMessageElement();

            // Primitive caching
            if (messageElement.innerHTML === this._lastResult) {
                return;
            }
            this._lastResult = messageElement.innerHTML;

            this.$el.html(messageElement);
        }.bind(this));
    };

    ProbeWidget.prototype.remove = function() {
        this.marker.clear();
    };


    exports.ProbeWidget = ProbeWidget;

});
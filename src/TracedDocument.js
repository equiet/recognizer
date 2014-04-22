/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        WebInspector = require('thirdparty/WebInspector'),
        DocumentManager = brackets.getModule('document/DocumentManager');

    function TracedDocument(file, tracerId, code, instrumentableObjects) {
        this.file = file;
        this.tracerId = tracerId;
        this.code = code;
        this.instrumentableObjects = instrumentableObjects;
        this._state = 'disconnected';
        DocumentManager.getDocumentForPath(file.fullPath).then(function(doc) {
            this.hostEditor = doc._masterEditor;
        }.bind(this));
        this.markers = {};
        this._probesCache = {};
    }

    TracedDocument.prototype.isReady = function() {
        return this._state === 'connected';
    };

    TracedDocument.prototype.connect = function() {
        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.connect()', function (res) {
            if (!res.wasThrown) {
                this._objectId = res.result.objectId;
                this._state = 'connected';
                $(exports).trigger('connected');
                console.log('[recognizer] Connected to tracer in ' + this.file.name);
            } else {
                console.log('[recognizer] Error connecting to tracer in ' + this.file.name, res);
            }
        }.bind(this));
    };

    TracedDocument.prototype.disconnect = function() {
        this._state = 'disconnected';
    };

    TracedDocument.prototype.getLog = function(since, callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.getCalls(' + since + ')', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            callback(false, JSON.parse(res.result.value));

        }.bind(this));

    };

    TracedDocument.prototype.getProbeValues = function(callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.getProbeValues()', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            this.insertProbes(false, JSON.parse(res.result.value), this.tracerId);

            callback(false, JSON.parse(res.result.value), this.tracerId);

        }.bind(this));

    };

    TracedDocument.prototype.insertProbes = function(err, probes) {
        probes.forEach(function(probeId, index) {

            var location = probeId.split(',').map(function(val, index) {
                return parseInt(val, 10);
            });

            Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '._probeValues["' + probeId + '"]', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
                var result = WebInspector.RemoteObject.fromPayload(res.result);
                // console.log(result);

                // var message = new WebInspector.ConsoleCommandResult(result, !!res.wasThrown, '', WebInspector.Linkifier, undefined, undefined, undefined);
                // this.$el.html(message.toMessageElement());

                if (this._probesCache[probeId] === result._type) {
                    return;
                } else {
                    this._probesCache[probeId] = result._type;
                }

                if (this.markers[probeId]) {
                    this.markers[probeId].clear();
                }

                this.markers[probeId] = this.hostEditor._codeMirror.markText(
                    {line: location[0] - 1, ch: location[1]},
                    {line: location[2] - 1, ch: location[3]},
                    {
                        className: 'recognizer-probe is-' + result._type + ' is-probe' + probeId
                    }
                );

            }.bind(this));

        }.bind(this));
        // $('body').delegate('.recognizer-probe-widget', 'mouseover', function(e) {
        //     console.log(e);
        // });
    };

    exports.TracedDocument = TracedDocument;

});
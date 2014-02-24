/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        EditorManager = brackets.getModule('editor/EditorManager');

    function TracedDocument(filename, tracerId, code, instrumentableObjects) {
        this.filename = filename;
        this.tracerId = tracerId;
        this.code = code;
        this.instrumentableObjects = instrumentableObjects;
        this._state = 'disconnected';
        this.hostEditor = EditorManager.getCurrentFullEditor();

        // this.insertProbes();
    }

    TracedDocument.prototype.connect = function() {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.connect()', function (res) {
            if (!res.wasThrown) {
                this._objectId = res.result.objectId;
                this._state = 'connected';
                $(exports).trigger('connected');
                console.log('[recognizer] Connected to tracer in ' + this.filename);
            } else {
                console.log('[recognizer] Error connecting to tracer in ' + this.filename, res);
            }
        }.bind(this));

    };

    TracedDocument.prototype.isReady = function() {
        return this._state === 'connected';
    };

    TracedDocument.prototype.getLog = function(since, callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.getCalls(' + since + ')', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            callback(false, JSON.parse(res.result.value), this.tracerId);

        }.bind(this));

    };

    TracedDocument.prototype.getProbeValues = function(callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.getProbeValues()', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            callback(false, JSON.parse(res.result.value), this.tracerId);

        }.bind(this));

    };

    TracedDocument.prototype.insertProbes = function() {
        this.instrumentableObjects.forEach(function(obj, index) {
            var marker = this.hostEditor._codeMirror.markText(
                {line: obj.loc.start.line - 1, ch: obj.loc.start.column},
                {line: obj.loc.end.line - 1, ch: obj.loc.end.column},
                {
                    className: 'recognizer-probe ' + 'is-probe-' + index,
                }
            );
        }.bind(this));
        $('.recognizer-probe').on('mouseover', function(e) {
            console.log(e);
        });
    };

    exports.TracedDocument = TracedDocument;

});
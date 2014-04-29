/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        WebInspector = require('thirdparty/WebInspector'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils');

    function TracedDocument(file, tracerId, code, instrumentableObjects) {
        this.file = file;
        this.tracerId = tracerId;
        this.code = code;
        this.instrumentableObjects = instrumentableObjects;
        this._state = 'disconnected';
        this.markers = {};
        this._cache = {};
        DocumentManager.getDocumentForPath(file.fullPath).then(function(doc) {
            doc._ensureMasterEditor();
            this.hostEditor = doc._masterEditor;
            this.hostEditor._codeMirror.setOption('theme', 'default recognizer');
        }.bind(this));
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
        probes.forEach(function(probe, index) {
            // probe = {id, type}

            var location = probe.id.split(',').map(function(val, index) {
                return parseInt(val, 10);
            });

            // Cache probe
            if (this._cache[probe.id] && this._cache[probe.id].type === probe.type) {
                return;
            } else {
                this._cache[probe.id] = probe;
            }

            // Clear previous marker
            if (this.markers[probe.id]) {
                this.markers[probe.id].clear();
            }

            // Create new marker
            this.markers[probe.id] = this.hostEditor._codeMirror.markText(
                {line: location[0] - 1, ch: location[1]},
                {line: location[2] - 1, ch: location[3]},
                {
                    className: 'recognizer-probe is-' + probe.type + ' is-probe-' + location.join('-')
                }
            );

        }.bind(this));
        // $('body').delegate('.recognizer-probe-widget', 'mouseover', function(e) {
        //     console.log(e);
        // });
    };

    exports.TracedDocument = TracedDocument;

});
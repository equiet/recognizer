/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector');

    function TracedDocument(filename, tracerId, code) {
        this.filename = filename;
        this.tracerId = tracerId;
        this.code = code;
        this._state = 'disconnected';
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
            }

            callback(false, JSON.parse(res.result.value));

        });

    };

    exports.TracedDocument = TracedDocument;

});
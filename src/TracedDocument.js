/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector');

    function TracedDocument(filename, tracerId, code) {
        this.filename = filename;
        this.tracerId = tracerId;
        this.code = code;
    }

    TracedDocument.prototype.connect = function() {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.connect()', function (res) {
            if (!res.wasThrown) {
                this._objectId = res.result.objectId;
                console.log('[recognizer] Connected to tracer in ' + this.filename);
            } else {
                console.log('[recognizer] Error connecting to tracer in ' + this.filename, res);
            }
        }.bind(this));

    };

    exports.TracedDocument = TracedDocument;

});
/**
 * This code has been instrumented using Recognizer
 * https://github.com/equiet/recognizer
 */

var __recognizer{{tracerId}} = (function () {
    'use strict';

    function Tracer() {
        this._calls = [];
        this._args = [];

        this._probeCalls = [];
    }
    Tracer.prototype = {
        logEntry: function (location, args) {
            this._calls.push({
                index: this._calls.length,
                position: location,
                // args: Array.prototype.slice.call(args),
                argsCount: args.length,
                time: Date.now()
            });
            this._args.push(Array.prototype.slice.call(args));
        },
        getCalls: function (since) {
            var calls = this._calls.filter(function(call) {
                return (since) ? call.time > since : true;
            });
            return stringify(calls);
        },
        getCallCount: function () {
            return this._calls.length;
        },
        logProbe: function (location, result) {
            this._probeCalls.push({
                index: this._calls.length,
                position: location,
                result: result,
                time: Date.now()
            });
        },
        test: function () {
            if (console) {
                console.log('[recognizer tracer] test function run successfully');
            }
        },
        connect: function () {
            return this;
        }
    };

    /**
     * JSON stringify with circular references
     * Copyright (c) Isaac Z. Schlueter ("Author")
     * The BSD License
     */
    function getSerialize(a,b){var c=[],d=[];return b=b||function(a,b){return"[Circular "+getPath(b,c,d)+"]"},function(e,f){var g=f;return"object"==typeof f&&f&&(-1!==c.indexOf(f)?g=b(e,f):(c.push(f),d.push(e))),a&&(g=a(e,g)),g}}
    function getPath(a,b,c){var d=b.indexOf(a),e=[c[d]];for(d--;d>=0;d--)b[d][e[0]]===a&&(a=b[d],e.unshift(c[d]));return"~"+e.join(".")}
    function stringify(a,b,c,d){return JSON.stringify(a,getSerialize(b,d),c)}stringify.getSerialize=getSerialize;

    return new Tracer();

}());


/**
 * Instrumented code
 */


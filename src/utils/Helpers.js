/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    exports.padNumber = function (number, size) {
        return ('0000' + number).slice(-size);
    };

});
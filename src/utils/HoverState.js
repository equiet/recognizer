/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    function HoverState(fields) {
        this.items = {};
        this.fields = fields;
    }

    HoverState.prototype.ensureFields = function(item) {
        if (!this.items[item]) {
            this.items[item] = {};
            this.fields.forEach(function(field) {
                this.items[item][field] = false;
            }.bind(this));
        }
    };

    HoverState.prototype.set = function(id, field, value) {
        this.ensureFields(id);
        this.items[id][field] = value;
    };

    HoverState.prototype.isHovered = function(id) {
        this.ensureFields(id);
        return this.fields.some(function(field) {
            return this.items[id][field];
        }.bind(this));
    };

    exports.HoverState = HoverState;

});
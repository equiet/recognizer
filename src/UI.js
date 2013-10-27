define(function (require, exports, module) {
    'use strict';

    exports.statusIndicator = (function() {

        var $indicators = $('#status-indicators'),
            $indicator = $('<div id="status-indicator-recognizer" />');

        // Append into Status indicators panel, before spinner
        $indicators.append($indicator);
        $indicators.find('.spinner').remove().appendTo($indicators);

        var statusActions = {};

        // Error
        statusActions[-1] = function() {
            $indicator.attr('class', 'is-error');
            $indicator.html('Error');
        };

        // Incative
        statusActions[0] = function() {
            $indicator.attr('class', 'is-inactive');
            $indicator.html('Inactive');

        };

        // Connecting to the remote debugger
        statusActions[1] = function() {
            $indicator.attr('class', 'is-connecting');
            $indicator.html('Connecting');

        };

        // Loading agents
        statusActions[2] = function() {
            $indicator.attr('class', 'is-loading-agents');
            $indicator.html('Loading agents');

        };

        // Active
        statusActions[3] = function() {
            $indicator.attr('class', 'is-active');
            $indicator.html('Active');
        };

        // Out of sync
        statusActions[4] = function() {
            $indicator.attr('class', 'is-out-of-sync');
            $indicator.html('Out of sync');
        };

        return {
            updateIndicator: function(code) {
                statusActions[code]();
            }
        };

    }());

});
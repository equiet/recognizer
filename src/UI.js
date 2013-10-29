define(function (require, exports, module) {
    'use strict'

    exports.statusIndicator = (function() {

        var $indicators = $('#status-indicators'),
            $indicator = $('<div id="status-indicator-recognizer" />')

        // Append into Status indicators panel, before spinner
        $indicators.append($indicator)
        $indicators.find('.spinner').remove().appendTo($indicators)

        var statusActions = {}

        // Error
        statusActions[-1] = function() {
            $indicator.attr('class', 'is-error')
            $indicator.html('Error')
        };

        // Incative
        statusActions[0] = function() {
            $indicator.attr('class', 'is-inactive')
            $indicator.html('Inactive')

        };

        // Connecting to the remote debugger
        statusActions[1] = function() {
            $indicator.attr('class', 'is-connecting')
            $indicator.html('Connecting')

        };

        // Loading agents
        statusActions[2] = function() {
            $indicator.attr('class', 'is-loading-agents')
            $indicator.html('Loading agents')

        };

        // Active
        statusActions[3] = function() {
            $indicator.attr('class', 'is-active')
            $indicator.html('Active')
        };

        // Out of sync
        statusActions[4] = function() {
            $indicator.attr('class', 'is-out-of-sync')
            $indicator.html('Out of sync')
        };

        // // Inspector connected
        // statusActions['inspector-connected'] = function() {
        //     $indicator.attr('class', 'is-active')
        //     $indicator.html('Inspector connected')
        // };

        // // Inspector disconnected
        // statusActions['inspector-disconnected'] = function() {
        //     $indicator.attr('class', 'is-inactive')
        //     $indicator.html('Inspector disconnected')
        // };

        return {
            updateStatus: function(code) {
                statusActions[code]()
            }
        };

    }())

    exports.panel = function() {

        var Resizer = brackets.getModule('utils/Resizer')

        var $panel = $('<div id="recognizer-panel" />'),
            $mainToolbar = $('#main-toolbar'),
            $content = $('.main-view .content')

        $panel.html(require('text!src/panel.html'));
        $mainToolbar.parent().append($panel)

        Resizer.makeResizable($panel, Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_LEFT, 100, false, false)

        $panel.on('panelResizeUpdate', function() {
            $content.css('right', $panel.width() + $mainToolbar.width())
        })
        $panel.trigger('panelResizeUpdate');

    }

})
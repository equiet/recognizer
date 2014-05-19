define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        KeyEvent = brackets.getModule('utils/KeyEvent'),
        Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        InlineWidget = require('src/InlineWidget').InlineWidget,
        padNumber = require('src/utils/Helpers').padNumber;

    var WebInspector = require('thirdparty/WebInspector');

    function LogWidget(filepath, position) {
        var self = this;

        this.hostEditor = DocumentManager.getOpenDocumentForPath(filepath)._masterEditor;
        this.widget = null;
        this.position = position;

        this.build();
    }

    LogWidget.prototype.build = function () {
        this.htmlContent = window.document.createElement('div');
        this.$htmlContent = $(this.htmlContent).addClass('inline-widget recognizer-widget');

        this.$scrollContainer = this.addScrollContainer(this.$htmlContent);
        this.$table = this.addTable(this.$scrollContainer);
        this.$group = this.addGroup(this.$table);

        this.$lastGroup = this.$group;

        // Register scroll event
        this.$scrollContainer.on('scroll', function (e) {
            if ($(this).scrollTop() > 0) {
                this.$scrollContainer.parent().addClass('has-scroll-up');
            } else {
                this.$scrollContainer.parent().removeClass('has-scroll-up');
            }
            if ($(this).height() + $(this).scrollTop() < this.$table.height()) {
                this.$scrollContainer.parent().addClass('has-scroll-down');
            } else {
                this.$scrollContainer.parent().removeClass('has-scroll-down');
            }
        });
    };

    LogWidget.prototype.addRow = function (timestamp, argsCount, index, tracerId) {
        var d = new Date(timestamp),
            baseTime = padNumber(d.getHours(), 2) + ':' +
                       padNumber(d.getMinutes(), 2) + ':' +
                       padNumber(d.getSeconds(), 2),
            milliseconds = padNumber(d.getMilliseconds(), 3),
            $group = this.$lastGroup;

        var $row = $('<tr />')
            .append('<th class="rw_time-base">' + baseTime + '</th>')
            .append('<th class="rw_time-milli">.' + milliseconds + '</th>')
            // .append('<th class="rw_warnings"><i class="fa fa-exclamation-triangle"></i></th>');
            .append('<th class="rw_warnings"></th>');

        for (var i = 0; i < argsCount; i++) {
            // TODO this is async, make sure it is executed in order
            Inspector.Runtime.evaluate('__recognizer' + tracerId + '._args[' + index + '][' + i + ']', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
                var result = WebInspector.RemoteObject.fromPayload(res.result);
                var message = new WebInspector.ConsoleCommandResult(result, !!res.wasThrown, '', WebInspector.Linkifier, undefined, undefined, undefined);
                $row.append($('<td>').append(message.toMessageElement()));
            });
        }

        if (argsCount === 0) {
            $('<span>').addClass('rw_no-arguments')
                       .html('no arguments')
                       .appendTo($('<td>').appendTo($row));
        }

        $row.appendTo($group);

        // this.$table.find('tr:not(:nth-last-child(-n+5))').remove();

        if (this.widget) {
            this.widget.setHeight(this.$table.height());
        }

        return $row;
    };

    LogWidget.prototype.toggle = function(show) {
        if (show) {
            this.widget = new InlineWidget(this.hostEditor, this.position[2], this.htmlContent, this.$htmlContent);
            this.hostEditor.addInlineWidget(
                {line: this.position[2] - 1, ch: 0},
                this.widget
            );
            this.widget.setHeight(this.$table.height());
        } else {
            this.widget.close();
            this.hostEditor.removeInlineWidget(this.widget);
        }
    };

    LogWidget.prototype.remove = function() {
        if (this.widget) {
            this.widget.close();
        }
    };

    LogWidget.prototype.addScrollContainer = function ($body) {
        var $container = $('<div />').addClass('rw_scroll-container').appendTo($body);
        return $('<div />').addClass('rw_scroll-content').appendTo($container);
    };

    LogWidget.prototype.addTable = function ($container) {
        return $('<table />').addClass('rw_table').appendTo($container);
    };

    LogWidget.prototype.addGroup = function ($table) {
        var $group = $('<tbody />').addClass('rw_group').appendTo($table);
        this.$lastGroup = $group;
        return $group;
    };


    exports.LogWidget = LogWidget;

});
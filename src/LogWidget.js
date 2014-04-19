define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        KeyEvent = brackets.getModule('utils/KeyEvent'),
        Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        DocumentManager = brackets.getModule('document/DocumentManager');

    var WebInspector = require('thirdparty/WebInspector');

    function LogWidget(filepath, position) {
        var self = this;

        this.hostEditor = DocumentManager.getOpenDocumentForPath(filepath)._masterEditor;
        this.widget = null;
        this.position = position;

        this.htmlContent = window.document.createElement("div");
        this.$htmlContent = $(this.htmlContent).addClass("inline-widget recognizer-widget");

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

    }

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

        this.$table.find('tr:not(:nth-last-child(-n+5))').remove();

        // if (this.$table.find('tr').length > 5) {
        //     this.$table.addClass('has-many-rows');
        // }
        //

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


    /**
     * Inline widget
     */

    function InlineWidget(hostEditor, line, htmlContent, $htmlContent) {
        var self = this;

        this.hostEditor = hostEditor;
        this.info = {line: line};

        this.htmlContent = htmlContent;
        this.$htmlContent = $htmlContent;

        // create the close button
        // TODO make close button
        this.$closeBtn = this.$htmlContent.find('.close');
        this.$closeBtn.click(function (e) {
            self.close();
            e.stopImmediatePropagation();
        });

        // Close with Esc
        // TODO sync with CounterWidget
        this.$htmlContent.on('keydown', function (e) {
            if (e.keyCode === KeyEvent.DOM_VK_ESCAPE) {
                self.remove();
                e.stopImmediatePropagation();
            }
        });
    }



    InlineWidget.prototype.htmlContent = null;
    InlineWidget.prototype.$htmlContent = null;
    InlineWidget.prototype.id = null;
    InlineWidget.prototype.hostEditor = null;

    /**
     * Initial height of inline widget in pixels. Can be changed later via hostEditor.setInlineWidgetHeight()
     * @type {number}
     */
    InlineWidget.prototype.height = 20;

    /**
     * Closes this inline widget and all its contained Editors
     * @return {$.Promise} A promise that's resolved when the widget is fully closed.
     */
    InlineWidget.prototype.close = function () {
        return EditorManager.closeInlineWidget(this.hostEditor, this);
        // closeInlineWidget() causes our onClosed() handler to be called
    };

    /** @return {boolean} True if any part of the inline widget is focused */
    InlineWidget.prototype.hasFocus = function () {
        var focusedItem = window.document.activeElement,
            htmlContent = this.$htmlContent[0];
        return $.contains(htmlContent, focusedItem) || htmlContent === focusedItem;
    };

    /**
     * Called any time inline is closed, whether manually or automatically.
     */
    InlineWidget.prototype.onClosed = function () {
        // Does nothing in base implementation.
    };

    /**
     * Called once content is parented in the host editor's DOM. Useful for performing tasks like setting
     * focus or measuring content, which require htmlContent to be in the DOM tree.
     * IMPORTANT: onAdded() must ensure that hostEditor.setInlineWidgetHeight() is called at least once in order
     * to set the initial height of the widget and animate it open.
     */
    InlineWidget.prototype.onAdded = function () {
        $(this).triggerHandler("add");
        this.hostEditor.setInlineWidgetHeight(this, this.$htmlContent.height());
    };

    InlineWidget.prototype.setHeight = function (height) {
        this.hostEditor.setInlineWidgetHeight(this, height);
    };

    /**
     * Called when the editor containing the inline is made visible.
     */
    InlineWidget.prototype.onParentShown = function () {
        // do nothing - base implementation
    };

    /**
     * Called when the parent editor does a full refresh--for example, when the font size changes.
     */
    InlineWidget.prototype.refresh = function () {
        // do nothing - base implementation
    };


    /**
     * Helpers
     */

    function padNumber(number, size) {
        return ('0000' + number).slice(-size);
    }


    exports.LogWidget = LogWidget;

});
define(function (require, exports, module) {
    'use strict';

    var EditorManager = brackets.getModule('editor/EditorManager'),
        KeyEvent = brackets.getModule("utils/KeyEvent");

    function LogWidget(position) {
        this.hostEditor = EditorManager.getCurrentFullEditor();
        this.widget = new InlineWidget(this.hostEditor, position[2]);
        this.position = position;
    }

    LogWidget.prototype.addRow = function (timestamp, args) {
        var d = new Date(timestamp),
            baseTime = padNumber(d.getHours(), 2) + ':' +
                       padNumber(d.getMinutes(), 2) + ':' +
                       padNumber(d.getSeconds(), 2),
            miliseconds = padNumber(d.getMilliseconds(), 3);
        this.widget.addRow(this.widget.$lastGroup, baseTime, miliseconds, args);
    };

    LogWidget.prototype.toggle = function(show) {
        if (show) {
            this.hostEditor.addInlineWidget(
                {line: this.position[2] - 1, ch: 0},
                this.widget
            );
        } else {
            this.widget.close();
        }
    };


    /**
     * Helpers
     */

    function padNumber(number, size) {
        return ('0000' + number).slice(-size);
    }


    /**
     * Inline widget
     */

    function InlineWidget(hostEditor, line) {
        var self = this;

        this.hostEditor = hostEditor;
        this.info = {line: line};

        // create the outer wrapper div
        // this.htmlContent = window.document.createElement("div");
        // this.$htmlContent = $(this.htmlContent).addClass("inline-widget").attr("tabindex", "-1");
        // this.$htmlContent.append("<div class='shadow top' />")
        //     .append("<div class='shadow bottom' />")
        //     .append("<a href='#' class='close no-focus'>&times;</a>");

        // // create the close button
        // this.$closeBtn = this.$htmlContent.find(".close");
        // this.$closeBtn.click(function (e) {
        //     self.close();
        //     e.stopImmediatePropagation();
        // });

        // this.$htmlContent.on("keydown", function (e) {
        //     if (e.keyCode === KeyEvent.DOM_VK_ESCAPE) {
        //         self.close();
        //         e.stopImmediatePropagation();
        //     }
        // });


        this.htmlContent = window.document.createElement("div");
        this.$htmlContent = $(this.htmlContent).addClass("inline-widget recognizer-widget");

        var $scrollContainer = this.addScrollContainer(this.$htmlContent);
        var $table = this.addTable($scrollContainer);
        var $group = this.addGroup($table);

        this.$lastGroup = $group;

        // Register scroll event
        $scrollContainer.on('scroll', function () {
            if ($(this).scrollTop() > 0) {
                $scrollContainer.parent().addClass('has-scroll-up');
            } else {
                $scrollContainer.parent().removeClass('has-scroll-up');
            }
            if ($(this).height() + $(this).scrollTop() < $table.height()) {
                $scrollContainer.parent().addClass('has-scroll-down');
            } else {
                $scrollContainer.parent().removeClass('has-scroll-down');
            }
        });


        // Populate with some data
        var args = [];
        args.push(null);
        args.push("request");
        args.push({object: 'object'});
        args.push([1,2,3]);
        // for (var i = 0; i < 4; i++) {
        //     var d = new Date();
        //     this.addRow($group, d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(), d.getMilliseconds(), args);
        // }

        // $group.clone().appendTo($table);

        // this.$htmlContent.html(require('text!src/log.html'));

    }

    InlineWidget.prototype.addScrollContainer = function ($body) {
        var $container = $('<div />').addClass('rw_scroll-container').appendTo($body);
        return $('<div />').addClass('rw_scroll-content').appendTo($container);
    };

    InlineWidget.prototype.addTable = function ($container) {
        return $('<table />').addClass('rw_table').appendTo($container);
    };

    InlineWidget.prototype.addGroup = function ($table) {
        var $group = $('<tbody />').addClass('rw_group').appendTo($table);
        this.$lastGroup = $group;
        return $group;
    };

    InlineWidget.prototype.addRow = function ($group, baseTime, milliseconds, args) {
        // args = Array.prototype.slice.call(args);
        // console.log(args);
        var $row = $('<tr />');
        $row.append('<th class="rw_time-base">' + baseTime + '</th>');
        $row.append('<th class="rw_time-milli">.' + milliseconds + '</th>');
        $row.append('<th class="rw_warnings"><i class="fa fa-exclamation-triangle"></i></th>');
        args.forEach(function(arg) {
            $row.append('<td>' + arg + '</td>');
        });
        return $row.appendTo(this.$lastGroup);
    };

    InlineWidget.prototype.htmlContent = null;
    InlineWidget.prototype.$htmlContent = null;
    InlineWidget.prototype.id = null;
    InlineWidget.prototype.hostEditor = null;

    /**
     * Initial height of inline widget in pixels. Can be changed later via hostEditor.setInlineWidgetHeight()
     * @type {number}
     */
    InlineWidget.prototype.height = 140;

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
        this.hostEditor.setInlineWidgetHeight(this, this.height);
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


    exports.LogWidget = LogWidget;

});
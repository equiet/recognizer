/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, CodeMirror, window */

define(function (require, exports, module) {
    "use strict";

    console.log('in required');

    // Load dependent modules
    var EditorManager       = brackets.getModule("editor/EditorManager"),
        KeyEvent            = brackets.getModule("utils/KeyEvent");

    /**
     * @constructor
     *
     */
    function InlineWidget() {
        var self = this;

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
        this.$htmlContent = $(this.htmlContent).addClass("inline-widget");

        this.$htmlContent.html(require('text!src/log.html'));

    }
    InlineWidget.prototype.htmlContent = null;
    InlineWidget.prototype.$htmlContent = null;
    InlineWidget.prototype.id = null;
    InlineWidget.prototype.hostEditor = null;

    /**
     * Initial height of inline widget in pixels. Can be changed later via hostEditor.setInlineWidgetHeight()
     * @type {number}
     */
    // InlineWidget.prototype.height = 200;

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
        console.log('add');
        this.hostEditor.setInlineWidgetHeight(this, 200, true);
    };

    /**
     * @param {Editor} hostEditor
     */
    InlineWidget.prototype.load = function (hostEditor) {
        this.hostEditor = hostEditor;
        console.log('load');
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

    exports.InlineWidget = InlineWidget;

});
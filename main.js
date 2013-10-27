define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule("LiveDevelopment/Inspector/Inspector");

    var UI = require('src/UI');


    ExtensionUtils.loadStyleSheet(module, 'main.less')
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css')


    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });

});
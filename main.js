/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ProjectManager  = brackets.getModule('project/ProjectManager'),
        LiveDevServerManager = brackets.getModule('LiveDevelopment/LiveDevServerManager'),
        UI = require('src/UI'),
        TracerManager = require('src/TracerManager'),
        WebInspector = require('thirdparty/WebInspector'),
        ProxyProvider = require('src/ProxyProvider');


    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');
    ExtensionUtils.loadStyleSheet(module, 'thirdparty/styles/inspector.css');


    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });


    // Insert tracer into browser
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 0) {
            TracerManager.disconnectAll();
        }
        if (status === 1) {
            // Make sure that a project is opened
            if (ProjectManager.getProjectRoot() === null) {
                console.warn('Recognizer needs to be run in a project.');
                return;
            }
            // Trace each file in the project
            DocumentManager.getWorkingSet().forEach(function(file) {
                TracerManager.registerFile(file);
            });
        }
        if (status === 3) {
            window.RuntimeAgent = Inspector.Runtime;

            // Refresh tracers
            TracerManager.disconnectAll();
            TracerManager.connectAll();
        }
    });


    AppInit.appReady(function() {
        // Create proxy server when Brackets fully loads
        ProxyProvider.init();

        // UI.panel()
    });


    // function testInspector() {
    //     Inspector.Runtime.evaluate('window', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
    //         // res = {result, wasThrown}
    //         // console.log('RemoteObject', WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, 'window');
    //     });
    //     // Inspector.Runtime.evaluate('1+1', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
    //     //     _printResult(WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, '1+1');
    //     // });
    // }

});
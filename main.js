define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager')

    var UI = require('src/UI');


    ExtensionUtils.loadStyleSheet(module, 'main.less')
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css')


    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });

    Inspector.on('Debugger.scriptParsed', function(res) {
        console.log('scriptParsed:', res)
    })

    var scriptId = null;

    // Execute some code
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 3 ) {

            Inspector.Debugger.compileScript('console.log("this comes from the three");', 'somesourceurl', function(res) {
                console.log('compileScript', res)

                scriptId = res.scriptId
                console.log(scriptId);

                Inspector.Debugger.runScript(res.scriptId, function(res) {
                    console.log('runScript', res)
                })
            })


            Inspector.getDebuggableWindows().then(function (response) {
                console.log('windows:', response)
            })
        }
    })



    // var Agent              = require("./src/Agent");
    // var AgentManager       = require("./src/AgentManager");


    function _init() {

        var currentDocument = DocumentManager.getCurrentDocument()
        $(currentDocument).on('change', function(e, doc, changeList) {
            console.log('change', arguments)
            if (!scriptId) return;
            console.log('about to change script source', scriptId, doc.getText())
            Inspector.Debugger.setScriptSource(scriptId, doc.getText(), false, function(res) {
                console.log('call frames:', res.callFrames, 'result:', res.result)
            })
        })

        $(DocumentManager).on('currentDocumentChange', function() {
            console.log('currentDocumentChange', arguments)
        })

        // ProxyProvider.init();
        // Agent.init();
        // AgentManager.init();
        // EditorInterface.init();
        // UI.init();
        // Panel.init();
        // EpochPanel.init();
        // FileCallGraphPanel.init();
        //
    }


    AppInit.appReady(_init);


});
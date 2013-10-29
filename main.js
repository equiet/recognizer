define(function (require, exports, module) {
    'use strict';

    // return;

    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager')
        // ScriptAgent     = brackets.getModule('LiveDevelopment/Agents/ScriptAgent')

    var UI = require('src/UI');


    ExtensionUtils.loadStyleSheet(module, 'main.less')
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css')



    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });


    $(Inspector.Debugger).on("scriptParsed", function(res) {
        console.log('scriptParsed', res)
    })

    Inspector.on('connect', function() {
        console.log('inspector connected')
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


                // var currentDocument = DocumentManager.getCurrentDocument()
                // console.log(ScriptAgent)
                // var idfromurl = ScriptAgent.scriptForURL(currentDocument.file.fullPath)

                // console.log(ScriptAgent.scriptForURL(idfromurl))
            })


            // Inspector.getDebuggableWindows().then(function (response) {
            //     console.log('windows:', response)
            // })
        }
    })



    // var Agent              = require("./src/Agent");
    // var AgentManager       = require("./src/AgentManager");


    function _init() {

        // LiveDevelopment.enableAgent('script')

        console.log('initalized')

        // var currentDocument = DocumentManager.getCurrentDocument()
        // console.log(currentDocument)
        // // var idfromurl = ScriptAgent.scriptForUrl(currentDocument.file.fullPath)
        // // console.log(idfromurl)
        // $(currentDocument).on('change', function(e, doc, changeList) {
        //     console.log('change', arguments)
        //     // if (!scriptId) return;
        //     //console.log('about to change script source', scriptId, doc.getText())
        //     // Inspector.Debugger.setScriptSource(idfromurl, doc.getText(), false, function(res) {
        //     //     console.log('call frames:', res.callFrames, 'result:', res.result)
        //     // })
        // })

        $(DocumentManager).on('currentDocumentChange', function() {
            console.log('currentDocumentChange', arguments)
        })

        Inspector.Debugger.enable()

        console.log(Inspector.Debugger)

        Inspector.on('Debugger.scriptParsed', function(res) {
            console.log('scriptParsed:', res)
        })
        $(Inspector.Debugger).on("scriptParsed.ScriptAgent", function() {
            console.log('aaaaaa')
        })

            // console.log(ScriptAgent.scriptForUrl())

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


    // AppInit.appReady(_init);


});
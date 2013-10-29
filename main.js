define(function (require, exports, module) {
    'use strict';


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



    var _tracerObjectId;

    // Insert tracer into browser
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 3 ) {

            Inspector.Runtime.evaluate('__recognizer.connect()', function (res) {

                if (!res.wasThrown) {
                    _tracerObjectId = res.result.objectId;
                    console.log('[recognizer] tracer retrieved', _tracerObjectId, res.result);

                    Inspector.Runtime.callFunctionOn(_tracerObjectId, '__recognizer.test', function (res) {
                        console.log('[recognizer] test function called, expect confirmation', res);
                    });

                    setInterval(function () {

                        Inspector.Runtime.callFunctionOn(_tracerObjectId, '__recognizer.getCallCount', function (res) {
                            console.log('[recognizer] function called', res);
                        });

                    }, 1000);


                } else {
                    console.log('[recognizer] failed to retrieve tracer', res);
                }

            });

        }
    });



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
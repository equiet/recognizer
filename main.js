define(function (require, exports, module) {
    'use strict';


    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        DebugInlineWidget    = require('src/DebugInlineWidget').InlineWidget;
        // DebugInlineWidget2    = require('src/DebugInlineWidget').InlineWidget;
        // InlineColorEditor   = require("InlineColorEditor").InlineColorEditor;

        // ScriptAgent     = brackets.getModule('LiveDevelopment/Agents/ScriptAgent')

    var UI = require('src/UI');



    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');








    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });


    $(Inspector.Debugger).on("scriptParsed", function(res) {
        console.log('scriptParsed', res)
    })



    var _tracerObjectId;
    var _theseusObjectId;


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
                            // console.log('[recognizer] function called', res);
                            console.log('[recognizer]', 'calls:', res)
                        });

                    }, 3000);


                } else {
                    console.log('[recognizer] failed to retrieve tracer', res);
                }

            });

            // Inspector.Runtime.evaluate("__tracer.connect()", function (res) {
            //     if (!res.wasThrown) {
            //         _theseusObjectId = res.result.objectId;

            //         setInterval(function () {
            //             Inspector.Runtime.callFunctionOn(_theseusObjectId, "__tracer.trackNodes", [], true, true, function (res) {
            //                 console.log('[recognizer] theseus trackNodes called', res);
            //             });
            //         }, 3000);

            //     } else {
            //         console.log("failed to get tracer instance", res);
            //     }
            // });


        }
    });



    // var Agent              = require("./src/Agent");
    // var AgentManager       = require("./src/AgentManager");


    function _init() {

        // LiveDevelopment.enableAgent('script')

        console.log('initalized')


        console.log(EditorManager.getCurrentFullEditor());
        console.log(EditorManager.getInlineEditors());
        console.log(EditorManager.getInlineEditors());


        EditorManager.registerInlineEditProvider(function (hostEditor, pos) {
            inlineColorEditor = new DebugInlineWidget();
            inlineColorEditor.load(hostEditor);

            result = new $.Deferred();
            result.resolve(inlineColorEditor);
            return result.promise();
        });



        var debugInlineWidget = new DebugInlineWidget();
        debugInlineWidget.load(EditorManager.getCurrentFullEditor());
        EditorManager.getCurrentFullEditor().addInlineWidget({line: 269}, debugInlineWidget, true).done(function () {
            console.log('widget added');
        });

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
        // EditorManager.registerInlineEditProvider(function() { console.log('abc2'); });

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


    AppInit.appReady(_init);


});
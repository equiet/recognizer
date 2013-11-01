define(function (require, exports, module) {
    'use strict';


    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        DebugInlineWidget    = require('src/DebugInlineWidget').InlineWidget,
        Agent = require('src/Agent');
        // InlineColorEditor   = require("InlineColorEditor").InlineColorEditor;

    var UI = require('src/UI');



    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');






    var inlineWidgets = {};



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

                        Inspector.Runtime.callFunctionOn(_tracerObjectId, '__recognizer.getCalls', function (res) {
                            // console.log('[recognizer] function called', res);
                            // console.log('[recognizer]', 'calls:', res)
                            var args = JSON.parse(res.result.value);
                            // console.log(args);
                            args.forEach(function (val, index) {
                                // console.log(val);
                                var d = new Date();

                                if (!inlineWidgets[val.line]) {
                                    inlineWidgets[val.line] = new DebugInlineWidget();
                                    inlineWidgets[val.line].load(EditorManager.getCurrentFullEditor());
                                    EditorManager.getCurrentFullEditor().addInlineWidget({line: val.line}, inlineWidgets[val.line], true).done(function () {
                                        inlineWidgets[val.line].addRow(inlineWidgets[val.line].$lastGroup, d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(), d.getMilliseconds(), val.args);
                                    });
                                } else {
                                    inlineWidgets[val.line].addRow(inlineWidgets[val.line].$lastGroup, d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds(), d.getMilliseconds(), val.args);
                                }



                            });
                        });

                    }, 100);


                } else {
                    console.log('[recognizer] failed to retrieve tracer', res);
                }

            });

            Inspector.Runtime.evaluate("__tracer.connect()", function (res) {
                if (!res.wasThrown) {
                    _theseusObjectId = res.result.objectId;

                    Inspector.Runtime.callFunctionOn(_theseusObjectId, "__tracer.trackNodes", [], true, true, function (res) {

                        var id = setInterval(function () {
                            Inspector.Runtime.callFunctionOn(_theseusObjectId, "__tracer.newNodes", [/*handle*/], function (res) {
                                console.log(res);
                                // if (nodes) {
                                //     _addNodes(nodes);
                                // }
                            });
                        }, 1000);

                    });

                } else {
                    console.log("failed to get tracer instance", res);
                }
            });


        }
    });



    // var Agent              = require("./src/Agent");
    // var AgentManager       = require("./src/AgentManager");

    var debugInlineWidget;


    function _init() {

        // LiveDevelopment.enableAgent('script')

        Agent.init();

        UI.panel()

        console.log('initalized')


        // EditorManager.registerInlineEditProvider(function (hostEditor, pos) {
        //     inlineColorEditor = new DebugInlineWidget();
        //     inlineColorEditor.load(hostEditor);

        //     result = new $.Deferred();
        //     result.resolve(inlineColorEditor);
        //     return result.promise();
        // });



        // debugInlineWidget = new DebugInlineWidget();
        // debugInlineWidget.load(EditorManager.getCurrentFullEditor());
        // EditorManager.getCurrentFullEditor().addInlineWidget({line: 31}, debugInlineWidget, true).done(function () {
        //     console.log('widget added');
        // });

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
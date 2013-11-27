/*globals define, console*/

define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        DebugInlineWidget    = require('src/DebugInlineWidget').InlineWidget,
        Agent = require('src/Agent'),
        AgentManager = require('src/AgentManager'),
        UI = require('src/UI'),
        CounterManager = require('src/CounterManager');

    var _logHandle;


    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');


    var hostEditor;


    var inlineWidgets = {};



    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });




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

                            var args = JSON.parse(res.result.value);
                            args.forEach(function (val, index) {

                                var d = new Date();

                                if (!inlineWidgets[val.line]) {

                                    inlineWidgets[val.line] = new DebugInlineWidget();

                                    inlineWidgets[val.line].load(EditorManager.getCurrentFullEditor());

                                    hostEditor.addInlineWidget({line: val.line, ch: 20}, inlineWidgets[val.line], true).done(function () {
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

            // Inspector.Runtime.evaluate("__tracer.connect()", function (res) {
            //     if (!res.wasThrown) {
            //         _theseusObjectId = res.result.objectId;

            //         Inspector.Runtime.callFunctionOn(_theseusObjectId, "__tracer.trackNodes", [], true, true, function (res) {

            //             var id = setInterval(function () {
            //                 Inspector.Runtime.callFunctionOn(_theseusObjectId, "__tracer.newNodes", [/*handle*/], function (res) {
            //                     console.log(res);
            //                     // if (nodes) {
            //                     //     _addNodes(nodes);
            //                     // }
            //                 });
            //             }, 1000);

            //         });

            //     } else {
            //         console.log("failed to get tracer instance", res);
            //     }
            // });


        }
    });



    var debugInlineWidget;


    var _loggedNodes = [], _loggedEventNames = [], _loggingExceptions = false, _loggingConsoleLogs = false;


    function _init() {

        hostEditor = EditorManager.getCurrentFullEditor();

        // var $bookmark = $('<div />').css('background', '#11f').html('bookmark');
        // var testBookmark = hostEditor._codeMirror.addWidget({line: 8, ch: 14}, $bookmark.get(0));

        Agent.init();
        AgentManager.init();

        // UI.panel()


        setInterval(function () {
            if (Agent.isReady()) {
                // TODO: don't call again if still waiting on a response
                Agent.refreshHitCounts(function (hits, hitDeltas) {

                    console.log('hits:', hits);
                    console.log('hitDeltas:', hitDeltas);

                    for (var id in hits) {
                        if (hits.hasOwnProperty(id)) {
                            CounterManager.updateCounter(id, hits[id]);
                        }
                    }

                    // update the call counts in the sidebar
                    // for (var id in hitDeltas) {
                    //     var count = hits[id] || 0;
                    //     console.log('count', count);
                    //     // var html = " " + (count === 0 ? Strings.UI_NO_CALLS : (count === 1 ? Strings.UI_SINGLE_CALL : StringUtils.format(Strings.UI_MULTIPLE_CALLS, count)));
                    //     // _getNodeMarker(id).toggleClass("none", count === 0)
                    //     //                   .toggleClass("uninitialized", false)
                    //     //                   .find(".counts").html(html);
                    // }

                    // update call counts that were off-screen but now are back
                    // var uninitialized = $(".CodeMirror").find(".theseus-call-count.uninitialized");
                    // uninitialized.each(function () {
                    //     $(this).toggleClass("uninitialized", false);
                    //     var id = $(this).attr("data-node-id");
                    //     var count = hits[id] || 0;
                    //     var html = " " + (count === 0 ? Strings.UI_NO_CALLS : (count === 1 ? Strings.UI_SINGLE_CALL : StringUtils.format(Strings.UI_MULTIPLE_CALLS, count)));
                    //     _getNodeMarker(id).toggleClass("none", count === 0)
                    //                       .toggleClass("set", _loggedNodes.indexOf(id) !== -1)
                    //                       .toggleClass("uninitialized", false)
                    //                       .find(".counts").html(html);
                    // });

                });


                Agent.refreshExceptionCounts(function (counts, deltas) {

                    // console.log('counts:', counts);
                    // console.log('deltas:', deltas);

                    // // add the 'exception' class to all the pills that threw exceptions this cycle
                    // for (var id in deltas) {
                    //     _getNodeMarker(id).addClass("exception")
                    //                       .toggleClass("uninitialized-exceptions", false);
                    // }

                    // // update the pills that were reset because they scrolled off-screen
                    // var uninitialized = $(".CodeMirror").find(".theseus-call-count.uninitialized-exceptions");
                    // uninitialized.each(function () {
                    //     var id = $(this).attr("data-node-id");
                    //     if (id in counts) {
                    //         _getNodeMarker(id).addClass("exception")
                    //                           .toggleClass("uninitialized-exceptions", false);
                    //     }
                    // });
                    //
                });

                // if (_logHandle !== undefined) {
                //     Agent.refreshLogs(_logHandle, 20, function (results) {
                //         if (results && results.length > 0) {
                //             _variablesPanel.appendLogs(results);
                //         }
                //     });
                // }
            }
        }, 100);


        // setInterval(function() {
        //     if (Agent.isReady()) {

        //         Agent.trackLogs({
        //             ids: _loggedNodes,
        //             eventNames: _loggedEventNames,
        //             exceptions: _loggingExceptions,
        //             logs: _loggingConsoleLogs,
        //         }, function (handle) {
        //             _logHandle = handle;
        //             console.log('handle', handle);
        //             console.log(_loggedNodes);
        //             console.log(_loggedEventNames);
        //         });

        //     }
        // }, 1000);


    }


    AppInit.appReady(_init);


});
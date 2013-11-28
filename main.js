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
        AgentHandle = require('src/AgentHandle'),
        AgentManager = require('src/AgentManager'),
        UI = require('src/UI'),
        WidgetManager = require('src/WidgetManager');


    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');


    var hostEditor;


    var inlineWidgets = {};



    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });



    var _loggedNodes = [], _loggedEventNames = [], _loggingExceptions = false, _loggingConsoleLogs = false;
    var _logHandle;


    // Insert tracer into browser
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 3 ) {
        }
    });



    var debugInlineWidget;



    function _init() {

        hostEditor = EditorManager.getCurrentFullEditor();

        // var $bookmark = $('<div />').css('background', '#11f').html('bookmark');
        // var testBookmark = hostEditor._codeMirror.addWidget({line: 8, ch: 14}, $bookmark.get(0));

        Agent.init();
        AgentManager.init();

        // UI.panel()
        //




        setInterval(function () {
            if (Agent.isReady()) {



                Agent.refreshHitCounts(function (hits, hitDeltas) {

                    _loggedNodes = [];

                    for (var id in hits) {
                        if (hits.hasOwnProperty(id)) {
                            _loggedNodes.push(id);
                            if (WidgetManager.getWidget(id)) {
                                WidgetManager.getWidget(id).counter.updateCounter(hits[id]);
                            }
                        }
                    }

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


                if (_logHandle !== undefined) {
                    Agent.refreshLogs(_logHandle, 20, function (results) {
                        if (results && results.length > 0) {
                            results.forEach(function (result) {
                                if (WidgetManager.getWidget(result.nodeId)) {
                                    console.log(result.arguments);
                                    result.arguments = result.arguments.map(function (arg) {
                                        return arg.value.preview || arg.value.value;
                                    });
                                    WidgetManager.getWidget(result.nodeId).log.addRow(result.timestamp, result.arguments);
                                }
                            });
                        }
                    });
                }
            }
        }, 100);


        // TODO get all nodes at the beginning
        setInterval(function () {
            Agent.trackLogs({
                ids: _loggedNodes,
                eventNames: [],
                exceptions: false,
                logs: false,
            }, function (handle) {
                _logHandle = handle;
            });
        }, 2000);



    }


    AppInit.appReady(_init);


});
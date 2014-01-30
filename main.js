/*globals define, console*/

define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        ProjectManager  = brackets.getModule('project/ProjectManager'),
        FileSystem      = brackets.getModule('filesystem/FileSystem'),
        UI = require('src/UI'),
        WidgetManager = require('src/WidgetManager'),
        TracerManager = require('src/TracerManager');

    var WebInspector = require('thirdparty/WebInspector');

    function testInspector() {

        var _printResult = function(result, wasThrown, originatingCommand)
        {
            console.log('result', result);
            if (!result)
                return;

            /**
             * @param {string=} url
             * @param {number=} lineNumber
             * @param {number=} columnNumber
             * @this {WebInspector.ConsoleView}
             */
            function addMessage(url, lineNumber, columnNumber)
            {
                var message = new WebInspector.ConsoleCommandResult(result, wasThrown, originatingCommand, WebInspector.Linkifier, url, lineNumber, columnNumber);
                console.log('message', message);
                console.log('toMessageElement', message.toMessageElement());
                // WebInspector.console.addMessage(message);
            }

            addMessage.call(this);
        };


        console.log(WebInspector);
        // var command = WebInspector.ConsoleCommandResult(result, wasThrown, originatingCommand, linkifier, url, lineNumber, columnNumber);
        // var command = new WebInspector.ConsoleCommandResult({test: 'object'}, false, null, null, undefined, undefined, undefined);
        // console.log('aa', command);
        // console.log(command.toMessageElement());

        // WebInspector.ConsoleMessageImpl = function(source, level, message, linkifier, type, url, line, column, repeatCount, parameters, stackTrace, requestId, isOutdated)
        // {
        // ["javascript", "log", "", WebInspector.Linkifier, "result", undefined, undefined, undefined, undefined, Array[1]]
        // var command = new WebInspector.ConsoleMessageImpl('javascript', 'log', '', null, 'result', undefined, undefined, undefined, undefined, Array[1]);

        // 1 + 1 console true false false true
        // Inspector.Runtime.evaluate('1 + 1', 'console', false  useCommandLineAPI , false, false, true /* generate preview */, function (res) {
        Inspector.Runtime.evaluate('window', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
            // res = {result, wasThrown}

            console.log('evaluated', arguments);
            _printResult(WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, 'window');
        });
        Inspector.Runtime.evaluate('1+1', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
            _printResult(WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, '1+1');
        });

    }


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
            TracerManager.reset();
            TracerManager.connectAll();

            testInspector();
        }
    });




    function _init() {

        hostEditor = EditorManager.getCurrentFullEditor();

        // var $bookmark = $('<div />').css('background', '#11f').html('bookmark');
        // var testBookmark = hostEditor._codeMirror.addWidget({line: 8, ch: 14}, $bookmark.get(0));


        // UI.panel()

        DocumentManager.getWorkingSet().forEach(function(file) {
            TracerManager.registerFile(file);
        });

        $(DocumentManager).on('documentSaved', function(e, doc) {
            TracerManager.registerFile(doc.file);
        });

        $(DocumentManager).on('documentRefreshed', function(e, doc) {
            TracerManager.registerFile(doc.file);
        });

        $(DocumentManager).on('workingSetAdd', function(e, file) {
            TracerManager.registerFile(file);
        });

        $(DocumentManager).on('workingSetAddList', function(e, list) {
            list.forEach(function(file) {
                TracerManager.registerFile(file);
            });
        });

        $(DocumentManager).on('workingSetRemove', function(e, file) {
            TracerManager.unregisterFile(file);
        });

        $(DocumentManager).on('workingSetRemoveList', function(e, list) {
            list.forEach(function(file) {
                TracerManager.unregisterFile(file);
            });
        });

        $(DocumentManager).on('fileNameChanged', function(e, oldName, newName) {
            console.log(arguments);
            // TODO
            // TracerManager.unregisterFile(file);
        });

        TracerManager.listen();


    }


    AppInit.appReady(_init);


});
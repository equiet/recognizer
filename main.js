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
        Instrumenter = require('src/Instrumenter');


    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');

    var hostEditor;


    var inlineWidgets = {};


    var tracedDocuments = [];



    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });



    var _loggedNodes = [], _loggedEventNames = [], _loggingExceptions = false, _loggingConsoleLogs = false;
    var _logHandle;


    // Insert tracer into browser
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 3 ) {

            tracedDocuments.forEach(function(tracedDocument) {
                tracedDocument.connect();
            });

        }
    });




    function _init() {

        hostEditor = EditorManager.getCurrentFullEditor();

        // var $bookmark = $('<div />').css('background', '#11f').html('bookmark');
        // var testBookmark = hostEditor._codeMirror.addWidget({line: 8, ch: 14}, $bookmark.get(0));


        // UI.panel()


        var workingSet = DocumentManager.getWorkingSet();

        workingSet.filter(function(file) {

            // Find only files ending with .js which are not already instrumented
            return file.name.match(/\.js$/) && !file.name.match(/\.recognizer\.js$/);

        }).forEach(function(file) {

            // Create .recognizer.js file
            var newPath = file.fullPath.replace(/\.js$/, '.recognizer.js');
            var newFile = FileSystem.getFileForPath(newPath);

            file.read({}, function(err, data, stat) {

                var tracedDocument = Instrumenter.instrument(file.name, data);
                newFile.write(tracedDocument.code, {});

                tracedDocuments.push(tracedDocument);

            });

        });



        var timestamp;

        setInterval(function () {

            tracedDocuments.forEach(function(tracedDocument) {

                if (!tracedDocument.isReady()) {
                    return;
                }

                tracedDocument.getLog(timestamp, function(err, log) {
                    log.forEach(function(entry) {
                        WidgetManager.getWidget(entry.position).addEntry(entry);
                    });
                });

            });

            timestamp = Date.now();

        }, 100);



    }


    AppInit.appReady(_init);


});
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
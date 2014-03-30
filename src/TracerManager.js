define(function (require, exports, module) {
    'use strict';

    var FileSystem = brackets.getModule('filesystem/FileSystem'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        Instrumenter = require('src/Instrumenter'),
        WidgetManager = require('src/WidgetManager'),
        TracedDocument = require('src/TracedDocument').TracedDocument;

    var tracedDocuments = {},
        refreshInterval;

    function registerFile(file, callback) {

        callback = callback || function() {};

        // Instrument only files ending with .js which are not already instrumented
        if (!file.name.match(/\.js$/) || file.name.match(/\.recognizer\.js$/)) {
            callback('Only .js file can be instrumented.', file);
            return;
        }

        // Create .recognizer.js file
        var newPath = file.fullPath.replace(/\.js$/, '.recognizer.js');
        var newFile = FileSystem.getFileForPath(newPath);

        file.read({}, function(err, data, stat) {
            var tracerId = Math.floor(Math.random() * 1000 * 1000 * 1000),
                instrumentedCode = Instrumenter.instrument(data);

            var tracedDocument = new TracedDocument(
                file,
                tracerId,
                instrumentedCode.code.replace(/\{\{tracerId\}\}/g, tracerId),
                instrumentedCode.probes
            );

            newFile.write(tracedDocument.code, {});

            tracedDocuments[file.fullPath] = tracedDocument;

            callback(null, file);
        });

    }

    function unregisterFile(file, callback) {
        delete tracedDocuments[file.fullPath];
        var tracedPath = file.fullPath.replace(/\.js$/, '.recognizer.js');
        ProjectManager.deleteItem(FileSystem.getFileForPath(tracedPath));
    }

    function connectAll() {
        Object.keys(tracedDocuments).forEach(function(key) {
            tracedDocuments[key].connect();
        });
        _listen();
    }

    function disconnectAll() {
        WidgetManager.removeAll();
        Object.keys(tracedDocuments).forEach(function(key) {
            tracedDocuments[key].disconnect();
        });
        _stopListening();
    }

    function _listen() {
        var timestamp = 0;

        refreshInterval = setInterval(function () {

            Object.keys(tracedDocuments).forEach(function(key) {
                var tracedDocument = tracedDocuments[key];
                if (!tracedDocument.isReady()) {
                    return;
                }
                tracedDocument.getLog(timestamp, function(err, log) {
                    if (err) {
                        console.log('[recognizer] Error retrieving log', err);
                        return;
                    }
                    log.forEach(function(logItem) {
                        WidgetManager.getWidget(tracedDocument.file.fullPath, logItem.position).addEntry(logItem, tracedDocument.tracerId);
                    });
                });
                tracedDocument.getProbeValues(function(err, probes) {
                    if (err) {
                        console.log('[recognizer] Error retrieving probe values', err);
                        return;
                    }
                    probes.forEach(function(position) {
                        WidgetManager.getProbeWidget(tracedDocument.file.fullPath, position).updateValue(position, tracedDocument.tracerId);
                    });
                });
            });

            timestamp = Date.now();

        }, 100);
    }

    function _stopListening() {
        clearInterval(refreshInterval);
    }

    exports.registerFile = registerFile;
    exports.unregisterFile = unregisterFile;
    exports.connectAll = connectAll;
    exports.disconnectAll = disconnectAll;

});
define(function (require, exports, module) {
    'use strict';

    var FileSystem = brackets.getModule('filesystem/FileSystem'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        Instrumenter = require('src/Instrumenter'),
        WidgetManager = require('src/WidgetManager');

    var tracedDocuments = {},
        refreshInterval,
        _logStorage = [];

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
            var tracedDocument = Instrumenter.instrument(file.name, data);
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
    }

    function listen() {
        var timestamp = 0;

        refreshInterval = setInterval(function () {

            Object.keys(tracedDocuments).forEach(function(key) {
                if (!tracedDocuments[key].isReady()) {
                    return;
                }
                tracedDocuments[key].getLog(timestamp, function(err, log, tracerId) {
                    if (err) {
                        console.log('[recognizer] Error retrieving log', log);
                        return;
                    }
                    log.forEach(function(logItem) {
                        WidgetManager.getWidget(logItem.position).addEntry(logItem, tracerId);
                    });
                });
                tracedDocuments[key].getProbeValues(function(err, probes, tracerId) {
                    if (err) {
                        console.log('[recognizer] Error retrieving probe values', probeValues);
                        return;
                    }
                    probes.forEach(function(position) {
                        WidgetManager.getProbeWidget(position).updateValue(position, tracerId);
                    });
                });
            });

            timestamp = Date.now();

        }, 100);
    }

    function disconnectAll() {
        WidgetManager.removeAll();
    }

    exports.registerFile = registerFile;
    exports.unregisterFile = unregisterFile;
    exports.connectAll = connectAll;
    exports.listen = listen;
    exports.disconnectAll = disconnectAll;

});
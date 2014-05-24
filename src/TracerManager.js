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

        // Create instrumented file in .recognizer/ folder
        var projectRoot = ProjectManager.getProjectRoot().fullPath;
        var relativePath = file.fullPath.replace(projectRoot, '');
        var newPath = projectRoot + '.recognizer/' + relativePath;
        var newFile = FileSystem.getFileForPath(newPath);
        var newDirectory = FileSystem.getDirectoryForPath(newFile._parentPath).create()

        file.read({}, function(err, data, stat) {
            var tracerId = Math.floor(Math.random() * 1000 * 1000 * 1000);

            // If the code cannot be instrumented (e.g. there is an error in the code)
            try {
                var instrumentedCode = Instrumenter.instrument(data);
            } catch (e) {
                this.unregisterFile(file);
                console.warn('[Recognizer]', 'File', file.fullPath, 'cannot be instrumented because there is an error:', e);
                return;
            }

            var tracedDocument = new TracedDocument(
                file,
                tracerId,
                instrumentedCode.code.replace(/\{\{tracerId\}\}/g, tracerId),
                instrumentedCode.probes
            );

            newFile.write(tracedDocument.code, {blind: true}, function(err) {
                if (err) {
                    console.warn('[Recognizer]', 'Error while writing instrumented file', file.fullPath, 'using id', tracerId, '. Error:', err);
                    return;
                }

                console.log('[Recognizer]', 'Instrumenting file', file.fullPath, 'using id', tracerId);
                tracedDocuments[file.fullPath] = tracedDocument;
                callback(null, file);
            });

        }.bind(this));

    }

    function unregisterFile(file, callback) {
        delete tracedDocuments[file.fullPath];
        var tracedPath = file.fullPath.replace(/\.js$/, '.recognizer.js');
        // ProjectManager.deleteItem(FileSystem.getFileForPath(tracedPath));
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
        // Keep track when we have last retrieved values
        var timestamp = 0;

        refreshInterval = setInterval(function () {

            Object.keys(tracedDocuments).forEach(function(key) {
                var tracedDocument = tracedDocuments[key];
                if (!tracedDocument.isReady()) {
                    return;
                }
                tracedDocument.getLog(timestamp, function(err, log) {
                    if (err) {
                        console.error('[Recognizer] Error retrieving log', err, log);
                        return;
                    }
                    log.forEach(function(logItem) {
                        WidgetManager.getWidget(tracedDocument.file.fullPath, logItem.position).addEntry(logItem, tracedDocument.tracerId);
                    });
                });

                // Create probe widgets
                tracedDocument.updateProbeValues(function(err, probes) {
                    if (err) {
                        console.error('[Recognizer] Error retrieving probe values', err, probes);
                        return;
                    }
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
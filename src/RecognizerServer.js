/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";
    
    var BaseServer  = brackets.getModule("LiveDevelopment/Servers/BaseServer").BaseServer,
        FileUtils   = brackets.getModule("file/FileUtils"),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment');

    // The path on Windows starts with a drive letter (e.g. "C:").
    // In order to make it a valid file: URL we need to add an
    // additional slash to the prefix.
    var PREFIX = (brackets.platform === "win") ? "file:///" : "file://";

    /**
     * @constructor
     * @extends {BaseServer}
     * Server for file: URLs
     * @param {!{baseUrl: string, root: string, pathResolver: function(string): string}} config
     *    Configuration parameters for this server:
     *        baseUrl       - Optional base URL (populated by the current project)
     *        pathResolver  - Function to covert absolute native paths to project relative paths
     *        root          - Native path to the project root (and base URL)
     */
    function RecognizerServer() {
        BaseServer.call(this, LiveDevelopment.getCurrentProjectServerConfig());
    }
    
    RecognizerServer.prototype = Object.create(BaseServer.prototype);
    RecognizerServer.prototype.constructor = RecognizerServer;

    /**
     * Determines whether we can serve local file.
     * @param {string} localPath A local path to file being served.
     * @return {boolean} true for yes, otherwise false.
     */
    RecognizerServer.prototype.canServe = function (localPath) {
        console.log('canServe:', localPath, (!this._baseUrl && FileUtils.isStaticHtmlFileExt(localPath)));
        return true;
        // RecognizerServer requires that the base URL is undefined and static HTML files
        return (!this._baseUrl && FileUtils.isStaticHtmlFileExt(localPath));
    };

    /**
     * Convert a file: URL to a absolute file path
     * @param {string} url
     * @return {?string} The absolute path for given file: URL or null if the path is
     *  not a descendant of the project.
     */
    RecognizerServer.prototype.urlToPath = function (url) {
        console.log('urlToPath', url);
        if (url.indexOf(PREFIX) === 0) {
            // Convert a file URL to local file path
            return decodeURI(url.slice(PREFIX.length));
        }

        return null;
    };

    /**
     * Returns a file: URL for a given absolute path
     * @param {string} path Absolute path to covert to a file: URL
     * @return {string} Converts an absolute path within the project root to a file: URL.
     */
    RecognizerServer.prototype.pathToUrl = function (path) {
        console.log('pathToUrl', path);
        return encodeURI(PREFIX + path);
    };

    exports.RecognizerServer = RecognizerServer;
});
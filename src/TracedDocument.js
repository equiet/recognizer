/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var Inspector = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        WebInspector = require('thirdparty/WebInspector'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        HoverState = require('src/utils/HoverState').HoverState;

    function TracedDocument(file, tracerId, code) {
        this.file = file;
        this.tracerId = tracerId;
        this.code = code;

        this.markers = {};
        this._state = 'disconnected';
        this._probesCache = {};
        this.$tooltips = {};
        this.hoverState = new HoverState(['probe', 'tooltip']);

        DocumentManager.getDocumentForPath(file.fullPath).then(function(doc) {
            doc._ensureMasterEditor();
            this.hostEditor = doc._masterEditor;
            this.hostEditor._codeMirror.setOption('theme', 'default recognizer');
        }.bind(this));

        /**
         * Show/hide tooltips
         */

        // Handle mouseover on probes (add tooltip)
        $(this.hostEditor._codeMirror.display.wrapper).on('mouseenter', '.recognizer-probe', function(e) {
            // Extract id from the class name
            var probeId = $(e.currentTarget).attr('class').match(/is-probe-([0-9\-]+)/)[1].split('-').join(',');

            // Save hover state for probe
            this.hoverState.set(probeId, 'probe', true);

            _showTooltip(probeId, $(e.currentTarget));
        }.bind(this));

        $(this.hostEditor._codeMirror.display.wrapper).on('mouseleave', '.recognizer-probe', function(e) {
            // Extract id from the class name
            var probeId = $(e.currentTarget).attr('class').match(/is-probe-([0-9\-]+)/)[1].split('-').join(',');

            // Save hover state for probe
            this.hoverState.set(probeId, 'probe', false);

            // Allow some time to move from probe to tooltip
            setTimeout(function() {
                _hideTooltip(probeId);
            }, 200);
        }.bind(this));

        $('.main-view').on('mouseenter', '.recognizer-probe-tooltip', function(e) {
            var probeId = $(e.currentTarget).data('probe');

            // Save hover state for probe
            this.hoverState.set(probeId, 'tooltip', true);
        }.bind(this));

        $('.main-view').on('mouseleave', '.recognizer-probe-tooltip', function(e) {
            var probeId = $(e.currentTarget).data('probe');

            // Save hover state for probe
            this.hoverState.set(probeId, 'tooltip', false);

            setTimeout(function() {
                _hideTooltip(probeId);
            }, 200);
        }.bind(this));

        var _showTooltip = function(probeId, $anchorElement) {
            // Do nothing if tooltip already exists
            if (this.$tooltips[probeId]) {
                return;
            }

            // Compute tooltip position
            var clientRect = $anchorElement[0].getBoundingClientRect();

            var tooltipWidth, tooltipHeight;

            if (this._probesCache[probeId].type === 'object' || this._probesCache[probeId].type === 'function') {
                tooltipWidth = 400;
                tooltipHeight = 180;
            } else {
                tooltipWidth = 100;
                tooltipHeight = 30;
            }

            // Create tooltip
            this.$tooltips[probeId] = $('<div />')
                .addClass('recognizer-probe-tooltip')
                .addClass('is-' + this._probesCache[probeId].type)
                .css({
                    width: tooltipWidth,
                    height: tooltipHeight,
                    top: clientRect.top + clientRect.height,
                    left: clientRect.left + clientRect.width/2 - tooltipWidth/2
                })
                .appendTo($('.main-view'))
                .data('probe', probeId)
                .html('Loading...')
                .on('mouseenter', function() {
                    $(this).data('keepOpen', true);
                })
                .on('mouseleave', function() {
                    $(this).data('keepOpen', false);
                });

            // Decide whether to show tooltip above or below the anchor
            if (clientRect.top + clientRect.height + tooltipHeight > $('body').height()) {
                this.$tooltips[probeId]
                    .addClass('is-above')
                    .css({top: clientRect.top - tooltipHeight});
            } else {
                this.$tooltips[probeId]
                    .addClass('is-below')
                    .css({top: clientRect.top + clientRect.height});
            }

            // Get value of the probe
            Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '._probeValues["' + probeId + '"]', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
                var result = WebInspector.RemoteObject.fromPayload(res.result);
                var message = new WebInspector.ConsoleCommandResult(result, !!res.wasThrown, '', WebInspector.Linkifier, undefined, undefined, undefined);
                var messageElement = message.toMessageElement();
                console.log(result, message, messageElement);

                $(messageElement).find('.section .header').trigger('click').hide();

                if (this.$tooltips[probeId]) {
                    this.$tooltips[probeId].html(messageElement);
                }

            }.bind(this));
        }.bind(this);

        // Handle mouseout on probes (remove tooltip)
        var _hideTooltip = function(probeId) {
            // Do nothing if tooltip is still hovered
            if (this.hoverState.isHovered(probeId)) {
                return;
            }

            // Remove the tooltip
            if (this.$tooltips[probeId]) {
                this.$tooltips[probeId].remove()
                this.$tooltips[probeId] = null;
            }
        }.bind(this);

    }

    TracedDocument.prototype.isReady = function() {
        return this._state === 'connected';
    };

    TracedDocument.prototype.connect = function() {
        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.connect()', function (res) {
            if (!res.wasThrown) {
                this._objectId = res.result.objectId;
                this._state = 'connected';
                $(exports).trigger('connected');
                console.log('[recognizer] Connected to tracer in ' + this.file.name);
            } else {
                console.log('[recognizer] Error connecting to tracer in ' + this.file.name, res);
            }
        }.bind(this));
    };

    TracedDocument.prototype.disconnect = function() {
        this._state = 'disconnected';
    };

    TracedDocument.prototype.getLog = function(since, callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.getCalls(' + since + ')', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            callback(false, JSON.parse(res.result.value));

        }.bind(this));

    };

    TracedDocument.prototype.updateProbeValues = function(callback) {

        Inspector.Runtime.evaluate('__recognizer' + this.tracerId + '.updateProbeValues()', function (res) {

            if (res.wasThrown) {
                callback(true, res.result);
                return;
            }

            this.insertProbes(false, JSON.parse(res.result.value), this.tracerId);

            // TODO: Figure out what to do with probe widgets
            // probes.forEach(function(probe) {
            //     WidgetManager.getProbeWidget(tracedDocument.file.fullPath, probe.id).updateValue(probe.id, tracedDocument.tracerId);
            // });

            callback(false, JSON.parse(res.result.value), this.tracerId);

        }.bind(this));

    };

    TracedDocument.prototype.insertProbes = function(err, probes) {

        var getProbeType = function(id) {
            return probes.filter(function(probe) {
                return probe.id === id;
            })[0].type;
        };

        probes.forEach(function(probe, index) {
            // probe = {id, type}

            var location = probe.id.split(',').map(function(val, index) {
                return parseInt(val, 10);
            });

            // Do not continue if cache is not invalidated
            if (this._probesCache[probe.id] && this._probesCache[probe.id].type === probe.type) {
                return;
            }

            // Store current value into cache
            this._probesCache[probe.id] = probe;

            // Clear previous marker
            if (this.markers[probe.id]) {
                this.markers[probe.id].clear();
            }

            // Create new marker
            this.markers[probe.id] = this.hostEditor._codeMirror.markText(
                {line: location[0] - 1, ch: location[1]},
                {line: location[2] - 1, ch: location[3]},
                {
                    className: 'recognizer-probe is-' + probe.type + ' is-probe-' + location.join('-')
                }
            );

        }.bind(this));

    };

    exports.TracedDocument = TracedDocument;

});
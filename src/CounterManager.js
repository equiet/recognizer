define(function (require, exports, module) {
	'use strict';

	var CounterWidget = require('src/CounterWidget').CounterWidget;

	var _counters = {};

	function updateCounter(id, count) {
		if (!_matchPosition(id)) {
			return null;
		}
		if (_counters[id] === undefined) {
			_counters[id] = new CounterWidget(_getPositionFromId(id));
		}
		_counters[id].updateCounter(count);
		return _counters[id];
	}

	function _matchPosition(id) {
		return id.match(/function-(\d+)-(\d+)-(\d+)-(\d+)$/i);
	}

	function _getPositionFromId(id) {
		var values = _matchPosition(id);
		return {
			line: parseInt(values[1], 10),
			ch: parseInt(values[2], 10)
		};
	}

	exports.updateCounter = updateCounter;

});
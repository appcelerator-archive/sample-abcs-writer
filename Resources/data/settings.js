var E = require('lib/events');

/*
 Initialization.
 */
var version = 1;

/*
 Public API.
 */
exports.defaultPenWidth = defineSetting('Double', 'defaultPenWidth', 10);
exports.defaultPenColor = defineSetting('String', 'defaultPenColor', '#00ff00');
exports.defaultPenHueColor = defineSetting('String', 'defaultPenHueColor', '#00ff00');
exports.defaultPenStrokeHueRatio = defineSetting('Double', 'defaultPenStrokeHueRatio', 0.7);
exports.defaultPenStrokeRatioX = defineSetting('Double', 'defaultPenStrokeRatioX', 0);
exports.defaultPenStrokeRatioY = defineSetting('Double', 'defaultPenStrokeRatioY', 0);

/*
 Implementation.
 */
function defineSetting(type, key, def) {
	return function(val) {
		var identifier = 'Settings-' + version + '-' + key,
			existing = Ti.App.Properties['get' + type](identifier, def);

		if (val !== undefined) {
			if (val !== existing) {
				Ti.App.Properties['set' + type](identifier, val);
				E.fireEvent('update' + key, { value: val });
			}
		}
		else {
			return existing;
		}
	};
}
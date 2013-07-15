var E = require('lib/events');

/*
 Public API.
 */
exports.addToView = addToView;

/*
 Implementation.
 */

function addToView(win) {
	var bar = exports.lastView = Ti.UI.createScrollView({
		backgroundImage: '/images/tile-dark.png',
		top: 0, right: 0, left: 0,
		height: 41,
		contentWidth: 'auto',
		scrollType: 'horizontal',
		showHorizontalScrollIndicator: false,
		horizontalBounce: true,
		zIndex: 3
	});
	win.add(bar);

	bar.addEventListener('singletap', clickLetter);

	var letters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		lastLetter = Ti.App.Properties.getString('lastLetter', ' ');
	for (var k = 0, kL = letters.length; k < kL; k++) {
		var label = Ti.UI.createLabel({
			text: letters[k], textAlign: 'center',
			top: 0, left: (40 * k),
			width: 40, height: 38,
			font: { fontWeight: 'bold', fontSize: 20  },
			color: '#fff'
		});
		if (Ti.Platform.osname != 'android') {
			label.opacity = 0.5;
		}
		bar.add(label);
		if (letters[k] == lastLetter) {
			bar.scrollTo(k * 40, 0);
			label.fireEvent('singletap', { source: label });
		}
	}
}

var lastLabel = null;

function clickLetter(evt) {
	if (lastLabel != null) {
		if (Ti.Platform.osname != 'android') {
			lastLabel.opacity = 0.5;
		}
		lastLabel.backgroundImage = null;
	}
	lastLabel = evt.source;
	if (Ti.Platform.osname != 'android') {
		lastLabel.opacity = 1;
	}
	lastLabel.backgroundImage = '/images/selectedLetter.png';
	E.fireEvent('switchToLetter', lastLabel.text);
}
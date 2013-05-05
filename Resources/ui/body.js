var U = require('lib/utils'),
	E = require('lib/events');

/*
 Public API.
 */
exports.addToView = addToView;

/*
 Implementation.
 */
function addToView(win) {

	var container = Ti.UI.createView({
		top: 82, right: 0, bottom: 0, left: 0
	});
	win.add(container);

	var guideSize = U.ipad ? {
		width: 600, height: 375,
		topOffset: 96,
		barHeight: 280
	} : {
		width: 320, height: 200,
		topOffset: 52,
		barHeight: 150
	};

	/**
	 * Draw the center of the app. We'll create our paint view as well as the various guides.
	 */

	var guides = Ti.UI.createView({
		height: guideSize.barHeight,
		opacity: 0.6,
		visible: false
	});

	// top
	guides.add(Ti.UI.createView({
		height: 1, top: 0,
		backgroundColor: '#82cafa'
	}));
	guides.add(Ti.UI.createView({
		height: 1, top: 1,
		backgroundColor: '#000'
	}));

	// middle
	guides.add(Ti.UI.createImageView({
		image: '/Images/PinkLine@2x.png',
		width: 1024, height: 2,
		bottom: guideSize.barHeight / 2,
		hires: true
	}));

	// bottom
	guides.add(Ti.UI.createView({
		height: 1, bottom: 1,
		backgroundColor: '#82cafa'
	}));
	guides.add(Ti.UI.createView({
		height: 1, bottom: 0,
		backgroundColor: '#000'
	}));

	container.add(guides);

	var letterContainer = Ti.UI.createView({
		width: guideSize.width, height: guideSize.height + guideSize.topOffset
	});
	var letterDisplay = Ti.UI.createView({
		top: guideSize.topOffset,
		width: guideSize.width, height: guideSize.height
	});
	letterContainer.add(letterDisplay);
	container.add(letterContainer);

	E.addEventListener('switchToLetter', switchToLetter);

	function switchToLetter(letter) {
		guides.visible = letter != ' ';
		letterDisplay.backgroundImage = letter != ' ' ? '/Images/Letters-72/' + letter.toLowerCase() + '.png' : null;
		Ti.App.Properties.setString('lastLetter', letter);
	}
}
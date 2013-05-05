/**
 * Draw the bottom guide-selection bar. This will be a scroll view of letters the user can choose from.
 */
win.add(Ti.UI.createView({
	right: 0, bottom: 0, left: 0,
	height: 38,
	backgroundImage: 'Images/Tile-Bottom-Off.png'
}));
var bottomBar = Ti.UI.createScrollView({
	right: 0, bottom: 0, left: 0,
	height: 38,
	contentWidth: 'auto',
	scrollType: 'horizontal',
	showHorizontalScrollIndicator: false,
	horizontalBounce: true
});
win.add(bottomBar);

var lastLabel = null;
bottomBar.addEventListener('click', function(evt) {
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
	lastLabel.backgroundImage = 'Images/Tile-Bottom-On.png';
	switchToLetter(lastLabel.text);
});

var letters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
for (var k in letters.split('')) {
	var label = Ti.UI.createLabel({
		text: letters[k], textAlign: 'center',
		top: 0, left: (40 * k),
		height: 38,
		font: { fontWeight: 'bold', fontSize: 20  },
		color: '#fff',
		width: 40
	});
	if (Ti.Platform.osname != 'android') {
		label.opacity = 0.5;
	}
	bottomBar.add(label);
	if (letters[k] == Ti.App.Properties.getString('lastLetter', ' ')) {
		label.fireEvent('click', { source: label });
		bottomBar.scrollTo(k * 40, 0);
	}
}
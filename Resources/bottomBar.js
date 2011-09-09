/**
 * Draw the bottom guide-selection bar. This will be a scroll view of letters the user can choose from.
 */
win.add(Ti.UI.createView({
    right: 0, bottom: 0, left: 0,
    height: 38 + u,
    backgroundImage: 'Images/Tile-Bottom-Off.png'
}));
var bottomBar = Ti.UI.createScrollView({
    right: 0, bottom: 0, left: 0,
    height: 38 + u,
    contentWidth: 'auto',
    scrollType: 'horizontal',
    showHorizontalScrollIndicator: false
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

var letters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (var k in letters.split('')) {
    var label = Ti.UI.createLabel({
        text: letters[k], textAlign: 'center',
        top: 0, left: (40 * k) + u,
        height: 38 + u,
        font: { fontWeight: 'bold', fontSize: 20 + u },
        color: '#fff',
        width: 40 + u
    });
    if (Ti.Platform.osname != 'android') {
        label.opacity = 0.5;
    }
    bottomBar.add(label);
    if (letters[k] == ' ') {
        label.fireEvent('click', { source: label });
    }
}
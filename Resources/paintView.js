var guideSize = Ti.Platform.osname === 'ipad' ? {
    width: 600, height: 375,
    topOffset: 96,
    barHeight: 280, barBottom: 70
} : {
    width: 320, height: 200,
    topOffset: 52,
    barHeight: 150, barBottom: 35
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
    image: 'Images/PinkLine@2x.png',
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

win.add(guides);

var letterContainer = Ti.UI.createView({
    width: guideSize.width, height: guideSize.height + guideSize.topOffset
});
var letterDisplay = Ti.UI.createView({
    top: guideSize.topOffset,
    width: guideSize.width, height: guideSize.height
});
letterContainer.add(letterDisplay);
win.add(letterContainer);

function switchToLetter(letter) {
    guides.visible = letter != ' ';
    if (letter != ' ') {
        letterDisplay.backgroundImage = '/Images/Letters-iPad/' + letter.toLowerCase() + '.png';
    }
    else {
        letterDisplay.backgroundImage = null;
    }
    Ti.App.Properties.setString('lastLetter', letter);
}

win.add(paintView);
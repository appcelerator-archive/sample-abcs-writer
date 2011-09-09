/**
 * Draw the center of the app. We'll create our paint view as well as the various guides.
 */

var guides = Ti.UI.createView({
    backgroundImage: 'Images/Guides' + img + '.png',
    left: 0, right: 0,
    top: 90 + u, bottom: 90 + u
});
win.add(guides);

var letterLabel = Ti.UI.createLabel({
    top: 47 + u, right: 0, bottom: 38 + u, left: 0,
    font: { fontSize: Ti.Platform.osname == 'ipad' ? 635 : 320 + u },
    textAlign: 'center',
    color: '#484848',
    opacity: 0.2
});
win.add(letterLabel);

function switchToLetter(letter) {
    letterLabel.text = letter;
    if (letter == ' ') {
        guides.hide();
    }
    else {
        guides.show();
    }
}

win.add(paintView);
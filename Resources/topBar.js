/**
 * Draw the top bar. This is where the user can choose size color and eraser mode, as well as saving and clearing.
 */
var topBar = Ti.UI.createView({
    top: 0, right: 0, left: 0,
    height: 44 + u,
    backgroundImage: 'Images/Tile-Top.png'
});
win.add(topBar);

/**
 * Create a save button. This will save the paintView to the user's photo gallery.
 */
var save = Ti.UI.createButton({
    width: 56 + u, height: 31 + u,
    left: 5 + u, top: 7 + u,
    backgroundImage: 'Images/Buttons/Save.png'
});
function saveSuccess() {
    Ti.UI.createAlertDialog({
        title: 'Success',
        message: 'Your drawing was saved to the photo gallery.'
    }).show();
}
function saveFailure(err) {
    Ti.UI.createAlertDialog({
        title: 'Failure',
        message: 'We had some trouble saving it: ' + err + '.'
    }).show();
}

save.addEventListener('click', function() {
    if (Ti.Android) {
        try {
            var fileName = 'Painting-' + new Date().getTime() + '.png';
            var imageFile = Ti.Filesystem.getFile('file:///sdcard/').exists()
                ? Ti.Filesystem.getFile('file:///sdcard/', fileName)
                : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);
            imageFile.write(win.toImage().media);
            Ti.Media.Android.scanMediaFiles([ imageFile.nativePath ], null, saveSuccess);
        }
        catch (err) {
            saveFailure(err);
        }
    }
    else {
        Ti.Media.saveToPhotoGallery(paintView.toImage(), {
            success: saveSuccess,
            failure: saveFailure
        });
    }
});
topBar.add(save);

/**
 * Create a color button.
 */
var colorSwatch = Ti.UI.createView({
    width: 30 + u, height: 26 + u,
    left: 68 + u, top: 9 + u,
    backgroundColor: paintView.strokeColor
});
topBar.add(colorSwatch);
var color = Ti.UI.createButton({
    width: 34 + u, height: 30 + u,
    left: 66 + u, top: 7 + u,
    backgroundImage: 'Images/Buttons/Insert-Off.png'
});
color.addEventListener('click', function() {
    showColorPicker({
        initial: paintView.strokeColor,
        success: function(color) {
            paintView.strokeColor = colorSwatch.backgroundColor = color;
        }
    });
});
topBar.add(color);

/**
 * Create a size slider.
 */
var sizeSlider = Ti.UI.createSlider({
    min: 0.25, max: 50, value: paintView.strokeWidth,
    left: 105 + u, right: 105 + u, top: 10 + u,
    height: 'auto'
});
topBar.add(sizeSlider);
sizeSlider.addEventListener('change', function(e) {
    try {
        paintView.strokeWidth = e.value;
    }
    catch(err) {
    }
});

/**
 * Create a erase mode button.
 */
topBar.add(Ti.UI.createView({
    width: 30 + u, height: 26 + u,
    right: 68 + u, top: 9 + u,
    backgroundColor: '#fff'
}));
var eraseMode = Ti.UI.createButton({
    width: 34 + u, height: 30 + u,
    right: 66 + u, top: 7 + u,
    backgroundImage: 'Images/Buttons/Insert-Off.png'
});
eraseMode.add(Ti.UI.createImageView({
    width: 23 + u, height: 22 + u,
    right: 5 + u, top: 4 + u,
    image: 'Images/Buttons/Eraser.png'
}));
eraseMode.addEventListener('click', function() {
    paintView.eraseMode = !paintView.eraseMode;
    eraseMode.backgroundImage = 'Images/Buttons/Insert-' + (paintView.eraseMode ? 'On' : 'Off') + '.png';
});
topBar.add(eraseMode);

/**
 * Create a clear button.
 */
var clear = Ti.UI.createButton({
    width: 56 + u, height: 31 + u,
    right: 5 + u, top: 7 + u,
    backgroundImage: 'Images/Buttons/Clear.png'
});
clear.addEventListener('click', function() {
    var confirm = Ti.UI.createAlertDialog({
        title: 'Clear Drawing',
        message: 'Are you sure?',
        buttonNames: ['Yes','No'],
        cancel: 1
    });
    confirm.show();
    confirm.addEventListener('click', function(evt) {
        if (evt.index != confirm.cancel) {
            paintView.clear();
        }
    });
});
topBar.add(clear);
var colorPicker = require('./colorPicker');

/*
 Public API.
 */
exports.addToView = addToView;

/*
 Implementation.
 */
function addToView(win, paintView) {
	/**
	 * Draw the top bar. This is where the user can choose size color and eraser mode, as well as saving and clearing.
	 */
	var topBar = Ti.UI.createView({
		top: 0, right: 0, left: 0,
		height: 44,
		backgroundImage: '/Images/Tile-Top.png'
	});
	win.add(topBar);

	/**
	 * Create a save button. This will save the paintView to the user's photo gallery.
	 */
	var save = Ti.UI.createButton({
		width: 56, height: 31,
		left: 5, top: 7,
		backgroundImage: '/Images/Buttons/Save.png'
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
				imageFile.write(paintView.toImage().media);
				Ti.Media.Android.scanMediaFiles([ imageFile.nativePath ], null, saveSuccess);
			}
			catch (err) {
				saveFailure(err);
			}
		}
		else {
			Ti.Media.saveToPhotoGallery(paintView.toImage(null, true), {
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
		width: 30, height: 26,
		left: 68, top: 9,
		backgroundColor: paintView.strokeColor
	});
	topBar.add(colorSwatch);
	var color = Ti.UI.createButton({
		width: 34, height: 30,
		left: 66, top: 7,
		backgroundImage: '/Images/Buttons/Insert-Off.png'
	});
	color.addEventListener('click', function() {
		colorPicker.show({
			win: win,
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
		left: 105, right: 105, top: 10,
		height: Ti.UI.SIZE
	});
	topBar.add(sizeSlider);
	sizeSlider.addEventListener('change', function(e) {
		try {
			paintView.strokeWidth = e.value;
		}
		catch (err) {
		}
	});

	/**
	 * Create a erase mode button.
	 */
	topBar.add(Ti.UI.createView({
		width: 30, height: 26,
		right: 68, top: 9,
		backgroundColor: '#fff'
	}));
	var eraseMode = Ti.UI.createButton({
		width: 34, height: 30,
		right: 66, top: 7,
		backgroundImage: '/Images/Buttons/Insert-Off.png',
		opacity: 0.5
	});
	eraseMode.add(Ti.UI.createImageView({
		width: 23, height: 22,
		right: 5, top: 4,
		image: '/Images/Buttons/Eraser.png'
	}));
	eraseMode.addEventListener('click', function() {
		paintView.eraseMode = !paintView.eraseMode;
		eraseMode.opacity = paintView.eraseMode ? 1 : 0.5;
		eraseMode.backgroundImage = '/Images/Buttons/Insert-' + (paintView.eraseMode ? 'On' : 'Off') + '.png';
	});
	topBar.add(eraseMode);

	/**
	 * Create a clear button.
	 */
	var clear = Ti.UI.createButton({
		width: 56, height: 31,
		right: 5, top: 7,
		backgroundImage: '/Images/Buttons/Clear.png'
	});
	clear.addEventListener('click', function() {
		paintView.clear();
	});
	topBar.add(clear);
}
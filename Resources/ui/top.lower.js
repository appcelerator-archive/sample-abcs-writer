var ColorPicker = require('./colorPicker'),
	PaintView = require('./paintView'),
	E = require('lib/events');

/*
 Public API.
 */
exports.addToView = addToView;

/*
 Implementation.
 */
function addToView(win) {
	/**
	 * Draw the top bar. This is where the user can choose size color and eraser mode, as well as saving and clearing.
	 */
	var topBar = Ti.UI.createView({
		top: 38, right: 0, left: 0,
		height: 44,
		backgroundImage: '/Images/Tile-Top.png'
	});
	win.add(topBar);

	/**
	 * Create a save button. This will save the drawing to the user's photo gallery.
	 */
	var save = Ti.UI.createButton({
		width: 56, height: 31,
		left: 5, top: 7,
		backgroundImage: '/Images/Buttons/Save.png'
	});
	save.addEventListener('click', E.curryFireEvent('paint:save'));
	topBar.add(save);

	/**
	 * Create a color button.
	 */
	var colorSwatch = Ti.UI.createView({
		width: 30, height: 26,
		left: 68, top: 9,
		backgroundColor: PaintView.strokeColor()
	});
	topBar.add(colorSwatch);
	var color = Ti.UI.createButton({
		width: 34, height: 30,
		left: 66, top: 7,
		backgroundImage: '/Images/Buttons/Insert-Off.png'
	});
	color.addEventListener('click', function() {
		ColorPicker.show({
			win: win,
			initial: colorSwatch.backgroundColor,
			success: function(color) {
				PaintView.strokeColor(colorSwatch.backgroundColor = color);
			}
		});
	});
	topBar.add(color);

	/**
	 * Create a size slider.
	 */
	var sizeSlider = Ti.UI.createSlider({
		min: 0.25, max: 50, value: PaintView.strokeWidth(),
		left: 105, right: 105, top: 10,
		height: Ti.UI.SIZE
	});
	topBar.add(sizeSlider);
	sizeSlider.addEventListener('change', function(e) {
		try {
			PaintView.strokeWidth(e.value);
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
	var eraseModeOn = false,
		eraseMode = Ti.UI.createButton({
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
		eraseModeOn = !eraseModeOn;
		eraseMode.opacity = eraseModeOn ? 1 : 0.5;
		eraseMode.backgroundImage = '/Images/Buttons/Insert-' + (eraseModeOn ? 'On' : 'Off') + '.png';
		E.fireEvent('paint:erase-' + (eraseModeOn ? 'on' : 'off'));
	});
	topBar.add(eraseMode);

	/**
	 * Create a clear button.
	 */
	var clear = Ti.UI.createButton({
		width: 56, height: 31,
		right: 5, top: 7,
		backgroundImage: '/Images/Buttons/Clear.png',
		opacity: 0.3
	});
	clear.addEventListener('click', doClear);
	topBar.add(clear);

	function doClear() {
		if (clear.undoMode) {
			E.fireEvent('paint:swap-cleared');
		}
		else {
			E.fireEvent('paint:clear');
			clear.backgroundImage = '/Images/Buttons/Undo.png';
			clear.undoMode = true;
		}
	}

	E.addEventListener('paint:first-draw', function() {
		clear.backgroundImage = '/Images/Buttons/Clear.png';
		clear.undoMode = false;
		clear.opacity = 1;
	});

}
var ColorPicker = require('./colorPicker'),
	PaintView = require('./paintView'),
	A = require('lib/animations'),
	E = require('lib/events'),
	S = require('data/settings');

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

	/*
	 Pen Stroke.
	 */
	var pen = Ti.UI.createView({
		width: 75,
		left: 66,
		top: 0
	});
	pen.addEventListener('click', function(evt) {
		var makeVisible = colorPicker.isVisible = !colorPicker.isVisible;
		colorPicker.touchEnabled = makeVisible;
		A.fade(colorPicker, makeVisible ? 1 : 0);
		A.fade(penHighlight, makeVisible ? 1 : 0);
		if (makeVisible && PaintView.eraseMode()) {
			toggleEraser();
		}
	});
	var penStroke = Ti.UI.createView({
		width: S.defaultPenWidth(), height: S.defaultPenWidth(),
		borderRadius: S.defaultPenWidth() / 2,
		backgroundColor: S.defaultPenColor(),
		touchEnabled: false
	});
	var penStrokeShadow = Ti.UI.createView({
		width: S.defaultPenWidth(), height: S.defaultPenWidth(),
		center: { x: 37, y: 23 },
		borderRadius: S.defaultPenWidth() / 2,
		backgroundColor: '#000',
		opacity: 0.75,
		touchEnabled: false
	});
	var penHighlight = Ti.UI.createView({
		backgroundImage: '/Images/Tile-Bottom-Off.png',
		opacity: 0,
		touchEnabled: false
	});
	pen.add(penHighlight);
	pen.add(penStrokeShadow);
	pen.add(penStroke);
	topBar.add(pen);

	/*
	 Eraser.
	 */
	var eraser = Ti.UI.createView({
		width: 73,
		left: 141,
		top: 0
	});
	eraser.addEventListener('click', toggleEraser);
	var eraserHighlight = Ti.UI.createView({
		backgroundImage: '/Images/Tile-Bottom-Off.png',
		opacity: 0,
		touchEnabled: false
	});
	eraser.add(eraserHighlight);
	eraser.add(Ti.UI.createView({
		backgroundImage: '/Images/eraser.png',
		width: 38, height: 38,
		touchEnabled: false
	}));
	topBar.add(eraser);

	var flashEraserIntervalID, stopFlash;

	function toggleEraser() {
		PaintView.eraseMode(!PaintView.eraseMode());
		if (PaintView.eraseMode()) {
			A.fade(eraserHighlight, 1);
			flashEraserIntervalID = setInterval(flashEraser, 1000);
		}
		else {
			clearEraserFlash();
		}
	}

	function flashEraser() {
		stopFlash = A.flash(eraserHighlight, undefined, 0.5, 1);
	}

	function clearEraserFlash() {
		if (flashEraserIntervalID) {
			clearInterval(flashEraserIntervalID);
			stopFlash && stopFlash();
			A.fade(eraserHighlight, 0);
			flashEraserIntervalID = null;
		}
	}

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

	var colorPicker = ColorPicker.createView({
		top: 76
	}, PaintView, penStroke, penStrokeShadow);
	win.add(colorPicker);
}
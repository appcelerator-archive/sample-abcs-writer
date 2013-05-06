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
	/*
	 Draw the top bar. This is where the user can choose size color and eraser mode, as well as saving and clearing.
	 */
	var topBar = Ti.UI.createView({
		top: 40, right: 0, left: 0,
		height: 41
	});
	win.add(topBar);

	/*
	 Create a save button. This will save the drawing to the user's photo gallery.
	 */
	var save = Ti.UI.createButton({
		backgroundImage: '/images/buttons/save.png',
		width: 70, height: 41,
		left: 0, top: 0
	});
	save.addEventListener('click', E.curryFireEvent('paint:save'));
	topBar.add(save);

	/*
	 Pen Stroke.
	 */
	var pen = Ti.UI.createView({
		backgroundImage: '/images/buttons/pen.png',
		width: 70, height: 41,
		top: 0, left: 70
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
		center: { x: pen.width / 2, y: pen.height / 2 + 1 },
		borderRadius: S.defaultPenWidth() / 2,
		backgroundColor: '#fff',
		opacity: 0.75,
		touchEnabled: false
	});
	var penHighlight = Ti.UI.createView({
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		top: -10, right: 1, bottom: 1, left: -10,
		borderRadius: 6,
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
		backgroundImage: '/images/buttons/eraser.png',
		width: 70, height: 41,
		top: 0, right: 70
	});
	eraser.addEventListener('click', toggleEraser);
	var eraserHighlight = Ti.UI.createView({
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		top: -10, right: -10, bottom: 1, left: 1,
		borderRadius: 6,
		opacity: 0,
		touchEnabled: false
	});
	eraser.add(eraserHighlight);
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

	/*
	 Create a clear button.
	 */
	var clear = Ti.UI.createButton({
		backgroundImage: '/images/buttons/clear.png',
		width: 70, height: 41,
		right: 0, top: 0
	});
	clear.addEventListener('click', doClear);
	topBar.add(clear);

	function doClear() {
		if (clear.undoMode) {
			E.fireEvent('paint:swap-cleared');
		}
		else {
			E.fireEvent('paint:clear');
			clear.undoMode = true;
		}
	}

	E.addEventListener('paint:first-draw', function() {
		clear.undoMode = false;
	});

	var colorPicker = ColorPicker.createView({
		top: 75, left: -16
	}, PaintView, penStroke, penStrokeShadow);
	win.add(colorPicker);
}
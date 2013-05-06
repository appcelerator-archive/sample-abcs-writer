var Paint = require('ti.paint'),
	E = require('lib/events'),
	S = require('data/settings');

var win, paintWrapper, clearedPaintWrapper;

/*
 Public API.
 */
exports.init = init;
exports.addToView = addToView;
exports.eraseMode = eraseMode;
exports.strokeColor = strokeColor;
exports.strokeWidth = strokeWidth;

/*
 Implementation.
 */
function init() {
	paintWrapper = createView();

	E
		.addEventListener('paint:save', save)
		.addEventListener('paint:clear', clear)
		.addEventListener('switchToLetter', clear)
		.addEventListener('paint:swap-cleared', swapCleared)
	;
}

function addToView(_win) {
	win = _win;
	paintWrapper.container.addEventListener('touchmove', paintLayerTouchMoveListener);
	win.add(paintWrapper.container);
}

function eraseMode(val) {
	if (!paintWrapper) {
		return;
	}
	if (val === undefined) {
		return paintWrapper.view.eraseMode;
	}
	else {
		return paintWrapper.view.eraseMode = val;
	}
}

function strokeColor(val) {
	if (!paintWrapper) {
		return;
	}
	if (val === undefined) {
		return paintWrapper.view.strokeColor;
	}
	else {
		return paintWrapper.view.strokeColor = val;
	}
}

function strokeWidth(val) {
	if (!paintWrapper) {
		return;
	}
	if (val === undefined) {
		return paintWrapper.view.strokeWidth;
	}
	else {
		return paintWrapper.view.strokeWidth = val;
	}
}

/*
 Utility.
 */

function save() {
	if (Ti.Android) {
		try {
			var now = new Date();
			var fileName = 'Painting-' + now.toLocaleString() + '.png';
			var imageFile = Ti.Filesystem.getFile('file:///sdcard/').exists()
				? Ti.Filesystem.getFile('file:///sdcard/', fileName)
				: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);
			imageFile.write(paintWrapper.view.toImage().media);
			Ti.Media.Android.scanMediaFiles([ imageFile.nativePath ], null, saveSuccess);
		}
		catch (err) {
			saveFailure(err);
		}
	}
	else {
		Ti.Media.saveToPhotoGallery(paintWrapper.view.toImage(null, true), {
			success: saveSuccess,
			failure: saveFailure
		});
	}
}

function clear() {
	win.remove(paintWrapper.container);
	clearedPaintWrapper = paintWrapper;
	paintWrapper = createView();
	paintWrapper.container.addEventListener('touchmove', paintLayerTouchMoveListener);
	persistPaintProperties(clearedPaintWrapper.view, paintWrapper.view);
	win.add(paintWrapper.container);
}

function swapCleared() {
	win.remove(paintWrapper.container);
	var temp = paintWrapper;
	paintWrapper = clearedPaintWrapper;
	clearedPaintWrapper = temp;
	paintWrapper.container.addEventListener('touchmove', paintLayerTouchMoveListener);
	persistPaintProperties(clearedPaintWrapper.view, paintWrapper.view);
	win.add(paintWrapper.container);
}

function createView() {
	var container = Ti.UI.createScrollView({
		top: 0, right: 0, bottom: 0, left: 0,
		verticalBounce: false,
		disableBounce: true,
		zIndex: 1
	});
	var view = Paint.createPaintView({
		strokeColor: S.defaultPenColor(), strokeWidth: S.defaultPenWidth(),
		eraseMode: false
	});
	container.add(view);
	return { container: container, view: view };
}

function persistPaintProperties(from, to) {
	to.strokeColor = from.strokeColor;
	to.strokeWidth = from.strokeWidth;
	to.eraseMode = from.eraseMode;
}

function paintLayerTouchMoveListener() {
	paintWrapper.container.removeEventListener('touchmove', paintLayerTouchMoveListener);
	E.fireEvent('paint:first-draw');
}

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
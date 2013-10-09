var Paint = require('ti.paint'),
	E = require('lib/events'),
	S = require('data/settings'),
	T = require('ui/toast');

var win,
	didPaint = false,
	paintWrapper,
	clearedPaintWrapper,
	paintsByLetter = {};

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
		.addEventListener('paint:swap-cleared', swapCleared)
		.addEventListener('switchToLetter', switchToLetter)
	;
}

function addToView(_win) {
	win = _win;
	bind();
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
			imageFile.write(paintWrapper.container.toImage().media);
			Ti.Media.Android.scanMediaFiles([ imageFile.nativePath ], null, saveSuccess);
		}
		catch (err) {
			saveFailure(err);
		}
	}
	else {
		Ti.Media.saveToPhotoGallery(paintWrapper.container.toImage(null, true), {
			success: saveSuccess,
			failure: saveFailure
		});
	}
}

function clear() {
	win.remove(paintWrapper.container);
	clearedPaintWrapper = paintWrapper;
	paintWrapper = createView();
	bind();
}

function swapCleared() {
	win.remove(paintWrapper.container);
	var temp = paintWrapper;
	paintWrapper = clearedPaintWrapper;
	clearedPaintWrapper = temp;
	bind();
}

function switchToLetter(letter, oldLetter) {
	if (!paintWrapper) {
		return;
	}
	win.remove(paintWrapper.container);
	paintsByLetter[oldLetter] = paintWrapper;
	clearedPaintWrapper = null;
	didPaint = false;
	if (paintsByLetter[letter]) {
		paintWrapper = paintsByLetter[letter];
	}
	else {
		paintWrapper = createView();
	}
	bind();
}

function bind() {
	didPaint = false;
	paintWrapper.container.addEventListener('touchmove', paintLayerTouchMoveListener);
	if (clearedPaintWrapper) {
		persistPaintProperties(clearedPaintWrapper.view, paintWrapper.view);
	}
	win.add(paintWrapper.container);
}

function createView() {
	var container = Ti.UI.createScrollView({
		top: 0, left: 0,
		contentHeight: '1', contentWidth: '1',
		verticalBounce: false, horizontalBounce: false,
		disableBounce: true,
		scrollingEnabled: false,
		zIndex: 1
	});
	var maxDimension = Math.max(Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth);
	var view = Paint.createPaintView({
		width: maxDimension, height: maxDimension,
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
	didPaint = true;
	paintWrapper.container.removeEventListener('touchmove', paintLayerTouchMoveListener);
	E.fireEvent('paint:first-draw');
}

function saveSuccess() {
	T.show('Your drawing was saved to the photo gallery!', win, 2000);
}

function saveFailure(err) {
	Ti.UI.createAlertDialog({
		title: 'Failure',
		message: 'We had some trouble saving it: ' + err + '.'
	}).show();
}
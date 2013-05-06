var U = require('lib/utils'),
	A = require('lib/animations'),
	S = require('data/settings');

var paintMin = 1, paintMax = 50;
var dragMin = 15, dragMax = 220;
var colorDragMin = 75, colorDragMax = 287;

var hues = [
	[255, 0, 0],
	[255, 0, 255],
	[0, 0, 255],
	[0, 255, 255],
	[0, 255, 0],
	[255, 255, 0],
	[255, 0, 0]
];

exports.createView = function(args, paintView, penDot, penDotShadow, listener) {
	var pickerMode;

	var strokeWeight = S.defaultPenWidth(),
		strokeColor = S.defaultPenColor(),
		defaultHueColor = S.defaultPenHueColor(),
		lastHueColor = S.defaultPenHueColor(),
		lastHueRatio = S.defaultPenStrokeHueRatio(),
		lastStrokeRatioX = S.defaultPenStrokeRatioX(),
		lastStrokeRatioY = S.defaultPenStrokeRatioY();
	/*
	 Color Picker.
	 */
	var colorPicker = Ti.UI.createView(U.def(args, {
		width: 353, height: 259,
		touchEnabled: false,
		opacity: 0,
		zIndex: 2
	}));
	var colorFill = Ti.UI.createView({
		backgroundColor: defaultHueColor,
		top: 20, right: 64, bottom: 20, left: 70,
		borderRadius: 3
	});
	colorPicker.add(colorFill);
	colorPicker.add(Ti.UI.createView({
		backgroundImage: '/images/colorPicker.png'
	}));

	var handles = {
		size: Ti.UI.createView({
			backgroundImage: '/images/handle.png',
			width: 25, height: 25,
			left: 25,
			top: 0,
			touchEnabled: false
		}),
		color: Ti.UI.createView({
			backgroundImage: '/images/handle.png',
			width: 25, height: 25,
			left: 150,
			top: 0,
			touchEnabled: false
		}),
		hue: Ti.UI.createView({
			backgroundImage: '/images/handle.png',
			width: 25, height: 25,
			left: 305,
			top: 0,
			touchEnabled: false
		})
	};

	function updateHandleTop(id, percent) {
		handles[id].top = dragMin + (1 - percent) * (dragMax - dragMin);
	}

	function updateHandleTopLeft(id, percentX, percentY) {
		handles[id].applyProperties({
			top: (dragMin + percentY * (dragMax - dragMin)),
			left: (colorDragMin + (1 - percentX) * (colorDragMax - colorDragMin - 8)) - 10
		});
	}

	updateHandleTop('size', strokeWeight / paintMax);

	function pickerStart(evt) {
		if (evt.x < 62) {
			pickerMode = 'size';
		}
		else if (evt.x < 295) {
			pickerMode = 'color';
		}
		else {
			pickerMode = 'hue';
		}
	}

	/**
	 * Note that the algorithm for the color and hue selection was created by me (Dawson Toth) for another project.
	 * @param evt
	 */
	function pickerMove(evt) {
		var percent, color;
		switch (pickerMode) {
			case 'size':
				percent = 1 - Math.min(Math.max(evt.y - dragMin, 0) / dragMax, 1);
				strokeWeight = Math.max(percent * paintMax, paintMin);
				invokeListener();
				penDot && penDot.applyProperties({ width: strokeWeight, height: strokeWeight });
				penDot && (penDot.borderRadius = strokeWeight / 2);
				penDotShadow && penDotShadow.applyProperties({ width: strokeWeight, height: strokeWeight });
				penDotShadow && (penDotShadow.borderRadius = strokeWeight / 2);
				paintView && paintView.strokeWidth(strokeWeight);
				updateHandleTop('size', percent);
				break;
			case 'color':
				var whiteRatio = 1 - Math.min(Math.max(evt.x - colorDragMin, 0) / (colorDragMax - colorDragMin), 1);
				var blackRatio = Math.min(Math.max(evt.y - dragMin, 0) / dragMax, 1);
				updateHandleTopLeft('color', whiteRatio, blackRatio);
				updateStrokeColor(whiteRatio, blackRatio);
				break;
			case 'hue':
				lastHueRatio = Math.min(Math.max(evt.y - dragMin, 0) / dragMax, 1);
				updateHandleTop('hue', 1 - lastHueRatio);
				lastHueColor = calculateHue(lastHueRatio);
				colorFill.backgroundColor = lastHueColor;
				updateStrokeColor(lastStrokeRatioX, lastStrokeRatioY);
				invokeListener();
				break;
		}
	}

	updateHandleTopLeft('color', lastStrokeRatioX, lastStrokeRatioY);
	updateHandleTop('hue', 1 - lastHueRatio);

	function updateStrokeColor(ratioX, ratioY) {
		lastStrokeRatioX = ratioX;
		lastStrokeRatioY = ratioY;
		strokeColor = calculateColor(ratioX, ratioY, lastHueColor);
		paintView && paintView.strokeColor(strokeColor);
		penDot && (penDot.backgroundColor = strokeColor);
		invokeListener();
	}

	function invokeListener() {
		listener && listener(strokeWeight, strokeColor, lastHueColor, lastHueRatio, lastStrokeRatioX, lastStrokeRatioY);
	}

	colorPicker.addEventListener('touchstart', pickerStart);
	colorPicker.addEventListener('touchmove', pickerMove);
	colorPicker.addEventListener('touchend', pickerMove);
	colorPicker.addEventListener('touchcancel', pickerMove);

	colorPicker.add(handles.size);
	colorPicker.add(handles.color);
	colorPicker.add(handles.hue);

	return colorPicker;
};

function calculateHue(ratio) {
	// Figure out how far along they clicked
	// Scale this to be an index in our mainColors array
	var scaledRatio = ratio * (hues.length - 1);
	// Floor it so that we have a real integer to work with as an index accessor
	var f = Math.min(Math.max(Math.floor(scaledRatio) | 0, 0), hues.length - 2);
	// Grab the fractional component of our original scaled ratio.
	var percent = scaledRatio - f;
	// We'll store our new faded color in this variable. But we have to put it together piece by piece first!
	var newColor = 0;
	// We will calculate the 3 parts of the color (red, green, and blue) in three different iterations below...
	for (var i = 0; i < 3; i++) {
		// Now, using the index we figured out earlier, calculate the faded value between the two pure colors
		// There's two math equations going on here:
		// 1) To fade between a and b by a ratio of r: a-(((a-b)*r)
		// 2) Next, to take our 0-255 value to the proper component of a HEX color, perform a bitwise shift 16, 8,
		//    or 0 digits
		newColor += hues[f][i] - ((hues[f][i] - hues[(f + 1)][i]) * percent) << (2 - i) * 8;
	}
	// By this point, we figured out our color! As an integer... so let's turn it to its HEX value!
	var color = newColor.toString(16);
	// And then let's pad the left of it with 0s...
	for (var j = color.length; j < 6; j++) {
		color = '0' + color;
	}
	// That wasn't so bad, now was it? (I may have cried when I finished programming this. MAY HAVE.)
	return '#' + color;
}

function calculateColor(whiteRatio, blackRatio, hue) {
	// The algorithm we will use here is very similar to what we use below in the "hue" function, so I
	// won't provide a step-by-step.
	var base = hue.substring(1);
	var splitColor = [];
	if (base.length == 3) {
		splitColor = [
			parseInt(base[0] + base[0], 16),
			parseInt(base[1] + base[1], 16),
			parseInt(base[2] + base[2], 16)
		];
	}
	else {
		splitColor = [
			parseInt(base[0] + base[1], 16),
			parseInt(base[2] + base[3], 16),
			parseInt(base[4] + base[5], 16)
		];
	}
	// Apply the white ratio to it. This will fade the rgb components closer to white.
	for (var i = 0; i < 3; i++) {
		splitColor[i] = 255 - ((255 - splitColor[i]) * (1 - whiteRatio));
	}
	// Apply the black ratio, and merge it in to an actual integer.
	var newColor = 0;
	for (var j = 0; j < 3; j++) {
		newColor += 0 - ((0 - splitColor[j]) * (1 - blackRatio)) << (2 - j) * 8;
	}
	// By this point, we figured out our color! As an integer... so let's turn it to its HEX value!
	var color = newColor.toString(16);
	// And then let's pad the left of it with 0s...
	for (var k = color.length; k < 6; k++) {
		color = '0' + color;
	}
	// Phew!
	return '#' + color;
}
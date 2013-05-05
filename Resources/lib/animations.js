/*
 State.
 */
var simplify = Ti.Platform.osname === 'mobileweb';
var currentFlashes = {};
const DEFAULT_FADE_LENGTH = 250;

/*
 Public API.
 */
exports.chainAnimateForever = chainAnimateForever;
exports.chainAnimate = chainAnimate;
exports.toggleFlashing = toggleFlashing;
exports.flash = flash;
exports.shake = shake;
exports.popOut = popOut;
exports.popIn = popIn;
exports.fade = fade;
exports.fadeOutAndRemove = fadeOutAndRemove;
exports.crossFade = crossFade;

/*
 Implementation.
 */
function crossFade(viewFadingOut, viewFadingIn, duration, callback) {
	if (simplify) {
		viewFadingOut && (viewFadingOut.opacity = 0);
		viewFadingIn && (viewFadingIn.opacity = 1);
		callback && callback();
		return;
	}

	if (viewFadingOut) {
		viewFadingOut.animate({
			opacity: 0,
			duration: duration || DEFAULT_FADE_LENGTH
		});
	}
	if (viewFadingIn) {
		viewFadingIn.animate({
			opacity: 1,
			duration: duration || DEFAULT_FADE_LENGTH
		});
	}
	if (callback) {
		setTimeout(callback, duration + DEFAULT_FADE_LENGTH);
	}
}

function fadeOutAndRemove(view, duration, callback, delay) {
	if (delay) {
		setTimeout(function() {
			fadeOutAndRemove(view, duration, callback);
			view = duration = callback = delay = null;
		}, delay);
		return;
	}
	if (view) {
		if (simplify) {
			view.opacity = 0;
			var parent = view.parent;
			parent && parent.remove(view);
			callback && callback();
			return;
		}
		view.animate({
			opacity: 0,
			duration: duration || DEFAULT_FADE_LENGTH
		}, function() {
			var parent = view.parent;
			parent && parent.remove(view);
			callback && callback();
			view = duration = callback = delay = null;
		});
	}
}

function fade(view, opacity, duration, delay, callback) {
	if (!view) {
		return;
	}
	if (simplify) {
		view.opacity = opacity || 0;
		callback && callback();
		return;
	}
	if (delay && delay > 0) {
		setTimeout(function() {
			view.animate({
				opacity: opacity || 0,
				duration: duration || DEFAULT_FADE_LENGTH
			});
			callback && callback();
			view = null;
		}, delay);
	} else {
		view.animate({
			opacity: opacity || 0,
			duration: duration || DEFAULT_FADE_LENGTH
		});
		callback && callback();
	}
}

function popIn(view, sourceCenter, dialogCenter, callback) {
	if (simplify) {
		callback && callback();
		return;
	}

	view.transform = (sourceCenter && dialogCenter)
		? Ti.UI.create2DMatrix().translate(sourceCenter.x - dialogCenter.x, sourceCenter.y - dialogCenter.y).scale(0.1, 0.1)
		: Ti.UI.create2DMatrix().scale(0, 0);

	var animate1 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().scale(1.1, 1.1),
		duration: DEFAULT_FADE_LENGTH
	});
	var animate2 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().scale(0.94, 0.94),
		duration: 100
	});
	var animate3 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix(),
		duration: 150
	});

	exports.chainAnimate(view, Ti.Platform.name === 'iPhone OS'
		? [ animate1, animate2, animate3 ] // iOS bounces when popping things in
		: [ animate3 ], callback); // Others just pops them straight to size.
}

function popOut(view, sourceCenter, dialogCenter) {
	if (simplify) {
		view.transform = Ti.UI.create2DMatrix().scale(0, 0);
		return;
	}
	view.animate(Ti.UI.createAnimation({
		transform: (sourceCenter && dialogCenter)
			? Ti.UI.create2DMatrix().translate(sourceCenter.x - dialogCenter.x, sourceCenter.y - dialogCenter.y).scale(0.1, 0.1)
			: Ti.UI.create2DMatrix().scale(0, 0),
		duration: 200
	}));
}

function shake(view, delay) {
	var shake1 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().translate(5, 0),
		duration: 100
	});
	var shake2 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().translate(-5, 0),
		duration: 100
	});
	var shake3 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().translate(5, 0),
		duration: 80
	});
	var shake4 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix().translate(-5, 0),
		duration: 100
	});
	var shake5 = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix(),
		duration: 100
	});
	if (delay) {
		setTimeout(function() {
			exports.chainAnimate(view, [ shake1, shake2, shake3, shake4, shake5 ]);
			view = shake1 = shake2 = shake3 = shake4 = shake5 = null;
		}, delay);
	}
	else {
		exports.chainAnimate(view, [ shake1, shake2, shake3, shake4, shake5 ]);
	}
}

function flash(view, delay, low, high) {
	var flash1 = Ti.UI.createAnimation({
		opacity: low === undefined ? 0.7 : low,
		duration: 100
	});
	var flash2 = Ti.UI.createAnimation({
		opacity: high === undefined ? 1 : high,
		duration: 100
	});
	var flash3 = Ti.UI.createAnimation({
		opacity: low === undefined ? 0.7 : low,
		duration: 100
	});
	var flash4 = Ti.UI.createAnimation({
		opacity: high === undefined ? 1 : high,
		duration: 100
	});
	if (delay) {
		setTimeout(function() {
			exports.chainAnimate(view, [ flash1, flash2, flash3, flash4 ]);
			view = flash1 = flash2 = flash3 = flash4 = null;
		}, delay);
	}
	else {
		return exports.chainAnimate(view, [ flash1, flash2, flash3, flash4 ]);
	}
}

function toggleFlashing(on, id, view) {
	if (on) {
		currentFlashes[id] = setInterval(function() {
			exports.flash(view);
		}, 1000);
	}
	else {
		clearInterval(currentFlashes[id]);
	}
}

function chainAnimate(view, animations, callback) {
	var animation;

	function step() {
		if (animation) {
			animation.removeEventListener('complete', step);
			animation = null;
		}
		if (animations.length == 0) {
			callback && callback();
			view = animations = callback = step = null;
			return;
		}
		animation = animations.shift();
		animation.addEventListener('complete', step);
		view.animate(animation);
	}

	step();

	return function stop() {
		animation && animation.removeEventListener('complete', step);
		animation = null;
	}
}

function chainAnimateForever(view, animations) {
	for (var i = 0, l = animations.length; i < l; i++) {
		animations[i].addEventListener('complete', step);
	}

	var currentStep = 0;

	function step() {
		if (currentStep === -1) {
			return;
		}
		if (currentStep === animations.length) {
			currentStep = 0;
		}
		view.animate(animations[currentStep]);
		currentStep += 1;
	}

	function stop() {
		for (var i = 0, l = animations.length; i < l; i++) {
			animations[i].removeEventListener('complete', step);
		}

		view = animations = step = stop = currentStep = null;
	}

	step();

	return stop;
}
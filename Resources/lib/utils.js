exports.android = Ti.Platform.name === 'android';
exports.ios = Ti.Platform.name === 'iPhone OS';
exports.ipod = Ti.Platform.model.indexOf('iPod') >= 0;
exports.iphone = Ti.Platform.model.indexOf('iPhone') >= 0;
exports.ipad = Ti.Platform.osname === 'ipad';
exports.iosRetina = Ti.Platform.name === 'iPhone OS' && Ti.Platform.displayCaps.density == 'high';
exports.mobileweb = Ti.Platform.osname === 'mobileweb';
exports.tablet = Math.min(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight) > 500;

exports.dbg = false;

exports.def = function(dict, defs) {
	dict = dict || {};
	// This implementation is a bit simplistic, but that's alright for now. Light and fast.
	for (var key in defs) {
		if (!defs.hasOwnProperty(key)) {
			continue;
		}
		if (dict[key] === undefined || dict[key] === 'undefined') {
			dict[key] = defs[key];
		}
	}
	return dict;
};

/**
 * Throws an exception if an argument has not been provided, or is not of the expected type.
 * @param name The string display name of the argument (such as 'data')
 * @param arg The actual provided argument
 * @param type The string value of the expected argument type (such as 'object' or 'string').
 */
exports.requireArgument = function(name, arg, type) {
	if (arg === undefined) {
		throw 'Argument ' + name + ' was not provided!';
	}
	if (typeof(arg) != type) {
		throw 'Argument ' + name + ' was an unexpected type! Expected: ' + type + ', Received: ' + typeof(arg);
	}
};

exports.dpToPX = function(val) {
	if (!exports.android) {
		return val;
	}
	return val * Ti.Platform.displayCaps.dpi / 160;
};
exports.pxToDP = function(val) {
	if (!exports.android) {
		return val;
	}
	return val / Ti.Platform.displayCaps.dpi * 160;
};
exports.pointPXToDP = function(pt) {
	if (!exports.android) {
		return pt;
	}
	return { x: exports.pxToDP(pt.x), y: exports.pxToDP(pt.y) };
};

exports.currySingleUse = function(obj, methodName) {
	var args = Array.prototype.slice.call(arguments, 2);
	return function() {
		obj[methodName].apply(obj, args);
		obj = methodName = args = null;
	};
};

exports.gcd = function gcd(a, b) {
	if (b == 0) {
		return a;
	} else {
		return gcd(b, a % b);
	}
};

exports.formatNumber = function(value) {
	value = String(value);
	var x = value.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

exports.formatCurrency = function(amount) {
	return String.formatCurrency(Number(amount));
};

exports.confirm = function(args) {
	var alertDialog = Ti.UI.createAlertDialog({
		title: args.title || L('Confirm', 'Confirm)'),
		message: args.message || L('Are you sure?', 'Are you sure?'),
		buttonNames: [
			args.no || L('No', 'No'),
			args.yes || L('Yes', 'Yes')
		],
		cancel: 0
	});
	alertDialog.addEventListener('click', function(evt) {
		if (evt.index) {
			args.callback && args.callback(args.evt || {});
		}
		args = null;
	});
	alertDialog.show();
};

/**
 * Returns a function that will only be executed after being called N times.
 * Taken from underscore.js.
 */
exports.after = function(times, func) {
	if (times <= 0) {
		return func();
	}
	return function() {
		if (--times < 1) {
			return func.apply(this, arguments);
		}
	};
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be
 * called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param func
 * @param wait
 * @param immediate
 * @return {Function}
 */
exports.debounce = function(func, wait, immediate) {
	var timeout = null;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};
		if (immediate && !timeout) {
			func.apply(context, args);
		}
		timeout !== null && clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

exports.curryParallel = function(count, callback) {
	var results = [];

	if (count === 0) {
		callback(results.length ? results : undefined);
		return function() {
		};
	}

	return function(result) {
		if (result) {
			results.push(result);
		}
		count -= 1;
		if (count <= 0) {
			callback && callback(results.length ? results : undefined);
			results = callback = null;
		}
	};
};
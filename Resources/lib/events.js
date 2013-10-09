var listeners = {};

exports.addEventListener = function(name, func) {
	if (!listeners[name]) {
		listeners[name] = [];
	}
	listeners[name].push(func);
	return exports;
};

exports.hasEventListeners = function(name) {
	return !!listeners[name];
};

exports.clearEventListeners = function() {
	listeners = {};
	return exports;
};

exports.fireEvent = function(name, data) {
	if (listeners[name]) {
		var args = Array.prototype.slice.call(arguments, 1);
		for (var l in listeners[name]) {
			listeners[name][l].apply(this, args);
		}
	}
	return exports;
};

exports.curryFireEvent = function(name, data) {
	var args = arguments;
	return function() {
		return exports.fireEvent.apply(this, args);
	};
};

exports.removeEventListener = function(name, func) {
	if (listeners[name]) {
		for (var l in listeners[name]) {
			if (listeners[name][l] === func) {
				listeners[name].splice(l, 1);
				break;
			}
		}
	}
	return exports;
};
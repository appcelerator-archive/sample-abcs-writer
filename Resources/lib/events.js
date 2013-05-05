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
		for (var l in listeners[name]) {
			listeners[name][l](data);
		}
	}
	return exports;
};

exports.curryFireEvent = function(name, data) {
	return function() {
		return exports.fireEvent(name, data);
	}
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
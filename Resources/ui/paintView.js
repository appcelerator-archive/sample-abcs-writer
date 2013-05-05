var Paint = require('ti.paint');

exports.createView = function() {
	return Paint.createPaintView({
		top: 44, right: 0, bottom: 38, left: 0,
		strokeColor: '#00ff00', strokeWidth: 10,
		eraseMode: false
	});
};
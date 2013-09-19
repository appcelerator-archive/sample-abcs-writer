var A = require('lib/animations');

var $ = {};

exports.show = function(text, parent, time) {
	clean();

	var view = $.last = Ti.UI.createView({
		opacity: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderRadius: 6,
		layout: 'vertical',
		width: 280, height: Ti.UI.SIZE
	});
	view.add(Ti.UI.createLabel({
		top: 10, right: 10, bottom: 10, left: 10,
		text: text, textAlign: 'center',
		font: { fontSize: 12, fontWeight: 'bold' },
		height: Ti.UI.SIZE,
		color: '#fff', shadowColor: '#000', shadowOffset: { x: 0, y: -1 }
	}));
	parent.add(view);

	A.fade(view, 1);
	A.fadeOutAndRemove(view, null, null, time || 3000);
};

exports.clean = clean;
function clean() {
	if ($.last) {
		var lastParent = $.last.parent;
		lastParent && lastParent.remove($.last);
		$.last = null;
	}
	$ = exports.$ = {};
}
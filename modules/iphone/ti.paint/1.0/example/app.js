
/*
 * Creates a paint view, and allows you to change colors.
 */

// open a single window
var window = Ti.UI.createWindow({
  backgroundColor:'white'
});

Titanium.Painter = require('ti.paint');
var painter = Titanium.Painter.createView({
	top:10,
	left:10,
	right:10,
	height:350,
});
window.add(painter);

function f(e) {
	painter.strokeColor = e.source.backgroundColor;
}

var redView = Ti.UI.createView({
	bottom:20,
	left:20,
	width:40,
	height:40,
	backgroundColor:'red'
});
window.add(redView);
redView.addEventListener('touchend', f);

var blueView = Ti.UI.createView({
	bottom:20,
	width:40,
	height:40,
	backgroundColor:'blue'
});
window.add(blueView);
blueView.addEventListener('touchend', f);

var blackView = Ti.UI.createView({
	bottom:20,
	right:20,
	width:40,
	height:40,
	backgroundColor:'black'
});
window.add(blackView);
blackView.addEventListener('touchend', f);

window.open();

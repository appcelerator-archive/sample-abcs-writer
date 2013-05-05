/**
 * This is a quick example of how to use the paint module in a real world application.
 */
var Paint = require('ti.paint');

var img = '';
if (Ti.Platform.osname == 'ipad') {
	img = '-72';
}

var win = Ti.UI.createWindow({
	backgroundImage: 'Images/Background' + img + '.jpg'
});
var paintView = Paint.createPaintView({
	top: 44, right: 0, bottom: 38, left: 0,
	strokeColor: '#00ff00', strokeWidth: 10,
	eraseMode: false
});

Ti.include('colorPicker.js');
Ti.include('topBar.js', 'paintView.js', 'bottomBar.js');

win.open();
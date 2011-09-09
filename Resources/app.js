/**
 * This is a quick example of how to use the paint module in a real world application.
 */
Titanium.Paint = Ti.Paint = require('ti.paint');

var u = 0, img = '';
if (Ti.Platform.osname == 'ipad')
    img = '@ipad';
else if (Ti.Platform.osname == 'android')
    u = 'dp';

var win = Ti.UI.createWindow({
    backgroundImage: 'Images/Background' + img + '.jpg'
});
var paintView = Ti.Paint.createPaintView({
    top: 44 + u, right: 0, bottom: 38 + u, left: 0,
    strokeColor: '#00ff00', strokeWidth: 10,
    eraseMode: false
});

Ti.include('colorPicker.js');
Ti.include('topBar.js', 'paintView.js', 'bottomBar.js');

win.open();
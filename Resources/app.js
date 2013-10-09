/**
 * This is a quick example of how to use the paint module in a real world application.
 */
var U = require('lib/utils');

var win = Ti.UI.createWindow({
	backgroundImage: U.ipad ? '/images/background-72.jpg' : '/images/background.jpg',
	fullscreen: true
});

require('ui/body').addToView(win);
require('ui/paintView').init();
require('ui/paintView').addToView(win);
require('ui/top.lower').addToView(win);
require('ui/top.upper').addToView(win);

win.open();
/**
 * This is a quick example of how to use the paint module in a real world application.
 */
var U = require('lib/utils');

var win = Ti.UI.createWindow({ backgroundImage: U.ipad ? '/Images/Background-72.jpg' : '/Images/Background.jpg' });

require('ui/paintView').init();
require('ui/top').addToView(win);
require('ui/body').addToView(win);
require('ui/paintView').addToView(win);
require('ui/bottom').addToView(win);

win.open();
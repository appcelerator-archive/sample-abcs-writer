/**
 * This is a quick example of how to use the paint module in a real world application.
 */
var U = require('lib/utils');

var win = Ti.UI.createWindow({ backgroundImage: U.ipad ? '/Images/Background-72.jpg' : '/Images/Background.jpg' });

var paintView = require('ui/paintView').createView();
require('ui/top').addToView(win, paintView);
require('ui/body').addToView(win);
win.add(paintView);
require('ui/bottom').addToView(win);

win.open();
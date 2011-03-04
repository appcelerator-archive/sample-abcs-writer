/**
 * This is a quick example of how to use the paint module in a real world application.
 *
 * This code is organized in three parts -- defining our module and UI object, then event handlers,
 * then adding stuff to the UI.
 *
 * Note that we're using the "Redux" library, which makes our syntax a bit simpler.
 * https://github.com/dawsontoth/Appcelerator-Titanium-Redux
 */
Ti.include('redux.js');
includeRJSS('Styles/Common.rjss');

/**
 * Tell Titanium what modules to include and define our global UI object.
 */
Titanium.Painter = require('ti.paint');
// this next line lets us do new Canvas() instead of Titanium.Painter.createView() -- the end result is identical
redux.fn.addNaturalConstructor(this, Titanium.Painter, 'View', 'Painter');
// and now make a ui object for us to store elements in so the event handlers can get at them
var ui = {
    paint: {},
    home: {}
};
// note: this next statement is necessary because we use redux; it lets us explicitly say which modules
// should be included in production builds of our app.
var used = [Ti.UI.createLabel, Ti.UI.createAlertDialog, Ti.UI.createButton, Ti.UI.createImageView,
    Ti.UI.createAnimation, Ti.UI.createWindow, Ti.UI.createScrollView];

/**
 * Define our event handlers; these are all driven off of UI interactions.
 */
var events = {
    paint: {
        /**
         * When the user touches clear, ask them if they are sure they want to clear. If they are, clear the drawing.
         */
        clickClear: function() {
            var confirm = new AlertDialog({
                title: 'Clear Drawing',
                message: 'Are you sure?',
                buttonNames: ['Yes','No'],
                cancel: 1
            });
            confirm.show();
            $(confirm).click(function(evt) {
                if (evt.index != confirm.cancel) {
                    ui.paint.painter.dirty = false;
                    ui.paint.painter.clear();
                }
            });
        },
        /**
         * When the user touches save, save it to the user's gallery and show them a message to tell them if we succeeded
         * or not.
         */
        clickSave: function() {
            Ti.Media.saveToPhotoGallery(ui.paint.painter.toImage(), {
                success: function() {
                    alert('Success! Your drawing was saved to the photo gallery.');
                },
                failure: function(evt) {
                    // TODO: probably don't want to show the error here... analytics to the rescue?
                    alert('Oops! We couldn\'t save. ' + evt);
                }
            });
        },
        /**
         * When the user touches the pointy part of the pencil, show size options. When they touch a size option, change
         * the painter size and hide the size options.
         * @param evt
         */
        clickSize: function(evt) {
            var button = evt.source;
            // toggle our opacity
            button.opacity = button.opacity == 1 ? 0.05 : 1;
            // they picked a new color
            if (button.opacity != 1) {
                var ratio = evt.x / button.width;
                if (ratio < 0.37) {
                    ui.paint.painter.strokeWidth = 32;
                    button.backgroundImage = button.backgroundImage.split('-')[0] + '-3.png';
                }
                else if (ratio < 0.55) {
                    ui.paint.painter.strokeWidth = 12;
                    button.backgroundImage = button.backgroundImage.split('-')[0] + '-2.png';
                }
                else {
                    ui.paint.painter.strokeWidth = 2;
                    button.backgroundImage = button.backgroundImage.split('-')[0] + '-1.png';
                }
            }
        },
        /**
         * When the user touches the middle of the pencil, show color options. When they touch a color option, change
         * the painter color and hide the color options.
         * @param evt
         */
        clickColor: function(evt) {
            var button = evt.source;
            // toggle our opacity
            button.opacity = button.opacity == 1 ? 0.05 : 1;
            // they picked a new color
            if (button.opacity != 1) {
                // we have four sections of our button; figure out which they touched
                var options = ['black', 'red', 'green', 'blue'];
                for (var i = 0, quarter = button.width / 4; i < 4; i++) {
                    if (evt.x < quarter * (i + 1)) {
                        ui.paint.painter.strokeColor = options[i];
                        button.backgroundImage = button.backgroundImage.split('-')[0] + '-' + (i + 1) + '.png';
                        break;
                    }
                }
            }
        },
        /**
         * Toggle whether or not the ABC Guides are on when the user touches the ABC Switch
         */
        clickABC: function() {
            ui.paint.abcContainer.isOn = !ui.paint.abcContainer.isOn;
            ui.paint.abcContainer.sync();
        },
        /**
         * If the user "scrolls" the ON < ABC > OFF switch, 0.5 second delay snap it to the closest value.
         */
        scrollABC: function() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function() {
                ui.paint.abcContainer.isOn = ui.paint.abcContainer.contentOffset.x < 32;
                ui.paint.abcContainer.sync();
            }, 500);
        },
        /**
         * Fired after the user touches the painter (draws something). This lets us know if we should ask the user to
         * clear the painter or not when they change letters.
         */
        touchEndPainter: function() {
            ui.paint.painter.dirty = true;
        },
        /**
         * Utility event that asks the user if they want to clear their drawing after changing letters.
         */
        changedLetters: function() {
            if (!ui.paint.painter.dirty) {
                return;
            }
            var confirm = new AlertDialog({
                title: 'Clear Drawing',
                message: 'You changed letters. Do you want to clear your drawing, too?',
                buttonNames: ['Yes','No'],
                cancel: 1
            });
            confirm.show();
            $(confirm).click(function(evt) {
                if (evt.index != confirm.cancel) {
                    ui.paint.painter.dirty = false;
                    ui.paint.painter.clear();
                }
            });
        },
        /**
         * Fires when the user starts or moves a touch on the ABC Key (the letters at the bottom of the screen). Updates
         * our letter index and marks the ABC Guides as dirty so that we can scroll the newly selected letter to be visible.
         * @param evt
         */
        touchABCKey: function(evt) {
            // calculate an index, 0-25, for the letter they clicked on
            var newIndex = parseInt(evt.x / evt.source.width * 26, 0);
            if (newIndex < 0) {
                newIndex = 0;
            }
            else if (newIndex > 25) {
                newIndex = 25;
            }
            ui.paint.abcGuides.index = newIndex;
            ui.paint.abcGuides.changed = true;
        },
        /**
         * Fires when the user stops touching the ABC Key (the letters are the bottom of the screen). Gives the user the
         * option to clear the existing drawing.
         */
        touchendABCKey: function() {
            events.paint.changedLetters();
        },
        /**
         * Fires when the user touches the left arrow to scroll to the previous letter.
         */
        clickABCLeft: function() {
            ui.paint.abcGuides.index -= 1;
            if (ui.paint.abcGuides.index < 0) {
                ui.paint.abcGuides.index = 25;
            }
            ui.paint.abcGuides.sync();
            events.paint.changedLetters();
        },
        /**
         * Fired when the user touches the right arrow to scroll to the next letter.
         */
        clickABCRight: function() {
            ui.paint.abcGuides.index += 1;
            if (ui.paint.abcGuides.index > 25) {
                ui.paint.abcGuides.index = 0;
            }
            ui.paint.abcGuides.sync();
            events.paint.changedLetters();
        }
    }
};
/**
 * Define our views.
 */
var view = {
    /**
     * Shows the home window to the user, setting up the UI if it hasn't been set up before.
     */
    home: function() {
        alert('This hasn\'t been implemented yet. \n\n Fork the code over at: https://github.com/appcelerator-titans/abcsWriter and make it work.');
    },
    /**
     * Shows the paint window to the user, setting up the UI if it hasn't been set up before.
     */
    paint: function() {
        // have we already called paint?
        if (ui.paint.win) {
            // show the existing window then!
            ui.paint.win.show();
            return;
        }
        // no, we haven't called paint before, so let's define the window and add our elements...
        var win = ui.paint.win = new Window({ id: 'Paint' });

        // animations we'll use
        var fadeIn = new Animation({ id: 'FadeIn' });
        var fadeOut = new Animation({ id: 'FadeOut' });
        var fadeLeft = new Animation({ id: 'FadeLeft' });

        // ABCs background
        win.add(ui.paint.abcTracer = new ScrollView({ id: 'ABCTracer' }));
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0, length = letters.length; i < length; i++) {
            ui.paint.abcTracer.add(new Label({ id: 'ABCBigLetter', text: letters[i] }));
        }
        win.add(ui.paint.abcGuides = new ImageView({ id: 'ABCGuides', index: 0 }));

        // painter
        win.add(ui.paint.painter = new Painter());
        $(ui.paint.painter).touchend(events.paint.touchEndPainter);

        // buttons
        win.add(ui.paint.home = new Button({ id: 'Home' }));
        win.add(ui.paint.clear = new Button({ id: 'Clear' }));
        win.add(ui.paint.save = new Button({ id: 'Save' }));
        $(ui.paint.home).click(view.home);
        $(ui.paint.clear).click(events.paint.clickClear);
        $(ui.paint.save).click(events.paint.clickSave);

        // pencil (stroke size, color, eraser)
        win.add(new ImageView({ id: 'Pencil' }));
        win.add(ui.paint.size = new Button({ id: 'Size' }));
        win.add(ui.paint.color = new Button({ id: 'Color' }));
        win.add(ui.paint.eraser = new Button({ id: 'Eraser' }));
        $(ui.paint.size).click(events.paint.clickSize);
        $(ui.paint.color).click(events.paint.clickColor);
        $(ui.paint.eraser).click(events.paint.clickClear);

        // ABCs
        win.add(new ImageView({ id: 'ABCShadow' }));
        win.add(ui.paint.abcContainer = new ScrollView({ id: 'ABCContainer', isOn: true }));
        win.add(ui.paint.abcTab = new ImageView({ id: 'ABCTab' }));
        win.add(ui.paint.abcKey = new Label({ id: 'ABCKey' }));
        win.add(ui.paint.abcLeft = new Button({ id: 'ABCLeft' }));
        win.add(ui.paint.abcRight = new Button({ id: 'ABCRight' }));
        ui.paint.abcContainer.add(new ImageView({ id: 'ABC' }));
        ui.paint.abcContainer.sync = function() {
            // adjust the on-off switch scroll position
            this.scrollTo(this.isOn ? 0 : 63, 0);
            // show or hide the ABC related UI elements
            var animation = this.isOn ? fadeIn : fadeOut;
            ui.paint.abcGuides.animate(animation);
            ui.paint.abcTracer.animate(animation);
            ui.paint.abcLeft.animate(animation);
            ui.paint.abcRight.animate(animation);
            ui.paint.abcTab.animate(animation);
            ui.paint.abcKey.animate(animation);
        };
        var interval = setInterval(function() {
            if (!ui.paint.abcGuides.changed) {
                return;
            }
            ui.paint.abcGuides.changed = false;
            ui.paint.abcGuides.sync();
        }, 500);
        ui.paint.abcGuides.sync = function() {
            var index = ui.paint.abcGuides.index;
            // move the tab to it
            fadeLeft.left =  209 + index * 571 / 25;
            ui.paint.abcTab.animate(fadeLeft);
            // scroll our big letter to it as well
            ui.paint.abcTracer.scrollTo(index * 1024, 0);
        };
        $(ui.paint.abcKey)
                .touchstart(events.paint.touchABCKey)
                .touchmove(events.paint.touchABCKey)
                .touchend(events.paint.touchendABCKey);
        $(ui.paint.abcLeft).click(events.paint.clickABCLeft);
        $(ui.paint.abcRight).click(events.paint.clickABCRight);
        $(ui.paint.abcContainer)
                .click(events.paint.clickABC)
                .scroll(events.paint.scrollABC);

        win.open();
    }
};

/**
 * Now initialize our app, and get things going!
 */
view.paint();
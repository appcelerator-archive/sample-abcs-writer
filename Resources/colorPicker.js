/**
 * Shows a really simple color picker to the user.
 * @param args
 */
function showColorPicker(args) {
    var overlay = Ti.UI.createView({
        backgroundColor: '#fff'
    });

    /**
     * Our images show 7 main colors to the user, fading between each. When the user drags on the top "mainColor"
     * palette, we will fade the primary color of the lower mix between these values.
     */
    var mainColors = [
        [255, 0, 0],
        [255, 0, 255],
        [0, 0, 255],
        [0, 255, 255],
        [0, 255, 0],
        [255, 255, 0],
        [255, 0, 0]
    ];
    var mainColor = Ti.UI.createView({
        backgroundImage: 'Images/Tile-Colors.png',
        top: 0, right: 0, left: 0,
        height: 40
    });

    function updateColors(evt) {
        // Figure out how far along they clicked
        var ratio = evt.x / evt.source.size.width;
        // Scale this to be an index in our mainColors array
        var scaledRatio = ratio * (mainColors.length - 1);
        // Floor it so that we have a real integer to work with as an index accessor
        var f = parseInt(Math.floor(scaledRatio), 10);
        // Grab the fractional component of our original scaled ratio.
        var percent = scaledRatio - f;
        // We'll store our new faded color in this variable. But we have to put it together piece by piece first!
        var newColor = 0;
        // We will calculate the 3 parts of the color (red, green, and blue) in three different iterations below...
        for (var i = 0; i < 3; i++) {
            // Now, using the index we figured out earlier, calculate the faded value between the two pure colors
            // There's two math equations going on here:
            // 1) To fade between a and b by a ratio of r: a-(((a-b)*r)
            // 2) Next, to take our 0-255 value to the proper component of a HEX color, perform a bitwise shift 16, 8,
            //    or 0 digits
            newColor += mainColors[f][i] - ((mainColors[f][i] - mainColors[(f + 1)][i]) * percent) << (2 - i) * 8;
        }
        // By this point, we figured out our color! As an integer... so let's turn it to its HEX value!
        var color = newColor.toString(16);
        // And then let's pad the left of it with 0s...
        for (var j = color.length; j < 6; j++) {
            color = '0' + color;
        }
        // And shove it in to the color mixers background color!
        colorMix.backgroundColor = '#' + color;
        // That wasn't so bad, now was it? (I may have cried when I finished programming this. MAY HAVE.)
    }

    mainColor.addEventListener('click', updateColors);
    mainColor.addEventListener('touchmove', updateColors);
    overlay.add(mainColor);

    /**
     * This color mix is our base color. We'll put a white and black gradient above it to give the user
     * lots of color options.
     */
    var colorMix = Ti.UI.createView({
        backgroundColor: args.initial,
        top: 40, right: 0, bottom: 40, left: 0
    });
    overlay.add(colorMix);

    /**
     * As promised, here's our white gradient! It is directly over the color mix, but it fades from 100% white
     * to 0% white.
     */
    var whiteGradient = Ti.UI.createView({
        backgroundImage: 'Images/Tile-White.png',
        top: 40, right: 0, bottom: 40, left: 0
    });
    overlay.add(whiteGradient);

    /**
     * Now here is the same thing as the white gradient, except it's black.
     */
    var blackGradient = Ti.UI.createView({
        backgroundImage: 'Images/Tile-Black.png',
        top: 40, right: 0, bottom: 40, left: 0
    });
    /**
     * Because the black gradient is top most, we're going to attach our click event to it. We'll use it to figure out
     * when the user clicks on a color.
     */
    blackGradient.addEventListener('click', function (evt) {
        // The algorithm we will use here is very similar to what we used above in the "updateColors" function, so I
        // won't provide a step-by-step.
        var whiteRatio = 1 - (evt.x / evt.source.size.width);
        var blackRatio = evt.y / evt.source.size.height;
        var base = colorMix.backgroundColor.substring(1);
        var splitColor = [];
        if (base.length == 3) {
            splitColor = [
                parseInt(base[0] + base[0], 16),
                parseInt(base[1] + base[1], 16),
                parseInt(base[2] + base[2], 16)
            ];
        }
        else {
            splitColor = [
                parseInt(base[0] + base[1], 16),
                parseInt(base[2] + base[3], 16),
                parseInt(base[4] + base[5], 16)
            ];
        }
        // First, apply the white ratio to it. This will fade the rgb components closer to white.
        for (var i = 0; i < 3; i++) {
            splitColor[i] = 255 - ((255 - splitColor[i]) * (1 - whiteRatio));
        }
        // Now apply the black ratio, and merge it in to an actual integer.
        var newColor = 0;
        for (var j = 0; j < 3; j++) {
            newColor += 0 - ((0 - splitColor[j]) * (1 - blackRatio)) << (2 - j) * 8;
        }
        // By this point, we figured out our color! As an integer... so let's turn it to its HEX value!
        var color = newColor.toString(16);
        // And then let's pad the left of it with 0s...
        for (var k = color.length; k < 6; k++) {
            color = '0' + color;
        }
        win.remove(overlay);
        args.success('#' + color);
    });
    overlay.add(blackGradient);

    var close = Ti.UI.createButton({
        title: 'Cancel',
        right: 0, bottom: 0, left: 0,
        backgroundColor: '#777', color: '#222', style: 0,
        height: 40
    });
    close.addEventListener('click', function () {
        win.remove(overlay);
    });
    overlay.add(close);

    win.add(overlay);
}
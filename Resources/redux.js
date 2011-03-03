/*!
* Appcelerator Redux v8 by Dawson Toth
* http://tothsolutions.com/
*
* NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/**
 * Provide a central context for dealing with elements and configuring redux.
 */
var redux = function (selector) {
    return new redux.fn.init(selector);
};

(function(redux, context) {

    /**
     * Create shorthand for commonly used functions.
     */
    context.info = context.info || function(message) { Ti.API.info(message); };
    context.error = context.error || function(message) { Ti.API.error(message); };
    context.warn = context.warn || function(message) { Ti.API.warn(message); };
    context.log = context.log || function(message) { Ti.API.log(message); };
    context.include = context.include || function(files) { redux.fn.include(files); };
    context.inc = context.inc || function(files) { redux.fn.include(files); };
    context.currentWindow = context.currentWindow || function() { return Ti.UI.currentWindow; };
    context.currentTab = context.currentTab || function() { return Ti.UI.currentTab; };
    context.win = context.win || context.currentWindow;
    context.tab = context.tab || context.currentTab;

    /*
     * Include the json2.js JSON definition, because Titanium's Android JSON function doesn't stringify arrays properly as of 1.4.2.
     *
     * http://www.JSON.org/json2.js
     * 2010-11-17
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     * See http://www.JSON.org/js.html
     */
    redux.JSON={};
    (function() {
        function l(b) {return b<10?"0"+b:b;}
        function o(b) {p.lastIndex=0;return p.test(b)?'"'+b.replace(p, function(f) {var c=r[f];return typeof c==="string"?c:"\\u"+("0000"+f.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+b+'"';}
        function m(b,f) {var c,d,g,j,i=h,e,a=f[b]; if(a&&typeof a==="object"&&typeof a.toJSON==="function") { a=a.toJSON(b); } if(typeof k==="function") { a=k.call(f,b,a);} switch(typeof a) { case "string": return o(a); case "number": return isFinite(a)?String(a):"null"; case "boolean": case "null": return String(a); case "object": if(!a) { return"null"; } h+=n; e=[]; if(Object.prototype.toString.apply(a)==="[object Array]") { j=a.length; for(c=0;c<j;c+=1) { e[c]=m(c,a)||"null"; } g=e.length===0?"[]":h?"[\n"+h+e.join(",\n"+h)+"\n"+i+"]":"["+e.join(",")+"]"; h=i; return g; } if(k&&typeof k==="object") { j=k.length; for(c=0;c<j;c+=1) { d=k[c]; if(typeof d==="string") { g=m(d,a); if(g) { e.push(o(d)+(h?": ":":")+g); } } } } else { for(d in a) { if(Object.hasOwnProperty.call(a,d)) { g=m(d,a); if(g) { e.push(o(d)+(h?": ":":")+g); } } } } g=e.length===0?"{}":h?"{\n"+h+e.join(",\n"+h)+"\n"+i+"}":"{"+e.join(",")+"}"; h=i; return g; } }
        if(typeof Date.prototype.toJSON!=="function") { Date.prototype.toJSON= function() { return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+l(this.getUTCMonth()+1)+"-"+l(this.getUTCDate())+"T"+l(this.getUTCHours())+":"+l(this.getUTCMinutes())+":"+l(this.getUTCSeconds())+"Z":null; }; String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON= function() { return this.valueOf();}; }
        var q=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,p=/[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,h,n,r={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},k;
        redux.JSON.stringify= function(b,f,c) { var d; n=h=""; if(typeof c==="number") { for(d=0;d<c;d+=1) { n+=" "; } } else if(typeof c==="string") { n=c; } if((k=f)&&typeof f!=="function"&&(typeof f!=="object"||typeof f.length!=="number")) {throw Error("JSON.stringify"); } return m("",{"":b}); };
        redux.JSON.parse= function(b,f) { function c(g,j) { var i,e,a=g[j]; if(a&&typeof a==="object") { for(i in a) { if(Object.hasOwnProperty.call(a,i)) { e=c(a,i); if(e!==undefined) { a[i]=e; } else { delete a[i]; } } } } return f.call(g,j,a); } var d; b=String(b); q.lastIndex=0; if(q.test(b)) { b=b.replace(q, function(g) { return"\\u"+("0000"+g.charCodeAt(0).toString(16)).slice(-4); }); } if(/^[\],:{}\s]*$/.test(b.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))) { d=eval("("+b+")"); return typeof f==="function"?c({"":d},""):d; }throw new SyntaxError("JSON.parse"); };
    })();
    /**
     * Tracks and stores various data for redux, like events, elements, and included files.
     */
    redux.data = {
        events: [
        'beforeload', 'blur', 'change', 'click', 'close', 'complete', 'dblclick', 'delete', 'doubletap',
        'error', 'focus', 'load', 'move', 'open', 'return', 'scroll', 'scrollEnd', 'selected', 'singletap',
        'swipe', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'twofingertap'
        ],
        types: {
            Contacts: [
            'Group', 'Person'
            ],
            Facebook: [
            'LoginButton'
            ],
            Filesystem: [
            'File', 'TempDirectory', 'TempFile'
            ],
            Media: [
            'AudioPlayer', 'AudioRecorder', 'Item', 'MusicPlayer', 'Sound', 'VideoPlayer'
            ],
            Network: [
            'BonjourBrowser', 'BonjourService', 'HTTPClient', 'TCPSocket'
            ],
            Platform: [
            'UUID'
            ],
            UI: [
            '2DMatrix', '3DMatrix', 'ActivityIndicator', 'AlertDialog', 'Animation', 'Button',
            'ButtonBar', 'CoverFlowView', 'DashboardItem', 'DashboardView', 'EmailDialog',
            'ImageView', 'Label', 'OptionDialog', 'Picker', 'PickerColumn', 'PickerRow',
            'ProgressBar', 'ScrollView', 'ScrollableView', 'SearchBar', 'Slider', 'Switch',
            'Tab', 'TabGroup', 'TabbedBar', 'TableView', 'TableViewRow', 'TableViewSection',
            'TextArea', 'TextField', 'Toolbar', 'View', 'WebView', 'Window'
            ]
        },
        maps: {
            byID: {},
            byClassName: {},
            byType: {}
        },
        defaults: {
            byID: {},
            byClassName: {},
            byType: {}
        },
        globalVariables: [
            'files', 'rjss', 'parsedrjss'
        ],
        global: {
            /* dynamically generated based on variables in Ti.App.redux */
        }
    };

    /**
     * Set up some global function getters and setters. We'll use these throughout the library.
     */
    function curryGlobalGet(prop) {
        return function () {
            return (Ti.App['redux-' + prop] && redux.JSON.parse(Ti.App['redux-' + prop])) || null;
        };
    }
    function curryGlobalSet(prop) {
        return function (value) {
            Ti.App['redux-' + prop] = redux.JSON.stringify(value);
        };
    }
    for (var i = 0, l = redux.data.globalVariables.length; i < l; i++) {
        redux.data.global['get' + redux.data.globalVariables[i]] = curryGlobalGet(redux.data.globalVariables[i]);
        redux.data.global['set' + redux.data.globalVariables[i]] = curryGlobalSet(redux.data.globalVariables[i]);
    }

    /**
     * The core redux functions.
     */
    redux.fn = redux.prototype = {
        /**
         * Returns the objects that match your selector, or the root redux object if you did not provide a selector. Note that only
         * objects created by redux constructors can be selected (ex use new Label() instead of Ti.UI.createLabel()).
         * @param {Object} selector
         */
        init: function (selector) {
            if (!selector) {
                return this;
            }
            this.selector = selector;
            // object
            if (typeof selector == 'object') {
                this.context = [this[0] = selector];
                this.length = 1;
                return this;
            }
            // id
            if (selector.indexOf('#') === 0) {
                this.context = [this[0] = redux.data.maps.byID[selector.split('#')[1]]];
                this.length = this.context != null;
                return this;
            }
            // class name
            if (selector.indexOf('.') === 0) {
                this.context = redux.data.maps.byClassName[selector.split('.')[0]];
                return redux.fn.mergeObjects(this, this.context);
            }
            // type
            this.context = redux.data.maps.byType[selector];
            return redux.fn.mergeObjects(this, this.context);
        },
        /**
         * Includes one or more files using absolute pathing regardless of the platform (Android and iOS).
         *
         * Use this function like this: include('includes/utilities.js'); and it will ALWAYS be relative to
         * your root folder!
         */
        include: function() {
            // android doesn't require path juggling
            if (Ti.Platform.osname == 'android') {
                for (var i2 = 0, l2 = arguments.length; i2 < l2; i2++) {
                    Ti.include(arguments[i2]);
                }
            } else {
                // grab the path from the current window's url!
                // split the url into an array around each /
                var context = (Ti.UI.currentWindow && Ti.UI.currentWindow.url.split('/')) || [''];
                // pop the file name out of the array; we don't need it
                context.pop();
                // change each folder name into a .. (to get back to the root)
                for (var i = 0, l = context.length; i < l; i++) {
                    context[i] = '..';
                }
                // join it all together with / again
                var relative = context.join('/');
                // put a / on the end, if we need it
                if (relative) {
                    relative += '/';
                }
                // now iterate over our arguments using this relative path!
                for (var i3 = 0, l3 = arguments.length; i3 < l3; i3++) {
                    Ti.include(relative + arguments[i2]);
                }
            }
        },
        /**
         * Includes one or more files in every JavaScript context that will exist, so long as redux is loaded with it.
         * @param {Array} arguments One or more files to include globally
         */
        includeGlobal: function () {
            var files = redux.data.global.getfiles() || [];
            for (var i = 0; i < arguments.length; i++) {
                if (!redux.fn.contains(arguments[i], files)) {
                    files.push(arguments[i]);
                    redux.fn.include(arguments[i]);
                }
            }
            redux.data.global.setfiles(files);
        },
        /**
         * Turns a string of RJSS into JavaScript that can be safely evaluated. RJSS is a way to customize JavaScript
         * objects quickly, and is primarily used to style your UI elements.
         *
         * @param {String} file The raw RJSS contents to parse into executable JavaScript
         * @returns Executable JavaScript
         */
        parseRJSS: function (file) {
            var parsedrjss = redux.data.global.getparsedrjss() || {};
            if (parsedrjss[file]) {
                return parsedrjss[file];
            }
            var rjss = (Ti.Filesystem.getFile(file).read() + '').replace(/[\r\t\n]/g, ' ');
            var result = '', braceDepth = 0;
            var inComment = false, inSelector = false, inAttributeBrace = false;
            var canStartSelector = true, canBeAttributeBrace = false;

            for (var i = 0, l = rjss.length; i < l; i++) {
                var next = rjss[i+1], current = rjss[i], last = rjss[i-1];
                if (inComment) {
                    if (current == '/' && last == '*') {
                        inComment = false;
                    }
                    continue;
                }
                switch (current) {
                    case ' ':
                        result += ' ';
                        break;
                    case '/':
                        inComment = next == '*';
                        result += inComment ? '' : '/';
                        break;
                    case '[':
                        if (braceDepth > 0) {
                            result += '[';
                        } else {
                            canStartSelector = false;
                            result += 'if (';
                        }
                        break;
                    case '=':
                        result += (last != '!' && last != '<' && last != '>') ? '==' : '=';
                        break;
                    case ']':
                        if (braceDepth > 0) {
                            result += ']';
                        } else {
                            canStartSelector = true;
                            result += ')';
                            canBeAttributeBrace = true;
                        }
                        break;
                    case '{':
                        if (canBeAttributeBrace) {
                            canBeAttributeBrace = false;
                            inAttributeBrace = true;
                        } else {
                            if (inSelector) {
                                inSelector = false;
                                result += '",';
                            }
                            braceDepth += 1;
                        }
                        result += '{';
                        break;
                    case '}':
                        braceDepth -= 1;
                        result += '}';
                        switch (braceDepth) {
                            case 0:
                                result += ');';
                                canStartSelector = true;
                                break;
                            case -1:
                                inAttributeBrace = false;
                                braceDepth = 0;
                                break;
                        }
                        break;
                    default:
                        canBeAttributeBrace = false;
                        if (braceDepth == 0 && canStartSelector) {
                            canStartSelector = false;
                            inSelector = true;
                            result += 'redux.fn.setDefault("';
                        }
                        result += current;
                        break;
                }
            }
            parsedrjss[file] = result;
            redux.data.global.setparsedrjss(parsedrjss);
            return result;
        },
        /**
         * Includes and parses one or more RJSS files. Styles will be applied to any elements you create after calling this.
         * @param {Array} arguments One or more RJSS files to include and parse
         */
        includeRJSS: function () {
            for (var i = 0, l = arguments.length; i < l; i++) {
                eval(redux.fn.parseRJSS(arguments[i]));
            }
        },
        /**
         * Includes and parses one or more RJSS file in every JavaScript context that will exist, so long as
         * you include redux in each of them.
         * @param {Array} arguments One or more RJSS files to include globally
         */
        includeRJSSGlobal: function () {
            var files = redux.data.global.getrjss() || [];
            for (var i = 0, l = arguments.length; i < l; i++) {
                if (!redux.fn.contains(arguments[i], files)) {
                    files.push(arguments[i]);
                    redux.fn.includeRJSS(arguments[i]);
                }
            }
            redux.data.global.setrjss(files);
        },
        /**
         * Returns true if the element is in the array.
         * @param {Object} element
         * @param {Object} array
         * @return {Boolean} true if the element is in the array
         */
        contains: function (element, array) {
            if (array.indexOf) {
                return array.indexOf(element) !== -1;
            }
            for (var i = 0, l = array.length; i < l; i++) {
                if (array[i] === element) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Merges the properties of the two objects.
         * @param {Object} original
         * @param {Object} overrider
         */
        mergeObjects: function mergeObjects(original, overrider) {
            if (original == null) {
                return overrider || {};
            }
            if (overrider == null) {
                return original;
            }
            for (var index in overrider) {
                if (overrider.hasOwnProperty(index)) {
                    if (typeof original[index] == 'undefined') {
                        original[index] = overrider[index];
                    } else if (typeof overrider[index] == 'object') {
                        original[index] = mergeObjects(original[index], overrider[index]);
                    }
                }
            }
            return original;
        },
        /**
         * Adds an event binder that can bind listen events or fire events, similar to how jQuery's events stack works.
         * @param {Object} event
         */
        addEventBinder: function (event) {
            redux.fn.init.prototype[event] = function () {
                var action;
                if (arguments.length == 0 || !(arguments[0] instanceof Function)) {
                    action = 'fireEvent';
                } else {
                    action = 'addEventListener';
                }
                for (var i = 0, l = this.context.length; i < l; i++) {
                    this.context[i][action](event, arguments[0]);
                }
                return this;
            };
        },
        /**
         * Starts tracking an element with redux. This lets us select the element later by its ID
         * class or type.
         * @param {Object} element
         */
        trackElement: function (element) {
            var maps = redux.data.maps;
            if (element.id) {
                maps.byID[element.id] = element;
            }
            if (element.className) {
                if (!maps.byClassName[element.className]) {
                    maps.byClassName[element.className] = [];
                    maps.byClassName[element.className].push(element);
                } else if (!redux.fn.contains(element, maps.byClassName[element.className])) {
                    maps.byClassName[element.className].push(element);
                }
            }
            if (!maps.byType[element.toString()]) {
                maps.byType[element.toString()] = [];
                maps.byType[element.toString()].push(element);
            } else if (!redux.fn.contains(element, maps.byType[element.toString()])) {
                maps.byType[element.toString()].push(element);
            }
        },
        /**
         * Set the default properties for any elements matched by the RJSS selector.
         * @param {Object} selector
         * @param {Object} defaults
         */
        setDefault: function (selector, defaults) {
            var selectors = selector.split(',');
            for (var i = 0, l = selectors.length; i < l; i++) {
                var cleanSelector = selectors[i].split(' ').join(''); // remove spaces
                var target;
                switch (cleanSelector.charAt(0)) {
                    case '#': // set by ID
                        target = redux.data.defaults.byID;
                        cleanSelector = cleanSelector.substring(1); // remove the '#'
                        break;
                    case '.': // set by className
                        target = redux.data.defaults.byClassName;
                        cleanSelector = cleanSelector.substring(1); // remove the '.'
                        break;
                    default: // set by element type
                        target = redux.data.defaults.byType;
                        break;
                }
                target[cleanSelector] = this.mergeObjects(target[cleanSelector] || {}, defaults);
            }
            return this;
        },
        /**
         * Takes in an object and applies any default styles necessary to it.
         * @param args
         */
        style: function(type, args) {
            // merge defaults by id
            if (args && args.id && redux.data.defaults.byID[args.id]) {
                args = redux.fn.mergeObjects(args, redux.data.defaults.byID[args.id]);
            }
            // merge defaults by class name
            if (args && args.className) {
                var classes = args.className.split(' ');
                for (var i = 0, l = classes.length; i < l; i++) {
                    args = redux.fn.mergeObjects(args, redux.data.defaults.byClassName[classes[i]]);
                }
            }
            // merge defaults by type
            return redux.fn.mergeObjects(args, redux.data.defaults.byType[type]);
        },
        /**
         * Adds a natural constructors for all the different things you can create with Ti, like Labels,
         * LoginButtons, HTTPClients, etc. Also allows you to add your own natural constructors.
         *
         * @param context The context to add this constructor to ("this" would be a good thing to pass in here)
         * @param parent The parent namespace (like Ti.UI)
         * @param type The type of the constructor (like Label or Button)
         * @param constructorName The desired constructor name; defaults to type. Generic styles will use this.
         */
        addNaturalConstructor: function (context, parent, type, constructorName) {
            constructorName = constructorName || type;
            context[constructorName] = function cstor(args) {
                if (!(this instanceof arguments.callee)) {
                    return new cstor(args);
                }
                args = redux.fn.style(constructorName, args);
                // return created object with merged defaults by type
                var createdElement = parent['create' + type](args);
                redux.fn.trackElement(createdElement);
                return createdElement;
            };
            /**
             * Shortcut to setting defaults by type. Will only apply to objects you create in the future using redux's constructors.
             * @param {Object} args
             */
            context[type].setDefault = function (args) {
                redux.fn.setDefault(type, args);
            };
        }
    };

    /**
     * Add shorthand events.
     */
    for (var i2 = 0, l2 = redux.data.events.length; i2 < l2; i2++) {
        redux.fn.addEventBinder(redux.data.events[i2]);
    }

    /**
     * Add natural constructors and shortcuts to setting defaults by type.
     */
    for (var i3 in redux.data.types) {
        // iterate over type namespaces (UI, Network, Facebook, etc)
        if (redux.data.types.hasOwnProperty(i3)) {
            for (var j3 = 0, l3 = redux.data.types[i3].length; j3 < l3; j3++) {
                // iterate over types within parent namespace (Label, LoginButton, HTTPClient, etc)
                redux.fn.addNaturalConstructor(this, Ti[i3], redux.data.types[i3][j3]);
            }
        }
    }

    /**
     * Includes a file in every JavaScript context with redux loaded that exists or that will exist.
     */
    context.includeGlobal = redux.fn.includeGlobal;
    /**
     * Includes and parses one or more RJSS files. Styles will be applied to any elements you create after calling this.
     */
    context.includeRJSS = redux.fn.includeRJSS;
    /**
     * Includes a RJSS file in every JavaScript context with redux loaded that exists or that will exist.
     */
    context.includeRJSSGlobal = redux.fn.includeRJSSGlobal;

    /**
     * Include any normal files or RJSS files from before this context existed.
     */
    var files = redux.data.global.getfiles() || [];
    for (var i5 = 0, l5 = files.length; i5 < l5; i5++) {
        redux.fn.include(files[i5]);
    }
    var rjssFiles = redux.data.global.getrjss() || [];
    for (var i4 = 0, l4 = rjssFiles.length; i4 < l4; i4++) {
        redux.fn.includeRJSS(rjssFiles[i4]);
    }

    /**
     * Create a shorthand for redux itself -- $, if it is available.
     */
    context.$ = context.$ || redux;

})(redux, this);
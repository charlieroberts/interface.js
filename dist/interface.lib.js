(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Interface = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

var Accelerometer = Object.create(_widget2.default);
var metersPerSecondSquared = 9.80665;
var os = _utilities2.default.getOS();

if (os !== 'android') {
  Accelerometer.hardwareMin = -2.307 * metersPerSecondSquared; // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
  Accelerometer.hardwareMax = 2.307 * metersPerSecondSquared; // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
} else {
  Accelerometer.hardwareMin = metersPerSecondSquared;
  Accelerometer.hardwareMax = metersPerSecondSquared;
}

Accelerometer.hardwareRange = Accelerometer.hardwareMax - Accelerometer.hardwareMin;

Object.assign(Accelerometer, {
  value: [0, 0, 0],
  __value: [0, 0, 0],
  __prevValue: [0, 0, 0],

  create: function create() {
    var acc = Object.create(this);
    _widget2.default.create.call(acc);
    acc.addEvents();
    return acc;
  },
  addEvents: function addEvents() {
    window.addEventListener('devicemotion', this.update.bind(this));
  },
  update: function update(event) {
    var acceleration = event.acceleration;
    this.x = this.__value[0] = this.min + (0 - this.hardwareMin + acceleration.x) / this.hardwareRange * this.max;
    this.y = this.__value[1] = this.min + (0 - this.hardwareMin + acceleration.y) / this.hardwareRange * this.max;
    this.z = this.__value[2] = this.min + (0 - this.hardwareMin + acceleration.z) / this.hardwareRange * this.max;

    //if(typeof this.onvaluechange !== 'undefined') {
    //  this.onvaluechange(this.x, this.y, this.z);
    //}

    //this.sendTargetMessage();
    this.output();
  }
}, {
  x: 0,
  y: 0,
  z: 0,
  min: 0,
  max: 1
});

exports.default = Accelerometer;

/*
Interface.Accelerometer = function() {
  var self = this,
      metersPerSecondSquared = 9.80665;

  Interface.extend(this, {
    type:"Accelerometer",

    serializeMe : ["delay"],
    delay : 100, // measured in ms
    min: 0,
    max: 1,
    values : [0,0,0],

    update : function(event) {
      var acceleration = event.acceleration;
      self.x = self.values[0] = self.min + ((((0 - self.hardwareMin) + acceleration.x) / self.hardwareRange ) * self.max);
      self.y = self.values[1] = self.min + ((((0 - self.hardwareMin) + acceleration.y) / self.hardwareRange ) * self.max);
      self.z = self.values[2] = self.min + ((((0 - self.hardwareMin) + acceleration.z) / self.hardwareRange ) * self.max);

      if(typeof self.onvaluechange !== 'undefined') {
        self.onvaluechange(self.x, self.y, self.z);
      }

      self.sendTargetMessage();
    },
    start : function() {
      window.addEventListener('devicemotion', this.update, true);
      return this;
    },
    stop : function() {
      window.removeEventListener('devicemotion', this.update);
      return this;
    },
  })
  .init( arguments[0] );

	if(!Interface.isAndroid) {
	    this.hardwareMin = -2.307 * metersPerSecondSquared;  // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
	    this.hardwareMax = 2.307 * metersPerSecondSquared;   // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
	}else{
	    this.hardwareMin = metersPerSecondSquared;
	    this.hardwareMax = metersPerSecondSquared;
	}

  this.hardwareRange = this.hardwareMax - this.hardwareMin;
};
Interface.Accelerometer.prototype = Interface.Widget;
*/

},{"./utilities":17,"./widget":18}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Button with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the buttons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module Button
 * @augments CanvasWidget
 */

var Button = Object.create(_canvasWidget2.default);

Object.assign(Button, {

  /** @lends Button.prototype */

  /**
   * A set of default property settings for all Button instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Button
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    active: false,

    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the Button instance.
     * @memberof Button
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new Button instance.
   * @memberof Button
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Button instance with.
   * @static
   */
  create: function create(props) {
    var button = Object.create(this);

    _canvasWidget2.default.create.call(button);

    Object.assign(button, Button.defaults, props);

    if (props.value) button.__value = props.value;

    button.init();

    return button;
  },


  /**
   * Draw the Button into its canvas context using the current .__value property and button style.
   * @memberof Button
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      var _this = this;

      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      if (this.style === 'hold') {
        this.active = true;
        this.pointerId = e.pointerId;
        window.addEventListener('pointerup', this.pointerup);
      }

      if (this.style === 'toggle') {
        this.__value = this.__value === 1 ? 0 : 1;
      } else if (this.style === 'momentary') {
        this.__value = 1;
        setTimeout(function () {
          _this.__value = 0;_this.draw();
        }, 50);
      } else if (this.style === 'hold') {
        this.__value = 1;
      }

      this.output();

      this.draw();
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId && this.style === 'hold') {
        this.active = false;

        window.removeEventListener('pointerup', this.pointerup);

        this.__value = 0;
        this.output();

        this.draw();
      }
    }
  }
});

exports.default = Button;

},{"./canvasWidget":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget');

var _domWidget2 = _interopRequireDefault(_domWidget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

var _widgetLabel = require('./widgetLabel');

var _widgetLabel2 = _interopRequireDefault(_widgetLabel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CanvasWidget is the base class for widgets that use HTML canvas elements.
 * @module CanvasWidget
 * @augments DOMWidget
 */

var CanvasWidget = Object.create(_domWidget2.default);

Object.assign(CanvasWidget, {
  /** @lends CanvasWidget.prototype */

  /**
   * A set of default colors and canvas context properties for use in CanvasWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    background: '#888',
    fill: '#aaa',
    stroke: 'rgba(255,255,255,.3)',
    lineWidth: 4,
    defaultLabel: {
      x: .5, y: .5, align: 'center', width: 1, text: 'demo'
    },
    shouldDisplayValue: false
  },
  /**
   * Create a new CanvasWidget instance
   * @memberof CanvasWidget
   * @constructs
   * @static
   */
  create: function create(props) {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _domWidget2.default.create.call(this);

    Object.assign(this, CanvasWidget.defaults);

    /**
     * Store a reference to the canvas 2D context.
     * @memberof CanvasWidget
     * @instance
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.element.getContext('2d');

    this.applyHandlers(shouldUseTouch);
  },


  /**
   * Create a the canvas element used by the widget and set
   * some default CSS values.
   * @memberof CanvasWidget
   * @static
   */
  createElement: function createElement() {
    var element = document.createElement('canvas');
    element.setAttribute('touch-action', 'none');
    element.style.position = 'absolute';
    element.style.display = 'block';

    return element;
  },
  applyHandlers: function applyHandlers() {
    var _this = this;

    var shouldUseTouch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var handlers = shouldUseTouch ? CanvasWidget.handlers.touch : CanvasWidget.handlers.mouse;

    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var handlerName = _step.value;

        _this.element.addEventListener(handlerName, function (event) {
          if (typeof _this['on' + handlerName] === 'function') _this['on' + handlerName](event);
        });
      };

      for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },


  handlers: {
    mouse: ['mouseup', 'mousemove', 'mousedown'],
    touch: []
  },

  addLabel: function addLabel() {
    var props = Object.assign({ ctx: this.ctx }, this.label || this.defaultLabel),
        label = _widgetLabel2.default.create(props);

    this.label = label;
    this._draw = this.draw;
    this.draw = function () {
      this._draw();
      this.label.draw();
    };
  },
  __addToPanel: function __addToPanel(panel) {
    var _this2 = this;

    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();

    if (this.label || this.shouldDisplayValue) this.addLabel();
    if (this.shouldDisplayValue) {
      this.__postfilters.push(function (value) {
        _this2.label.text = value.toFixed(5);
        return value;
      });
    }
    this.draw();
  }
});

exports.default = CanvasWidget;

},{"./domWidget":5,"./utilities":17,"./widgetLabel":19}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Communication = {
  Socket: null,
  initialized: false,

  init: function init() {
    var _this = this;

    this.Socket = new WebSocket(this.getServerAddress());
    this.Socket.onmessage = this.onmessage;

    var fullLocation = window.location.toString(),
        locationSplit = fullLocation.split('/'),
        interfaceName = locationSplit[locationSplit.length - 1];

    this.Socket.onopen = function () {
      _this.Socket.send(JSON.stringify({ type: 'meta', interfaceName: interfaceName, key: 'register' }));
    };

    this.initialized = true;
  },
  getServerAddress: function getServerAddress() {
    var expr = void 0,
        socketIPAndPort = void 0,
        socketString = void 0,
        ip = void 0,
        port = void 0;

    expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/;

    socketIPAndPort = expr.exec(window.location.toString())[0].split(':');
    ip = socketIPAndPort[0];
    port = parseInt(socketIPAndPort[1]);

    socketString = 'ws://' + ip + ':' + port;

    return socketString;
  },
  onmessage: function onmessage(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'osc') {
      Communication.OSC.receive(e.data);
    } else {
      if (Communication.Socket.receive) {
        Communication.Socket.receive(data.address, data.parameters);
      }
    }
  },


  OSC: {
    callbacks: {},
    onmessage: null,

    send: function send(address, parameters) {
      if (Communication.Socket.readyState === 1) {
        if (typeof address === 'string') {
          var msg = {
            type: "osc",
            address: address,
            'parameters': Array.isArray(parameters) ? parameters : [parameters]
          };

          Communication.Socket.send(JSON.stringify(msg));
        } else {
          throw Error('Invalid osc message:', arguments);
        }
      } else {
        throw Error('Socket is not yet connected; cannot send OSC messsages.');
      }
    },
    receive: function receive(data) {
      var msg = JSON.parse(data);

      if (msg.address in this.callbacks) {
        this.callbacks[msg.address](msg.parameters);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _widget2.default.widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var widget = _step.value;

            //console.log( "CHECK", child.key, msg.address )
            if (widget.key === msg.address) {
              //console.log( child.key, msg.parameters )
              widget.setValue.apply(widget, msg.parameters);
              return;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (this.onmessage !== null) {
          this.receive(msg.address, msg.typetags, msg.parameters);
        }
      }
    }
  }

};

exports.default = Communication;

},{"./widget":18}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _widget = require('./widget');

var _widget2 = _interopRequireDefault(_widget);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

var DOMWidget = Object.create(_widget2.default);

Object.assign(DOMWidget, {
  /** @lends DOMWidget.prototype */

  /**
   * A set of default property settings for all DOMWidgets
   * @type {Object}
   * @static
   */
  defaults: {
    x: 0, y: 0, width: .25, height: .25,
    attached: false
  },

  /**
   * Create a new DOMWidget instance
   * @memberof DOMWidget
   * @constructs
   * @static
   */
  create: function create() {
    var shouldUseTouch = _utilities2.default.getMode() === 'touch';

    _widget2.default.create.call(this);

    Object.assign(this, DOMWidget.defaults);

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if (typeof this.createElement === 'function') {

      /**
       * The DOM element used by the DOMWidget
       * @memberof DOMWidget
       * @instance
       */
      this.element = this.createElement();
    } else {
      throw new Error('widget inheriting from DOMWidget does not implement createElement method; this is required.');
    }
  },


  /**
   * Create a DOM element to be placed in a Panel.
   * @virtual
   * @memberof DOMWidget
   * @static
   */
  createElement: function createElement() {
    throw Error('all subclasses of DOMWidget must implement createElement()');
  },


  /**
   * use CSS to position element element of widget
   * @memberof DOMWidget
   */
  place: function place() {
    var containerWidth = this.container.getWidth(),
        containerHeight = this.container.getHeight(),
        width = this.width <= 1 ? containerWidth * this.width : this.width,
        height = this.height <= 1 ? containerHeight * this.height : this.height,
        x = this.x < 1 ? containerWidth * this.x : this.x,
        y = this.y < 1 ? containerHeight * this.y : this.y;

    if (!this.attached) {
      this.attached = true;
    }

    if (this.isSquare) {
      if (height > width) {
        height = width;
      } else {
        width = height;
      }
    }

    this.element.width = width;
    this.element.style.width = width + 'px';
    this.element.height = height;
    this.element.style.height = height + 'px';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';

    /**
     * Bounding box, in absolute coordinates, of the DOMWidget
     * @memberof DOMWidget
     * @instance
     * @type {Object}
     */
    this.rect = this.element.getBoundingClientRect();

    if (typeof this.onplace === 'function') this.onplace();
  }
});

exports.default = DOMWidget;

},{"./utilities":17,"./widget":18}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Filters = {
  Scale: function Scale() {
    var inmin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var inmax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var outmin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var outmax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    var inrange = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange;

    return function (input) {
      return outmin + input * rangeRatio;
    };
  }
};

exports.default = Filters;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Utilities = exports.XY = exports.Keyboard = exports.MultiButton = exports.MultiSlider = exports.Knob = exports.Communication = exports.TextInput = exports.Menu = exports.Button = exports.Joystick = exports.Slider = exports.Panel = exports.Accelerometer = undefined;

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

var _joystick = require('./joystick');

var _joystick2 = _interopRequireDefault(_joystick);

var _button = require('./button');

var _button2 = _interopRequireDefault(_button);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

var _textInput = require('./textInput');

var _textInput2 = _interopRequireDefault(_textInput);

var _communication = require('./communication');

var _communication2 = _interopRequireDefault(_communication);

var _pepjs = require('pepjs');

var _pepjs2 = _interopRequireDefault(_pepjs);

var _knob = require('./knob');

var _knob2 = _interopRequireDefault(_knob);

var _multislider = require('./multislider');

var _multislider2 = _interopRequireDefault(_multislider);

var _multiButton = require('./multiButton');

var _multiButton2 = _interopRequireDefault(_multiButton);

var _keyboard = require('./keyboard');

var _keyboard2 = _interopRequireDefault(_keyboard);

var _xy = require('./xy');

var _xy2 = _interopRequireDefault(_xy);

var _accelerometer = require('./accelerometer');

var _accelerometer2 = _interopRequireDefault(_accelerometer);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Accelerometer = _accelerometer2.default;
exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Joystick = _joystick2.default;
exports.Button = _button2.default;
exports.Menu = _menu2.default;
exports.TextInput = _textInput2.default;
exports.Communication = _communication2.default;
exports.Knob = _knob2.default;
exports.MultiSlider = _multislider2.default;
exports.MultiButton = _multiButton2.default;
exports.Keyboard = _keyboard2.default;
exports.XY = _xy2.default;
exports.Utilities = _utilities2.default; // Everything we need to include goes here and is fed to browserify in the gulpfile.js

},{"./accelerometer":1,"./button":2,"./communication":4,"./joystick":8,"./keyboard":9,"./knob":10,"./menu":11,"./multiButton":12,"./multislider":13,"./panel":14,"./slider":15,"./textInput":16,"./utilities":17,"./xy":20,"pepjs":21}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A joystick that can be used to select an XY position and then snaps back. 
 * @module Joystick
 * @augments CanvasWidget
 */

var Joystick = Object.create(_canvasWidget2.default);

Object.assign(Joystick, {
  /** @lends Joystick.prototype */

  /**
   * A set of default property settings for all Joystick instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Joystick
   * @static
   */
  defaults: {
    __value: [.5, .5], // always 0-1, not for end-users
    value: [.5, .5], // end-user value that may be filtered
    active: false
  },

  /**
   * Create a new Joystick instance.
   * @memberof Joystick
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var joystick = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(joystick);

    // ...and then finally override with user defaults
    Object.assign(joystick, Joystick.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) joystick.__value = props.value;

    // inherits from Widget
    joystick.init();

    return joystick;
  },


  /**
   * Draw the Joystick onto its canvas context using the current .__value property.
   * @memberof Joystick
   * @instance
   */
  perp_norm_vector: function perp_norm_vector(value) {
    var x1 = value[0] - .5;
    var y1 = value[1] - .5;
    var x2 = 0.0;
    var y2 = -(x1 / y1) * (x2 - x1) + y1;
    var x3 = x2 - x1;
    var y3 = y2 - y1;
    var m = Math.sqrt(x3 * x3 + y3 * y3);
    x3 = x3 / m;
    y3 = y3 / m;

    return [x3, y3];
  },
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;
    var v = this.perp_norm_vector(this.__value);
    var r = 15.0;

    this.ctx.beginPath();
    this.ctx.moveTo(this.rect.width * 0.5 + r * v[0] * .25, this.rect.height * .5 + r * v[1] * .25);
    this.ctx.lineTo(this.rect.width * this.__value[0] + r * v[0], this.rect.height * this.__value[1] + r * v[1]);
    this.ctx.lineTo(this.rect.width * this.__value[0] - r * v[0], this.rect.height * this.__value[1] - r * v[1]);
    this.ctx.lineTo(this.rect.width * 0.5 - r * v[0] * .25, this.rect.height * .5 - r * v[1] * .25);
    this.ctx.fill();
    //  this.ctx.fillRect( this.rect.width * this.__value[0] -12, this.rect.height * this.__value[1] -12, 24, 24 )
    this.ctx.beginPath();
    this.ctx.arc(this.rect.width * this.__value[0], this.rect.height * this.__value[1], r, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(this.rect.width * 0.5, this.rect.height * 0.5, r * .25, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
        this.__value = [.5, .5];
        this.output();
        this.draw();
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Joystick's position, and triggers output.
   * @instance
   * @memberof Joystick
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {

    this.__value[0] = (e.clientX - this.rect.left) / this.rect.width;
    this.__value[1] = (e.clientY - this.rect.top) / this.rect.height;

    // clamp __value, which is only used internally
    if (this.__value[0] > 1) this.__value[0] = 1;
    if (this.__value[1] > 1) this.__value[1] = 1;
    if (this.__value[0] < 0) this.__value[0] = 0;
    if (this.__value[1] < 0) this.__value[1] = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

exports.default = Joystick;

},{"./canvasWidget.js":3}],9:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

var _utilities = require('./utilities.js');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Keys
 * @augments CanvasWidget
 */

var Keys = Object.create(_canvasWidget2.default);

var keyTypesForNote = {
  c: 'wRight',
  'c#': 'b',
  db: 'b',
  d: 'wMiddle',
  'd#': 'b',
  eb: 'b',
  e: 'wLeft',
  f: 'wRight',
  'f#': 'b',
  gb: 'b',
  g: 'wMiddleR',
  'g#': 'b',
  ab: 'b',
  a: 'wMiddleL',
  'a#': 'b',
  bb: 'b',
  b: 'wLeft'
};

var noteIntegers = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

var keyColors = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];

Object.assign(Keys, {
  /** @lends Keys.prototype */

  /**
   * A set of default property settings for all Keys instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Keys
   * @static
   */
  defaults: {
    active: false,
    startKey: 36,
    endKey: 60,
    whiteColor: '#fff',
    blackColor: '#000',
    followMouse: true
  },

  /**
   * Create a new Keys instance.
   * @memberof Keys
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Keys with.
   * @static
   */
  create: function create(props) {
    var keys = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Keys defaults
    _canvasWidget2.default.create.call(keys);

    // ...and then finally override with user defaults
    Object.assign(keys, Keys.defaults, props, {
      value: {},
      __value: {},
      bounds: [],
      active: {},
      __prevValue: [],
      __lastKey: null
    });

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) keys.__value = props.value;

    // inherits from Widget
    keys.init();

    for (var i = keys.startKey; i < keys.endKey; i++) {
      keys.__value[i] = 0;
      keys.value[i] = 0;
      keys.bounds[i] = [];
    }

    keys.onplace = function () {
      return keys.__defineBounds();
    };

    return keys;
  },
  __defineBounds: function __defineBounds() {
    var keyRange = this.endKey - this.startKey;
    var rect = this.rect;
    var keyWidth = rect.width / keyRange * 1.725;
    var blackHeight = .65 * rect.height;

    var currentX = 0;

    for (var i = 0; i < keyRange; i++) {
      var bounds = this.bounds[this.startKey + i];
      var noteNumber = (this.startKey + i) % 12;
      var noteName = noteIntegers[noteNumber];
      var noteDrawType = keyTypesForNote[noteName];

      switch (noteDrawType) {
        case 'wRight':
          // C, F
          bounds.push({ x: currentX, y: 0 });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: 0 });
          bounds.push({ x: currentX, y: 0 });

          currentX += keyWidth * .6;
          break;

        case 'b':
          // all flats and sharps
          bounds.push({ x: currentX, y: 0 });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: 0 });
          bounds.push({ x: currentX, y: 0 });

          currentX += keyWidth * .4;
          break;

        case 'wMiddle':
          // D
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth * .8;
          break;

        case 'wLeft':
          // E, B
          currentX -= keyWidth * .2;

          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: 0 });
          bounds.push({ x: currentX + keyWidth * .4, y: 0 });
          bounds.push({ x: currentX + keyWidth * .4, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth;
          break;

        case 'wMiddleR':
          // G
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1., y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1., y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });

          currentX += keyWidth * .7;
          break;

        case 'wMiddleL':
          // A
          currentX -= keyWidth * .1;

          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: rect.height });
          bounds.push({ x: currentX + keyWidth, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .8, y: 0 });
          bounds.push({ x: currentX + keyWidth * .3, y: 0 });
          bounds.push({ x: currentX + keyWidth * .3, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });

          currentX += keyWidth * .8;
          break;
        default:
      }
    }
  },


  /**
   * Draw the Keys onto its canvas context using the current .__value property.
   * @memberof Keys
   * @instance
   */
  draw: function draw() {
    var ctx = this.ctx;
    ctx.strokeStyle = this.blackColor;
    ctx.lineWidth = 1;

    var count = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.bounds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var bounds = _step.value;

        if (bounds === undefined) continue;

        var noteNumber = (this.startKey + count) % 12;
        var noteName = noteIntegers[noteNumber];
        var noteDrawType = keyTypesForNote[noteName];

        ctx.beginPath();

        ctx.moveTo(bounds[0].x, bounds[0].y);

        for (var idx = 1; idx < bounds.length; idx++) {
          ctx.lineTo(bounds[idx].x, bounds[idx].y);
        }

        ctx.closePath();

        if (this.__value[this.startKey + count] === 1) {
          ctx.fillStyle = '#999';
        } else {
          ctx.fillStyle = keyColors[noteNumber] === 1 ? this.whiteColor : this.blackColor;
        }

        ctx.fill();
        ctx.stroke();

        count++;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
    this.element.addEventListener('pointermove', this.pointermove);
  },


  events: {
    pointerdown: function pointerdown(e) {
      var hit = this.processPointerPosition(e, 'down'); // change keys value on click / touchdown
      if (hit !== null) {
        this.active[e.pointerId] = hit;
        //this.active[ e.pointerId ].lastButton = data.buttonNum
      }

      //window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },
    pointerup: function pointerup(e) {
      var keyNum = this.active[e.pointerId];

      if (keyNum !== undefined) {
        delete this.active[e.pointerId];

        this.__value[keyNum] = 0;
        var shouldDraw = this.output(keyNum);
        if (shouldDraw) this.draw();

        //window.removeEventListener( 'pointermove', this.pointermove ) 
        //window.removeEventListener( 'pointerup',   this.pointerup ) 
      }
    },
    pointermove: function pointermove(e) {
      //if( this.active && e.pointerId === this.pointerId ) {
      this.processPointerPosition(e, 'move');
      //}
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Keys's position, and triggers output.
   * @instance
   * @memberof Keys
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e, dir) {
    var prevValue = this.value,
        hitKeyNum = null,
        shouldDraw = false;

    for (var i = this.startKey; i < this.endKey; i++) {
      var hit = _utilities2.default.polyHitTest(e, this.bounds[i], this.rect);

      if (hit === true) {
        hitKeyNum = i;
        var __shouldDraw = false;

        if (this.followMouse === false || dir !== 'move') {
          this.__value[i] = dir === 'down' ? 1 : 0;
          __shouldDraw = this.output(hitKeyNum, dir);
        } else {
          if (this.__lastKey !== hitKeyNum && e.pressure > 0) {
            //console.log( this.__lastKey, hitKeyNum, this.__value[ this.__lastKey ] )
            this.__value[this.__lastKey] = 0;
            this.__value[hitKeyNum] = 1;

            this.active[e.pointerId] = hitKeyNum;

            this.output(this.__lastKey, 0);
            this.output(hitKeyNum, 1);

            __shouldDraw = true;
          }
        }

        this.__lastKey = hitKeyNum;
        if (__shouldDraw === true) shouldDraw = true;
      }
    }

    if (shouldDraw) this.draw();

    return hitKeyNum;
  },
  output: function output(keyNum, dir) {
    var value = this.__value[keyNum],
        newValueGenerated = false,
        prevValue = this.__prevValue[keyNum];

    value = this.runFilters(value, this);

    this.value[keyNum] = value;

    if (this.target !== null) this.transmit([value, keyNum]);

    if (prevValue !== undefined) {
      if (value !== prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(value, keyNum);

      this.__prevValue[keyNum] = value;
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  }
});

module.exports = Keys;

},{"./canvasWidget.js":3,"./utilities.js":17}],10:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Knob
 * @augments CanvasWidget
 */

var Knob = Object.create(_canvasWidget2.default);

Object.assign(Knob, {
  /** @lends Knob.prototype */

  /**
   * A set of default property settings for all Knob instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Knob
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    knobBuffer: 20,
    usesRotation: false,
    lastPosition: 0,
    isSquare: true,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Knob instance.
     * @memberof Knob
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Knob instance.
   * @memberof Knob
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Knob with.
   * @static
   */
  create: function create(props) {
    var knob = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Knob defaults
    _canvasWidget2.default.create.call(knob);

    // ...and then finally override with user defaults
    Object.assign(knob, Knob.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) knob.__value = props.value;

    // inherits from Widget
    knob.init();

    return knob;
  },


  /**
   * Draw the Knob onto its canvas context using the current .__value property.
   * @memberof Knob
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.container.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    var x = 0,
        y = 0,
        width = this.rect.width,
        height = this.rect.height,
        radius = width / 2;

    this.ctx.fillRect(x, y, width, height);
    //this.ctx.strokeStyle = this.stroke

    this.ctx.fillStyle = this.background; // draw background of widget first

    var angle0 = Math.PI * .6,
        angle1 = Math.PI * .4;

    this.ctx.beginPath();
    this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle1, false);
    this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle1, angle0, true);
    this.ctx.closePath();

    this.ctx.fill();

    var angle2 = void 0;
    if (!this.isInverted) {
      angle2 = Math.PI * .6 + this.__value * 1.8 * Math.PI;
      if (angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI;
    } else {
      angle2 = Math.PI * (0.4 - 1.8 * this.__value);
    }

    this.ctx.beginPath();

    if (!this.isInverted) {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle0, angle2, false);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle0, true);
    } else {
      this.ctx.arc(x + radius, y + radius, radius - this.knobBuffer, angle1, angle2, true);
      this.ctx.arc(x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle1, false);
    }

    this.ctx.closePath();

    this.ctx.fillStyle = this.fill;
    this.ctx.fill();
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change knob value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Knob's position, and triggers output.
   * @instance
   * @memberof Knob
   * @param {PointerEvent} e - The pointer event to be processed.
   */

  processPointerPosition: function processPointerPosition(e) {
    var xOffset = e.clientX,
        yOffset = e.clientY;

    var radius = this.rect.width / 2;
    this.lastValue = this.value;

    if (!this.usesRotation) {
      if (this.lastPosition !== -1) {
        //this.__value -= ( yOffset - this.lastPosition ) / (radius * 2);
        this.__value = 1 - yOffset / this.rect.height;
      }
    } else {
      var xdiff = radius - xOffset;
      var ydiff = radius - yOffset;
      var angle = Math.PI + Math.atan2(ydiff, xdiff);
      this.__value = (angle + Math.PI * 1.5) % (Math.PI * 2) / (Math.PI * 2);

      if (this.lastRotationValue > .8 && this.__value < .2) {
        this.__value = 1;
      } else if (this.lastRotationValue < .2 && this.__value > .8) {
        this.__value = 0;
      }
    }

    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    this.lastRotationValue = this.__value;
    this.lastPosition = yOffset;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
}

//__addToPanel( panel ) {
//  this.container = panel

//  if( typeof this.addEvents === 'function' ) this.addEvents()

//  // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget

//  this.place( true ) 

//  if( this.label ) this.addLabel()

//  this.draw()     

//}

);

module.exports = Knob;

},{"./canvasWidget.js":3}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget.js');

var _domWidget2 = _interopRequireDefault(_domWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */
var Menu = Object.create(_domWidget2.default);

Object.assign(Menu, {
  /** @lends Menu.prototype */

  /**
   * A set of default property settings for all Menu instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Menu
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    background: '#333',
    fill: '#777',
    stroke: '#aaa',
    borderWidth: 4,

    /**
     * The options array stores the different possible values for the Menu
     * widget. There are used to create HTML option elements which are then
     * attached to the primary select element used by the Menu.
     * @memberof Menu
     * @instance
     * @type {Array}
     */
    options: [],
    onvaluechange: null
  },

  /**
   * Create a new Menu instance.
   * @memberof Menu
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Menu with.
   * @static
   */
  create: function create(props) {
    var menu = Object.create(this);

    _domWidget2.default.create.call(menu);

    Object.assign(menu, Menu.defaults, props);

    menu.createOptions();

    menu.element.addEventListener('change', function (e) {
      menu.__value = e.target.value;
      menu.output();

      if (menu.onvaluechange !== null) {
        menu.onvaluechange(menu.value);
      }
    });

    return menu;
  },


  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Menu 
   * @instance
   */
  createElement: function createElement() {
    var select = document.createElement('select');

    return select;
  },


  /**
   * Generate option elements for menu. Removes previously appended elements.
   * @memberof Menu 
   * @instance
   */
  createOptions: function createOptions() {
    this.element.innerHTML = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var option = _step.value;

        var optionEl = document.createElement('option');
        optionEl.setAttribute('value', option);
        optionEl.innerText = option;
        this.element.appendChild(optionEl);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },
  selectOption: function selectOption(optionString) {
    var optionIdx = this.options.indexOf(optionString);
    var option = this.element.options[optionIdx];
    option.selected = true;

    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', false, true);
    this.element.dispatchEvent(evt);
  },


  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Menu 
   * @instance
   */
  __addToPanel: function __addToPanel(panel) {
    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();
  }
});

exports.default = Menu;

},{"./domWidget.js":5}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _canvasWidget = require('./canvasWidget');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A MultiButton with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the multiButtons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module MultiButton
 * @augments CanvasWidget
 */

var MultiButton = Object.create(_canvasWidget2.default);

Object.assign(MultiButton, {

  /** @lends MultiButton.prototype */

  /**
   * A set of default property settings for all MultiButton instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiButton
   * @static
   */
  defaults: {
    rows: 2,
    columns: 2,
    lastButton: null,
    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the MultiButton instance.
     * @memberof MultiButton
     * @instance
     * @type {String}
     */
    style: 'toggle'
  },

  /**
   * Create a new MultiButton instance.
   * @memberof MultiButton
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a MultiButton instance with.
   * @static
   */
  create: function create(props) {
    var multiButton = Object.create(this);

    _canvasWidget2.default.create.call(multiButton);

    Object.assign(multiButton, MultiButton.defaults, props);

    if (props.value) {
      multiButton.__value = props.value;
    } else {
      multiButton.__value = [];
      for (var i = 0; i < multiButton.count; i++) {
        multiButton.__value[i] = 0;
      }multiButton.value = [];
    }

    multiButton.active = {};
    multiButton.__prevValue = [];

    multiButton.init();

    return multiButton;
  },


  /**
   * Draw the MultiButton into its canvas context using the current .__value property and multiButton style.
   * @memberof MultiButton
   * @instance
   */
  draw: function draw() {
    this.ctx.fillStyle = this.__value === 1 ? this.fill : this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;

    var buttonWidth = this.rect.width / this.columns,
        buttonHeight = this.rect.height / this.rows;

    for (var row = 0; row < this.rows; row++) {
      var y = row * buttonHeight;
      for (var column = 0; column < this.columns; column++) {
        var x = column * buttonWidth,
            _buttonNum = row * this.columns + column;

        this.ctx.fillStyle = this.__value[_buttonNum] === 1 ? this.fill : this.background;
        this.ctx.fillRect(x, y, buttonWidth, buttonHeight);
        this.ctx.strokeRect(x, y, buttonWidth, buttonHeight);
      }
    }
  },
  addEvents: function addEvents() {
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    this.element.addEventListener('pointerdown', this.pointerdown);
  },
  getDataFromEvent: function getDataFromEvent(e) {
    var rowSize = 1 / this.rows,
        row = Math.floor(e.clientY / this.rect.height / rowSize),
        columnSize = 1 / this.columns,
        column = Math.floor(e.clientX / this.rect.width / columnSize),
        buttonNum = row * this.columns + column;

    return { buttonNum: buttonNum, row: row, column: column };
  },
  processButtonOn: function processButtonOn(data, e) {
    var _this = this;

    if (this.style === 'toggle') {
      this.__value[buttonNum] = this.__value[buttonNum] === 1 ? 0 : 1;
    } else if (this.style === 'momentary') {
      this.__value[buttonNum] = 1;
      setTimeout(function () {
        _this.__value[buttonNum] = 0;
        //let idx = this.active.findIndex( v => v.buttonNum === buttonNum )
        //this.active.splice( idx, 1 )
        _this.active[e.pointerId].splice(_this.active[e.pointerId].indexOf(buttonNum), 1);
        _this.draw();
      }, 50);
    } else if (this.style === 'hold') {
      this.__value[data.buttonNum] = 1;
    }

    this.output(data);

    this.draw();
  },


  events: {
    pointerdown: function pointerdown(e) {
      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      var data = this.getDataFromEvent(e);

      this.active[e.pointerId] = [data.buttonNum];
      this.active[e.pointerId].lastButton = data.buttonNum;

      window.addEventListener('pointermove', this.pointermove);
      window.addEventListener('pointerup', this.pointerup);

      this.processButtonOn(data, e);
    },
    pointermove: function pointermove(e) {
      var data = this.getDataFromEvent(e);

      var checkForPressed = this.active[e.pointerId].indexOf(data.buttonNum),
          lastButton = this.active[e.pointerId].lastButton;

      if (checkForPressed === -1 && lastButton !== data.buttonNum) {

        if (this.style === 'toggle' || this.style === 'hold') {
          if (this.style === 'hold') {
            this.__value[lastButton] = 0;
            this.output(data);
          }
          this.active[e.pointerId] = [data.buttonNum];
        } else {
          this.active[e.pointerId].push(data.buttonNum);
        }

        this.active[e.pointerId].lastButton = data.buttonNum;

        this.processButtonOn(data, e);
      }
    },
    pointerup: function pointerup(e) {
      if (Object.keys(this.active).length) {
        window.removeEventListener('pointerup', this.pointerup);
        window.removeEventListener('pointermove', this.pointermove);

        if (this.style !== 'toggle') {
          var buttonsForPointer = this.active[e.pointerId];

          if (buttonsForPointer !== undefined) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = buttonsForPointer[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var button = _step.value;

                this.__value[button] = 0;
                var row = Math.floor(button / this.rows),
                    column = button % this.columns;

                this.output({ buttonNum: button, row: row, column: column });
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            delete this.active[e.pointerId];

            this.draw();
          }
        }
      }
    }
  },

  output: function output(buttonData) {
    var value = this.__value[buttonData.buttonNum],
        newValueGenerated = false,
        prevValue = this.__prevValue[buttonData.buttonNum];

    value = this.runFilters(value, this);

    this.value[buttonData.buttonNum] = value;

    if (this.target !== null) this.transmit([value, buttonData.row, buttonData.column]);

    if (prevValue !== undefined) {
      if (value !== prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(value, buttonData.row, buttonData.column);

      this.__prevValue[buttonData.buttonNum] = value;
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  }
});

exports.default = MultiButton;

},{"./canvasWidget":3}],13:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module MultiSlider
 * @augments CanvasWidget
 */

var MultiSlider = Object.create(_canvasWidget2.default);

Object.assign(MultiSlider, {
  /** @lends MultiSlider.prototype */

  /**
   * A set of default property settings for all MultiSlider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiSlider
   * @static
   */
  defaults: {
    __value: [.15, .35, .5, .75], // always 0-1, not for end-users
    value: [.5, .5, .5, .5], // end-user value that may be filtered
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof MultiSlider
     * @instance
     * @type {Integer}
     */
    count: 4,
    lineWidth: 1,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the MultiSlider instance.
     * @memberof MultiSlider
     * @instance
     * @type {String}
     */
    style: 'vertical'
  },

  /**
   * Create a new MultiSlider instance.
   * @memberof MultiSlider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize MultiSlider with.
   * @static
   */
  create: function create(props) {
    var multiSlider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with MultiSlider defaults
    _canvasWidget2.default.create.call(multiSlider);

    // ...and then finally override with user defaults
    Object.assign(multiSlider, MultiSlider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) multiSlider.__value = props.value;

    // inherits from Widget
    multiSlider.init();

    if (props.value === undefined && multiSlider.count !== 4) {
      for (var i = 0; i < multiSlider.count; i++) {
        multiSlider.__value[i] = i / multiSlider.count;
      }
    } else if (typeof props.value === 'number') {
      for (var _i = 0; _i < multiSlider.count; _i++) {
        multiSlider.__value[_i] = props.value;
      }
    }

    return multiSlider;
  },


  /**
   * Draw the MultiSlider onto its canvas context using the current .__value property.
   * @memberof MultiSlider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (multiSlider value representation)
    this.ctx.fillStyle = this.fill;

    var sliderWidth = this.style === 'vertical' ? this.rect.width / this.count : this.rect.height / this.count;

    for (var i = 0; i < this.count; i++) {

      if (this.style === 'horizontal') {
        var ypos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(0, ypos, this.rect.width * this.__value[i], Math.ceil(sliderWidth));
        this.ctx.strokeRect(0, ypos, this.rect.width, sliderWidth);
      } else {
        var xpos = Math.floor(i * sliderWidth);
        this.ctx.fillRect(xpos, this.rect.height - this.__value[i] * this.rect.height, Math.ceil(sliderWidth), this.rect.height * this.__value[i]);
        this.ctx.strokeRect(xpos, 0, sliderWidth, this.rect.height);
      }
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change multiSlider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the MultiSlider's position, and triggers output.
   * @instance
   * @memberof MultiSlider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value,
        sliderNum = void 0;

    if (this.style === 'horizontal') {
      sliderNum = Math.floor(e.clientY / this.rect.height / (1 / this.count));
      this.__value[sliderNum] = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      sliderNum = Math.floor(e.clientX / this.rect.width / (1 / this.count));
      this.__value[sliderNum] = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    for (var i = 0; i < this.count; i++) {
      if (this.__value[i] > 1) this.__value[i] = 1;
      if (this.__value[i] < 0) this.__value[i] = 0;
    }

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = MultiSlider;

},{"./canvasWidget.js":3}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Panel = {
  defaults: {
    fullscreen: false,
    background: '#333'
  },

  // class variable for reference to all panels
  panels: [],

  create: function create() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    var panel = Object.create(this);

    // default: full window interface
    if (props === null) {

      Object.assign(panel, Panel.defaults, {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        __x: 0,
        __y: 0,
        __width: null,
        __height: null,
        fullscreen: true,
        children: []
      });

      panel.div = panel.__createHTMLElement();
      panel.layout();

      var body = document.querySelector('body');
      body.appendChild(panel.div);
    }

    Panel.panels.push(panel);

    return panel;
  },
  __createHTMLElement: function __createHTMLElement() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.display = 'block';
    div.style.backgroundColor = this.background;

    return div;
  },
  layout: function layout() {
    if (this.fullscreen) {
      this.__width = window.innerWidth;
      this.__height = window.innerHeight;
      this.__x = this.x * this.__width;
      this.__y = this.y * this.__height;

      this.div.style.width = this.__width + 'px';
      this.div.style.height = this.__height + 'px';
      this.div.style.left = this.__x + 'px';
      this.div.style.top = this.__y + 'px';
    }
  },
  getWidth: function getWidth() {
    return this.__width;
  },
  getHeight: function getHeight() {
    return this.__height;
  },
  add: function add() {
    for (var _len = arguments.length, widgets = Array(_len), _key = 0; _key < _len; _key++) {
      widgets[_key] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widgets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var widget = _step.value;


        // check to make sure widget has not been already added
        if (this.children.indexOf(widget) === -1) {
          if (typeof widget.__addToPanel === 'function') {
            this.div.appendChild(widget.element);
            this.children.push(widget);

            widget.__addToPanel(this);
          } else {
            throw Error('Widget cannot be added to panel; it does not contain the method .__addToPanel');
          }
        } else {
          throw Error('Widget is already added to panel.');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
};

exports.default = Panel;

},{}],15:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module Slider
 * @augments CanvasWidget
 */

var Slider = Object.create(_canvasWidget2.default);

Object.assign(Slider, {
  /** @lends Slider.prototype */

  /**
   * A set of default property settings for all Slider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Slider
   * @static
   */
  defaults: {
    __value: .5, // always 0-1, not for end-users
    value: .5, // end-user value that may be filtered
    active: false,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Slider instance.
     * @memberof Slider
     * @instance
     * @type {String}
     */
    style: 'horizontal'
  },

  /**
   * Create a new Slider instance.
   * @memberof Slider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Slider with.
   * @static
   */
  create: function create(props) {
    var slider = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with Slider defaults
    _canvasWidget2.default.create.call(slider);

    // ...and then finally override with user defaults
    Object.assign(slider, Slider.defaults, props);

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if (props.value) slider.__value = props.value;

    // inherits from Widget
    slider.init();

    return slider;
  },


  /**
   * Draw the Slider onto its canvas context using the current .__value property.
   * @memberof Slider
   * @instance
   */
  draw: function draw() {
    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (slider value representation)
    this.ctx.fillStyle = this.fill;

    if (this.style === 'horizontal') this.ctx.fillRect(0, 0, this.rect.width * this.__value, this.rect.height);else this.ctx.fillRect(0, this.rect.height - this.__value * this.rect.height, this.rect.width, this.rect.height * this.__value);

    this.ctx.strokeRect(0, 0, this.rect.width, this.rect.height);
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change slider value on click / touchdown

      window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
      window.addEventListener('pointerup', this.pointerup);
    },
    pointerup: function pointerup(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.active = false;
        window.removeEventListener('pointermove', this.pointermove);
        window.removeEventListener('pointerup', this.pointerup);
      }
    },
    pointermove: function pointermove(e) {
      if (this.active && e.pointerId === this.pointerId) {
        this.processPointerPosition(e);
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Slider's position, and triggers output.
   * @instance
   * @memberof Slider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var prevValue = this.value;

    if (this.style === 'horizontal') {
      this.__value = (e.clientX - this.rect.left) / this.rect.width;
    } else {
      this.__value = 1 - (e.clientY - this.rect.top) / this.rect.height;
    }

    // clamp __value, which is only used internally
    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    var shouldDraw = this.output();

    if (shouldDraw) this.draw();
  }
});

module.exports = Slider;

},{"./canvasWidget.js":3}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _domWidget = require('./domWidget.js');

var _domWidget2 = _interopRequireDefault(_domWidget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */
var Input = Object.create(_domWidget2.default);

Object.assign(Input, {
  /** @lends Input.prototype */

  /**
   * A set of default property settings for all Input instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Input
   * @static
   */
  defaults: {
    __value: 0,
    value: 0,
    background: '#333',
    fill: '#777',
    stroke: '#aaa',
    borderWidth: 4,

    /**
     * The options array stores the different possible values for the Input
     * widget. There are used to create HTML option elements which are then
     * attached to the primary select element used by the Input.
     * @memberof Input
     * @instance
     * @type {Array}
     */
    options: [],
    onvaluechange: null
  },

  /**
   * Create a new Input instance.
   * @memberof Input
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Input with.
   * @static
   */
  create: function create(props) {
    var menu = Object.create(this);

    _domWidget2.default.create.call(menu);

    Object.assign(menu, Input.defaults, props);

    menu.element.innerHTML = menu.value;

    menu.element.addEventListener('change', function (e) {
      menu.__value = e.target.value;
      menu.output();

      if (menu.onvaluechange !== null) {
        menu.onvaluechange(menu.value);
      }
    });

    menu.init();

    return menu;
  },


  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Input 
   * @instance
   */
  createElement: function createElement() {
    var input = document.createElement('input');

    return input;
  },


  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Input 
   * @instance
   */
  __addToPanel: function __addToPanel(panel) {
    this.container = panel;

    if (typeof this.addEvents === 'function') this.addEvents();

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place();
  }
});

exports.default = Input;

},{"./domWidget.js":5}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
  },
  getOS: function getOS() {
    var ua = navigator.userAgent.toLowerCase();
    var os = ua.indexOf('android') > -1 ? 'android' : 'ios';
    return os;
  },
  compareArrays: function compareArrays(a1, a2) {
    return a1.length === a2.length && a1.every(function (v, i) {
      return v === a2[i];
    });
  },


  // ported/adapted from orignal Interface.js ButtonV code by Jonathan Simozar
  polyHitTest: function polyHitTest(e, bounds, rect) {
    var w = rect.width,
        h = rect.height,
        p = bounds;

    var sides = 0,
        hit = false;

    for (var i = 0; i < p.length - 1; i++) {
      if (p[i + 1].x > p[i].x) {
        if (p[i].x <= e.x && e.x < p[i + 1].x) {
          var yval = (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x) * h / w * (e.x - p[i].x) + p[i].y;

          if (yval - e.y < 0) sides++;
        }
      } else if (p[i + 1].x < p[i].x) {
        if (p[i].x >= e.x && e.x > p[i + 1].x) {
          var _yval = (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x) * h / w * (e.x - p[i].x) + p[i].y;

          if (_yval - e.y < 0) sides++;
        }
      }
    }

    if (sides % 2 === 1) hit = true;

    return hit;
  },
  mtof: function mtof(num) {
    var tuning = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 440;

    return tuning * Math.exp(.057762265 * (num - 69));
  }
};

exports.default = Utilities;

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filters = require('./filters');

var _filters2 = _interopRequireDefault(_filters);

var _communication = require('./communication.js');

var _communication2 = _interopRequireDefault(_communication);

var _utilities = require('./utilities');

var _utilities2 = _interopRequireDefault(_utilities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Widget is the base class that all other UI elements inherits from. It primarily
 * includes methods for filtering / scaling output.
 * @module Widget
 */

var Widget = {
  /** @lends Widget.prototype */

  /**
   * store all instantiated widgets.
   * @type {Array.<Widget>}
   * @static
   */
  widgets: [],
  lastValue: null,
  onvaluechange: null,

  /**
   * A set of default property settings for all widgets
   * @type {Object}
   * @static
   */
  defaults: {
    min: 0, max: 1,
    scaleOutput: true, // apply scale filter by default for min / max ranges
    target: null,
    __prevValue: null
  },

  /**
   * Create a new Widget instance
   * @memberof Widget
   * @constructs
   * @static
   */
  create: function create() {
    Object.assign(this, Widget.defaults);

    /** 
     * Stores filters for transforming widget output.
     * @memberof Widget
     * @instance
     */
    this.filters = [];

    this.__prefilters = [];
    this.__postfilters = [];

    Widget.widgets.push(this);

    return this;
  },


  /**
   * Initialization method for widgets. Checks to see if widget contains
   * a 'target' property; if so, makes sure that communication with that
   * target is initialized.
   * @memberof Widget
   * @instance
   */

  init: function init() {
    if (this.target && this.target === 'osc' || this.target === 'midi') {
      if (!_communication2.default.initialized) _communication2.default.init();
    }

    // if min/max are not 0-1 and scaling is not disabled
    if (this.scaleOutput && (this.min !== 0 || this.max !== 1)) {
      this.__prefilters.push(_filters2.default.Scale(0, 1, this.min, this.max));
    }
  },
  runFilters: function runFilters(value, widget) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = widget.__prefilters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var filter = _step.value;
        value = filter(value);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = widget.filters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _filter = _step2.value;
        value = _filter(value);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = widget.__postfilters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _filter2 = _step3.value;
        value = _filter2(value);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return value;
  },


  /**
   * Calculates output of widget by running .__value property through filter chain.
   * The result is stored in the .value property of the widget, which is then
   * returned.
   * @memberof Widget
   * @instance
   */
  output: function output() {
    var _this = this;

    var value = this.__value,
        newValueGenerated = false,
        lastValue = this.value,
        isArray = void 0;

    isArray = Array.isArray(value);

    if (isArray) {
      value = value.map(function (v) {
        return Widget.runFilters(v, _this);
      });
    } else {
      value = this.runFilters(value, this);
    }

    this.value = value;

    if (this.target !== null) this.transmit(this.value);

    if (this.__prevValue !== null) {
      if (isArray) {
        if (!_utilities2.default.compareArrays(this.__value, this.__prevValue)) {
          newValueGenerated = true;
        }
      } else if (this.__value !== this.__prevValue) {
        newValueGenerated = true;
      }
    } else {
      newValueGenerated = true;
    }

    if (newValueGenerated) {
      if (this.onvaluechange !== null) this.onvaluechange(this.value, lastValue);

      if (Array.isArray(this.__value)) {
        this.__prevValue = this.__value.slice();
      } else {
        this.__prevValue = this.__value;
      }
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated;
  },


  /**
   * If the widget has a remote target (not a target inside the interface web page)
   * this will transmit the widgets value to the remote destination.
   * @memberof Widget
   * @instance
   */
  transmit: function transmit(output) {
    if (this.target === 'osc') {
      _communication2.default.OSC.send(this.address, output);
    } else {
      if (this.target[this.key] !== undefined) {
        if (typeof this.target[this.key] === 'function') {
          this.target[this.key](output);
        } else {
          this.target[this.key] = output;
        }
      }
    }
  }
};

exports.default = Widget;

},{"./communication.js":4,"./filters":6,"./utilities":17}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var WidgetLabel = {

  defaults: {
    size: 24,
    face: 'sans-serif',
    fill: 'white',
    align: 'center',
    background: null,
    width: 1
  },

  create: function create(props) {
    var label = Object.create(this);

    Object.assign(label, this.defaults, props);

    if (_typeof(label.ctx) === undefined) throw Error('WidgetLabels must be constructed with a canvas context (ctx) argument');

    label.font = label.size + 'px ' + label.face;

    return label;
  },
  draw: function draw() {
    var cnvs = this.ctx.canvas,
        cwidth = cnvs.width,
        cheight = cnvs.height,
        x = this.x * cwidth,
        y = this.y * cheight,
        width = this.width * cwidth;

    if (this.background !== null) {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect(x, y, width, this.size + 10);
    }

    this.ctx.fillStyle = this.fill;
    this.ctx.textAlign = this.align;
    this.ctx.font = this.font;
    this.ctx.fillText(this.text, x, y, width);
  }
};

exports.default = WidgetLabel;

},{}],20:[function(require,module,exports){
'use strict';

var _canvasWidget = require('./canvasWidget.js');

var _canvasWidget2 = _interopRequireDefault(_canvasWidget);

var _victor = require('victor');

var _victor2 = _interopRequireDefault(_victor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A horizontal or vertical fader. 
 * @module XY
 * @augments CanvasWidget
 */

var XY = Object.create(_canvasWidget2.default);

Object.assign(XY, {
  /** @lends XY.prototype */

  /**
   * A set of default property settings for all XY instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof XY
   * @static
   */
  defaults: {
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof XY
     * @instance
     * @type {Integer}
     */
    count: 4,
    lineWidth: 1,
    usePhysics: true,
    touchSize: 50,
    fill: 'rgba( 255,255,255, .2 )',
    stroke: '#999',
    background: '#000',
    friction: .0
  },

  /**
   * Create a new XY instance.
   * @memberof XY
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize XY with.
   * @static
   */
  create: function create(props) {
    var xy = Object.create(this);

    // apply Widget defaults, then overwrite (if applicable) with XY defaults
    _canvasWidget2.default.create.call(xy);

    // ...and then finally override with user defaults
    Object.assign(xy, XY.defaults, props, {
      value: [],
      __value: [],
      touches: []
    });

    // set underlying value if necessary... TODO: how should this be set given min/max?
    // if( props.value ) xy.__value = props.value

    // inherits from Widget
    xy.init();

    xy.onplace = function () {
      for (var i = 0; i < xy.count; i++) {
        xy.touches.push({
          pos: new _victor2.default(i * (xy.rect.width / xy.count), i * (xy.rect.height / xy.count)),
          vel: new _victor2.default(0, 0),
          acc: new _victor2.default(.05, .05),
          name: xy.names === undefined ? i : xy.names[i]
        });
      }

      if (xy.usePhysics === true) xy.startAnimationLoop();
    };

    return xy;
  },
  startAnimationLoop: function startAnimationLoop() {
    var _this = this;

    this.draw(true);

    var loop = function loop() {
      _this.draw();
      window.requestAnimationFrame(loop);
    };

    loop();
  },
  animate: function animate() {
    var shouldDraw = true;
    var __friction = new _victor2.default(-1 * this.friction, -1 * this.friction);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.touches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var touch = _step.value;

        if (touch.vel.x !== 0 && touch.vel.y !== 0) {
          //touch.vel.add( touch.acc )
          var friction = touch.vel.clone();
          friction.x *= -1 * this.friction;
          friction.y *= -1 * this.friction;
          touch.vel.add(friction);

          if (touch.pos.x - this.touchSize + touch.vel.x < 0) {
            touch.pos.x = this.touchSize;
            touch.vel.x *= -1;
          } else if (touch.pos.x + this.touchSize + touch.vel.x > this.rect.width) {
            touch.pos.x = this.rect.width - this.touchSize;
            touch.vel.x *= -1;
          } else {
            touch.pos.x += touch.vel.x;
          }

          if (touch.pos.y - this.touchSize + touch.vel.y < 0) {
            touch.pos.y = this.touchSize;
            touch.vel.y *= -1;
          } else if (touch.pos.y + this.touchSize + touch.vel.y > this.rect.height) {
            touch.pos.y = this.rect.height - this.touchSize;
            touch.vel.y *= -1;
          } else {
            touch.pos.y += touch.vel.y;
          }

          shouldDraw = true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return shouldDraw;
  },


  /**
   * Draw the XY onto its canvas context using the current .__value property.
   * @memberof XY
   * @instance
   */
  draw: function draw() {
    var override = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var shouldDraw = this.animate();

    if (shouldDraw === false && override === false) return;

    // draw background
    this.ctx.fillStyle = this.background;
    this.ctx.strokeStyle = this.stroke;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.fillRect(0, 0, this.rect.width, this.rect.height);

    // draw fill (xy value representation)
    this.ctx.fillStyle = this.fill;

    for (var i = 0; i < this.count; i++) {
      var child = this.touches[i];
      this.ctx.fillStyle = this.fill;

      this.ctx.beginPath();

      this.ctx.arc(child.pos.x, child.pos.y, this.touchSize, 0, Math.PI * 2, true);

      this.ctx.closePath();

      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillRect(this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = this.stroke;
      this.ctx.font = 'normal 20px Helvetica';
      this.ctx.fillText(child.name, child.pos.x, child.pos.y);
    }
  },
  addEvents: function addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for (var key in this.events) {
      this[key] = this.events[key].bind(this);
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
    window.addEventListener('pointermove', this.pointermove); // only listen for up and move events after pointerdown 
  },


  events: {
    pointerdown: function pointerdown(e) {
      this.active = true;
      this.pointerId = e.pointerId;

      this.processPointerPosition(e); // change xy value on click / touchdown


      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },
    pointerup: function pointerup(e) {
      //if( this.active && e.pointerId === this.pointerId ) {
      //this.active = false
      //window.removeEventListener( 'pointermove', this.pointermove ) 
      //window.removeEventListener( 'pointerup',   this.pointerup ) 
      //}
      var touch = this.touches.find(function (t) {
        return t.pointerId === e.pointerId;
      });

      if (touch !== undefined) {
        //console.log( 'found', touch.name, e.pointerId )
        touch.vel.x = (e.clientX - touch.lastX) * .5;
        touch.vel.y = (e.clientY - touch.lastY) * .5;
        //console.log( touch.vel.x, e.clientX, touch.lastX, touch.pos.x  )
        touch.pointerId = null;
      } else {
        console.log('undefined touch', e.pointerId);
      }
    },
    pointermove: function pointermove(e) {
      var touch = this.touches.find(function (t) {
        return t.pointerId === e.pointerId;
      });

      if (touch !== undefined) {
        touch.lastX = touch.pos.x;
        touch.lastY = touch.pos.y;

        touch.pos.x = e.clientX;
        touch.pos.y = e.clientY;
      }
    }
  },

  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the XY's position, and triggers output.
   * @instance
   * @memberof XY
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition: function processPointerPosition(e) {
    var closestDiff = Infinity,
        touchFound = null,
        touchNum = null;

    for (var i = 0; i < this.touches.length; i++) {
      var touch = this.touches[i],
          xdiff = Math.abs(touch.pos.x - e.clientX),
          ydiff = Math.abs(touch.pos.y - e.clientY);

      if (xdiff + ydiff < closestDiff) {
        closestDiff = xdiff + ydiff;
        touchFound = touch;
        touchNum = i;
        //console.log( 'touch found', touchNum, closestDiff, e.pointerId )
      }
    }

    touchFound.isActive = true;
    touchFound.vel.x = 0;
    touchFound.vel.y = 0;
    touchFound.pos.x = touchFound.lastX = e.clientX;
    touchFound.pos.y = touchFound.lastY = e.clientY;
    touchFound.pointerId = e.pointerId;

    this.output();
    //touchFound.identifier = _touch.identifier
    //touchFound.childID = touchNum
    //if( this.style === 'horizontal' ) {
    //  sliderNum = Math.floor( ( e.clientY / this.rect.height ) / ( 1/this.count ) )
    //  this.__value[ sliderNum ] = ( e.clientX - this.rect.left ) / this.rect.width
    //}else{
    //  sliderNum = Math.floor( ( e.clientX / this.rect.width ) / ( 1/this.count ) )
    //  this.__value[ sliderNum ] = 1 - ( e.clientY - this.rect.top  ) / this.rect.height 
    //}

    //for( let i = 0; i < this.count; i++  ) {
    //  if( this.__value[ i ] > 1 ) this.__value[ i ] = 1
    //  if( this.__value[ i ] < 0 ) this.__value[ i ] = 0
    //}

    //let shouldDraw = this.output()

    //if( shouldDraw ) this.draw()
  }
});

module.exports = XY;

},{"./canvasWidget.js":3,"victor":22}],21:[function(require,module,exports){
/*!
 * PEP v0.4.3 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.PointerEventsPolyfill = factory());
}(this, function () { 'use strict';

  /**
   * This is the constructor for new PointerEvents.
   *
   * New Pointer Events must be given a type, and an optional dictionary of
   * initialization properties.
   *
   * Due to certain platform requirements, events returned from the constructor
   * identify as MouseEvents.
   *
   * @constructor
   * @param {String} inType The type of the event to create.
   * @param {Object} [inDict] An optional dictionary of initial event properties.
   * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
   */
  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  function PointerEvent(inType, inDict) {
    inDict = inDict || Object.create(null);

    var e = document.createEvent('Event');
    e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

    // define inherited MouseEvent properties
    // skip bubbles and cancelable since they're set above in initEvent()
    for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
      p = MOUSE_PROPS[i];
      e[p] = inDict[p] || MOUSE_DEFAULTS[i];
    }
    e.buttons = inDict.buttons || 0;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;

    if (inDict.pressure && e.buttons) {
      pressure = inDict.pressure;
    } else {
      pressure = e.buttons ? 0.5 : 0;
    }

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // define the properties of the PointerEvent interface
    e.pointerId = inDict.pointerId || 0;
    e.width = inDict.width || 0;
    e.height = inDict.height || 0;
    e.pressure = pressure;
    e.tiltX = inDict.tiltX || 0;
    e.tiltY = inDict.tiltY || 0;
    e.twist = inDict.twist || 0;
    e.tangentialPressure = inDict.tangentialPressure || 0;
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  /**
   * This module implements a map of pointer states
   */
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var PointerMap = USE_MAP ? Map : SparseArrayMap;

  function SparseArrayMap() {
    this.array = [];
    this.size = 0;
  }

  SparseArrayMap.prototype = {
    set: function(k, v) {
      if (v === undefined) {
        return this.delete(k);
      }
      if (!this.has(k)) {
        this.size++;
      }
      this.array[k] = v;
    },
    has: function(k) {
      return this.array[k] !== undefined;
    },
    delete: function(k) {
      if (this.has(k)) {
        delete this.array[k];
        this.size--;
      }
    },
    get: function(k) {
      return this.array[k];
    },
    clear: function() {
      this.array.length = 0;
      this.size = 0;
    },

    // return value, key, map
    forEach: function(callback, thisArg) {
      return this.array.forEach(function(v, k) {
        callback.call(thisArg, v, k, this);
      }, this);
    }
  };

  var CLONE_PROPS = [

    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',

    // DOM Level 3
    'buttons',

    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',

    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp'
  ];

  var CLONE_DEFAULTS = [

    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,

    // DOM Level 3
    0,

    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,

    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var BOUNDARY_EVENTS = {
    'pointerover': 1,
    'pointerout': 1,
    'pointerenter': 1,
    'pointerleave': 1
  };

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    pointermap: new PointerMap(),
    eventMap: Object.create(null),
    captureInfo: Object.create(null),

    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    register: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.register.call(es, element);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    contains: /*scope.external.contains || */function(container, contained) {
      try {
        return container.contains(contained);
      } catch (ex) {

        // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
        return false;
      }
    },

    // EVENTS
    down: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerdown', inEvent);
    },
    move: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerenter', inEvent);
    },
    leave: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerover', inEvent);
    },
    out: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointercancel', inEvent);
    },
    leaveOut: function(event) {
      this.out(event);
      this.propagate(event, this.leave, false);
    },
    enterOver: function(event) {
      this.over(event);
      this.propagate(event, this.enter, true);
    },

    // LISTENER LOGIC
    eventHandler: function(inEvent) {

      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
      if (inEvent._handledByPE) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPE = true;
    },

    // set up event listeners
    listen: function(target, events) {
      events.forEach(function(e) {
        this.addEvent(target, e);
      }, this);
    },

    // remove event listeners
    unlisten: function(target, events) {
      events.forEach(function(e) {
        this.removeEvent(target, e);
      }, this);
    },
    addEvent: /*scope.external.addEvent || */function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: /*scope.external.removeEvent || */function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {

      // relatedTarget must be null if pointer is captured
      if (this.captureInfo[inEvent.pointerId]) {
        inEvent.relatedTarget = null;
      }
      var e = new PointerEvent(inType, inEvent);
      if (inEvent.preventDefault) {
        e.preventDefault = inEvent.preventDefault;
      }
      e._target = e._target || inEvent.target;
      return e;
    },

    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null);
      var p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
          if (eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }

      // keep the semantics of preventDefault
      if (inEvent.preventDefault) {
        eventCopy.preventDefault = function() {
          inEvent.preventDefault();
        };
      }
      return eventCopy;
    },
    getTarget: function(inEvent) {
      var capture = this.captureInfo[inEvent.pointerId];
      if (!capture) {
        return inEvent._target;
      }
      if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
        return capture;
      }
    },
    propagate: function(event, fn, propagateDown) {
      var target = event.target;
      var targets = [];

      // Order of conditions due to document.contains() missing in IE.
      while (target !== document && !target.contains(event.relatedTarget)) {
        targets.push(target);
        target = target.parentNode;

        // Touch: Do not propagate if node is detached.
        if (!target) {
          return;
        }
      }
      if (propagateDown) {
        targets.reverse();
      }
      targets.forEach(function(target) {
        event.target = target;
        fn.call(this, event);
      }, this);
    },
    setCapture: function(inPointerId, inTarget, skipDispatch) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId, skipDispatch);
      }

      this.captureInfo[inPointerId] = inTarget;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId, skipDispatch);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('gotpointercapture');
      e.pointerId = inPointerId;
      e._target = inTarget;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    releaseCapture: function(inPointerId, skipDispatch) {
      var t = this.captureInfo[inPointerId];
      if (!t) {
        return;
      }

      this.captureInfo[inPointerId] = undefined;
      document.removeEventListener('pointerup', this.implicitRelease);
      document.removeEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('lostpointercapture');
      e.pointerId = inPointerId;
      e._target = t;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: /*scope.external.dispatchEvent || */function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    },
    asyncDispatchEvent: function(inEvent) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

  var targeting = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [];
      var s = this.shadow(element);
      while (s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr;

        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {

          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {

            // check for older shadows
            sr = this.olderShadow(sr);
          } else {

            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }

        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      var s = element;

      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }

      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX;
      var y = inEvent.clientY;

      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);

      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    }
  };

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
  var MO = window.MutationObserver || window.WebKitMutationObserver;
  var SELECTOR = '[touch-action]';
  var OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['touch-action']
  };

  function Installer(add, remove, changed, binder) {
    this.addCallback = add.bind(binder);
    this.removeCallback = remove.bind(binder);
    this.changedCallback = changed.bind(binder);
    if (MO) {
      this.observer = new MO(this.mutationWatcher.bind(this));
    }
  }

  Installer.prototype = {
    watchSubtree: function(target) {

      // Only watch scopes that can target find, as these are top-level.
      // Otherwise we can see duplicate additions and removals that add noise.
      //
      // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
      // a removal without an insertion when a node is redistributed among
      // shadows. Since it all ends up correct in the document, watching only
      // the document will yield the correct mutations to watch.
      if (this.observer && targeting.canTarget(target)) {
        this.observer.observe(target, OBSERVER_INIT);
      }
    },
    enableOnSubtree: function(target) {
      this.watchSubtree(target);
      if (target === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.installNewSubtree(target);
      }
    },
    installNewSubtree: function(target) {
      forEach(this.findElements(target), this.addElement, this);
    },
    findElements: function(target) {
      if (target.querySelectorAll) {
        return target.querySelectorAll(SELECTOR);
      }
      return [];
    },
    removeElement: function(el) {
      this.removeCallback(el);
    },
    addElement: function(el) {
      this.addCallback(el);
    },
    elementChanged: function(el, oldValue) {
      this.changedCallback(el, oldValue);
    },
    concatLists: function(accum, list) {
      return accum.concat(toArray(list));
    },

    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {
          this.installNewSubtree(document);
        }
      }.bind(this));
    },
    isElement: function(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    },
    flattenMutationTree: function(inNodes) {

      // find children with touch-action
      var tree = map(inNodes, this.findElements, this);

      // make sure the added nodes are accounted for
      tree.push(filter(inNodes, this.isElement));

      // flatten the list
      return tree.reduce(this.concatLists, []);
    },
    mutationWatcher: function(mutations) {
      mutations.forEach(this.mutationHandler, this);
    },
    mutationHandler: function(m) {
      if (m.type === 'childList') {
        var added = this.flattenMutationTree(m.addedNodes);
        added.forEach(this.addElement, this);
        var removed = this.flattenMutationTree(m.removedNodes);
        removed.forEach(this.removeElement, this);
      } else if (m.type === 'attributes') {
        this.elementChanged(m.target, m.oldValue);
      }
    }
  };

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';

  // only install stylesheet if the browser has touch action support
  var hasNativePE = window.PointerEvent || window.MSPointerEvent;

  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  function applyAttributeStyles() {
    if (hasNativePE) {
      attrib2css.forEach(function(r) {
        if (String(r) === r) {
          styles += selector(r) + rule(r) + '\n';
          if (hasShadowRoot) {
            styles += shadowSelector(r) + rule(r) + '\n';
          }
        } else {
          styles += r.selectors.map(selector) + rule(r.rule) + '\n';
          if (hasShadowRoot) {
            styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
          }
        }
      });

      var el = document.createElement('style');
      el.textContent = styles;
      document.head.appendChild(el);
    }
  }

  var pointermap = dispatcher.pointermap;

  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // left, middle, right, back, forward
  var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

  var HAS_BUTTONS = false;
  try {
    HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {}

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x);
        var dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);

      // forward mouse preventDefault
      var pd = e.preventDefault;
      e.preventDefault = function() {
        inEvent.preventDefault();
        pd();
      };
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    prepareButtonsForMove: function(e, inEvent) {
      var p = pointermap.get(this.POINTER_ID);

      // Update buttons state after possible out-of-document mouseup.
      if (inEvent.which === 0 || !p) {
        e.buttons = 0;
      } else {
        e.buttons = p.buttons;
      }
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);
        if (!p || p.buttons === 0) {
          dispatcher.down(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        e.buttons &= ~BUTTON_TO_BUTTONS[e.button];
        if (e.buttons === 0) {
          dispatcher.up(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.deactivateMouse();
    },
    deactivateMouse: function() {
      pointermap.delete(this.POINTER_ID);
    }
  };

  var captureInfo = dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var pointermap$1 = dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      INSTALLER.enableOnSubtree(target);
    },
    unregister: function() {

      // TODO(dfreedman): is it worth it to disconnect the MO?
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        dispatcher.unlisten(s, this.events);
      }, this);
    },
    elementChanged: function(el, oldValue) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      var oldSt = this.touchActionToScrollType(oldValue);

      // simply update scrollType if listeners are already established
      if (st && oldSt) {
        el._scrollType = st;
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
        }, this);
      } else if (oldSt) {
        this.elementRemoved(el);
      } else if (st) {
        this.elementAdded(el);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
      SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === 'none') {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else if (st.SCROLLER.exec(t)) {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {

      // set primary touch if there no pointers, or the only pointer is the mouse
      if (pointermap$1.size === 0 || (pointermap$1.size === 1 && pointermap$1.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
        this.scrolling = false;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = dispatcher.cloneEvent(inTouch);

      // We reserve pointerId 1 for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = captureInfo[id] || findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.button = 0;
      e.buttons = this.typeToButtons(cte.type);
      e.width = (inTouch.radiusX || inTouch.webkitRadiusX || 0) * 2;
      e.height = (inTouch.radiusY || inTouch.webkitRadiusY || 0) * 2;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

      // forward modifier keys
      e.altKey = cte.altKey;
      e.ctrlKey = cte.ctrlKey;
      e.metaKey = cte.metaKey;
      e.shiftKey = cte.shiftKey;

      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t; i < tl.length; i++) {
        t = tl[i];
        inFunction.call(this, this.touchToPointer(t));
      }
    },

    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = inEvent.currentTarget._scrollType;
        if (scrollAxis === 'none') {

          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {

          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];

          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },

    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;

      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (pointermap$1.size >= tl.length) {
        var d = [];
        pointermap$1.forEach(function(value, key) {

          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value.out;
            d.push(p);
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      pointermap$1.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      dispatcher.enterOver(inPointer);
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = pointermap$1.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          dispatcher.leaveOut(outEvent);
          dispatcher.enterOver(event);
        } else {

          // clean up case when finger leaves the screen
          event.target = outTarget;
          event.relatedTarget = null;
          this.cancelOut(event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        dispatcher.up(inPointer);
        dispatcher.leaveOut(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      dispatcher.cancel(inPointer);
      dispatcher.leaveOut(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      pointermap$1.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouseEvents.lastTouches;
      var t = inEvent.changedTouches[0];

      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {

        // remember x/y of last touch
        var lt = { x: t.clientX, y: t.clientY };
        lts.push(lt);
        var fn = (function(lts, lt) {
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  INSTALLER = new Installer(touchEvents.elementAdded, touchEvents.elementRemoved,
    touchEvents.elementChanged, touchEvents);

  var pointermap$2 = dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent &&
    typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      if (HAS_BITMAP_TYPE) {
        e = dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      pointermap$2.delete(id);
    },
    MSPointerDown: function(inEvent) {
      pointermap$2.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('lostpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('gotpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    }
  };

  function applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        dispatcher.registerSource('ms', msEvents);
      } else {
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: 0,
          enumerable: true
        });
        dispatcher.registerSource('mouse', mouseEvents);
        if (window.ontouchstart !== undefined) {
          dispatcher.registerSource('touch', touchEvents);
        }
      }

      dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s;
  var r;
  var h;
  function assertActive(id) {
    if (!dispatcher.pointermap.has(id)) {
      var error = new Error('InvalidPointerId');
      error.name = 'InvalidPointerId';
      throw error;
    }
  }
  function assertConnected(elem) {
    var parent = elem.parentNode;
    while (parent && parent !== elem.ownerDocument) {
      parent = parent.parentNode;
    }
    if (!parent) {
      var error = new Error('InvalidStateError');
      error.name = 'InvalidStateError';
      throw error;
    }
  }
  function inActiveButtonState(id) {
    var p = dispatcher.pointermap.get(id);
    return p.buttons !== 0;
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this, true);
        this.msSetPointerCapture(pointerId);
      }
    };
    r = function(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId, true);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this);
      }
    };
    r = function releasePointerCapture(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId);
    };
  }
  h = function hasPointerCapture(pointerId) {
    return !!dispatcher.captureInfo[pointerId];
  };

  function applyPolyfill$1() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        },
        'hasPointerCapture': {
          value: h
        }
      });
    }
  }

  applyAttributeStyles();
  applyPolyfill();
  applyPolyfill$1();

  var pointerevents = {
    dispatcher: dispatcher,
    Installer: Installer,
    PointerEvent: PointerEvent,
    PointerMap: PointerMap,
    targetFinding: targeting
  };

  return pointerevents;

}));
},{}],22:[function(require,module,exports){
exports = module.exports = Victor;

/**
 * # Victor - A JavaScript 2D vector class with methods for common vector operations
 */

/**
 * Constructor. Will also work without the `new` keyword
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = Victor(42, 1337);
 *
 * @param {Number} x Value of the x axis
 * @param {Number} y Value of the y axis
 * @return {Victor}
 * @api public
 */
function Victor (x, y) {
	if (!(this instanceof Victor)) {
		return new Victor(x, y);
	}

	/**
	 * The X axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.x;
	 *     // => 42
	 *
	 * @api public
	 */
	this.x = x || 0;

	/**
	 * The Y axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.y;
	 *     // => 21
	 *
	 * @api public
	 */
	this.y = y || 0;
};

/**
 * # Static
 */

/**
 * Creates a new instance from an array
 *
 * ### Examples:
 *     var vec = Victor.fromArray([42, 21]);
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromArray
 * @param {Array} array Array with the x and y values at index 0 and 1 respectively
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromArray = function (arr) {
	return new Victor(arr[0] || 0, arr[1] || 0);
};

/**
 * Creates a new instance from an object
 *
 * ### Examples:
 *     var vec = Victor.fromObject({ x: 42, y: 21 });
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromObject
 * @param {Object} obj Object with the values for x and y
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromObject = function (obj) {
	return new Victor(obj.x || 0, obj.y || 0);
};

/**
 * # Manipulation
 *
 * These functions are chainable.
 */

/**
 * Adds another vector's X axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addX(vec2);
 *     vec1.toString();
 *     // => x:30, y:10
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addX = function (vec) {
	this.x += vec.x;
	return this;
};

/**
 * Adds another vector's Y axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addY(vec2);
 *     vec1.toString();
 *     // => x:10, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addY = function (vec) {
	this.y += vec.y;
	return this;
};

/**
 * Adds another vector to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.add(vec2);
 *     vec1.toString();
 *     // => x:30, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

/**
 * Adds the given scalar to both vector axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalar(2);
 *     vec.toString();
 *     // => x: 3, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalar = function (scalar) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

/**
 * Adds the given scalar to the X axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarX(2);
 *     vec.toString();
 *     // => x: 3, y: 2
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarX = function (scalar) {
	this.x += scalar;
	return this;
};

/**
 * Adds the given scalar to the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarY(2);
 *     vec.toString();
 *     // => x: 1, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarY = function (scalar) {
	this.y += scalar;
	return this;
};

/**
 * Subtracts the X axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractX(vec2);
 *     vec1.toString();
 *     // => x:80, y:50
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractX = function (vec) {
	this.x -= vec.x;
	return this;
};

/**
 * Subtracts the Y axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractY(vec2);
 *     vec1.toString();
 *     // => x:100, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractY = function (vec) {
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtract(vec2);
 *     vec1.toString();
 *     // => x:80, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts the given scalar from both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalar(20);
 *     vec.toString();
 *     // => x: 80, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalar = function (scalar) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarX(20);
 *     vec.toString();
 *     // => x: 80, y: 200
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarX = function (scalar) {
	this.x -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarY(20);
 *     vec.toString();
 *     // => x: 100, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarY = function (scalar) {
	this.y -= scalar;
	return this;
};

/**
 * Divides the X axis by the x component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.divideX(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideX = function (vector) {
	this.x /= vector.x;
	return this;
};

/**
 * Divides the Y axis by the y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.divideY(vec2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideY = function (vector) {
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by a axis values of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.divide(vec2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Victor} vector The vector to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divide = function (vector) {
	this.x /= vector.x;
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalar(2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalar = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
		this.y /= scalar;
	} else {
		this.x = 0;
		this.y = 0;
	}

	return this;
};

/**
 * Divides the X axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarX(2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarX = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
	} else {
		this.x = 0;
	}
	return this;
};

/**
 * Divides the Y axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarY(2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarY = function (scalar) {
	if (scalar !== 0) {
		this.y /= scalar;
	} else {
		this.y = 0;
	}
	return this;
};

/**
 * Inverts the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertX();
 *     vec.toString();
 *     // => x:-100, y:50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertX = function () {
	this.x *= -1;
	return this;
};

/**
 * Inverts the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertY();
 *     vec.toString();
 *     // => x:100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertY = function () {
	this.y *= -1;
	return this;
};

/**
 * Inverts both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invert();
 *     vec.toString();
 *     // => x:-100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invert = function () {
	this.invertX();
	this.invertY();
	return this;
};

/**
 * Multiplies the X axis by X component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyX = function (vector) {
	this.x *= vector.x;
	return this;
};

/**
 * Multiplies the Y axis by Y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyY = function (vector) {
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by values from a given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.multiply(vec2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Victor} vector The vector to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiply = function (vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalar(2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Number} The scalar to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalar = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

/**
 * Multiplies the X axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarX(2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarX = function (scalar) {
	this.x *= scalar;
	return this;
};

/**
 * Multiplies the Y axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarY(2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarY = function (scalar) {
	this.y *= scalar;
	return this;
};

/**
 * Normalize
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.normalize = function () {
	var length = this.length();

	if (length === 0) {
		this.x = 1;
		this.y = 0;
	} else {
		this.divide(Victor(length, length));
	}
	return this;
};

Victor.prototype.norm = Victor.prototype.normalize;

/**
 * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.limit(80, 0.9);
 *     vec.toString();
 *     // => x:90, y:50
 *
 * @param {Number} max The maximum value for both x and y axis
 * @param {Number} factor Factor by which the axis are to be multiplied with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.limit = function (max, factor) {
	if (Math.abs(this.x) > max){ this.x *= factor; }
	if (Math.abs(this.y) > max){ this.y *= factor; }
	return this;
};

/**
 * Randomizes both vector axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:67, y:73
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomize = function (topLeft, bottomRight) {
	this.randomizeX(topLeft, bottomRight);
	this.randomizeY(topLeft, bottomRight);

	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:55, y:50
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeX = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.x, bottomRight.x);
	var max = Math.max(topLeft.x, bottomRight.x);
	this.x = random(min, max);
	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:100, y:66
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeY = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.y, bottomRight.y);
	var max = Math.max(topLeft.y, bottomRight.y);
	this.y = random(min, max);
	return this;
};

/**
 * Randomly randomizes either axis between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
 *     vec.toString();
 *     // => x:100, y:77
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
	if (!! Math.round(Math.random())) {
		this.randomizeX(topLeft, bottomRight);
	} else {
		this.randomizeY(topLeft, bottomRight);
	}
	return this;
};

/**
 * Rounds both axis to an integer value
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.unfloat = function () {
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};

/**
 * Rounds both axis to a certain precision
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @param {Number} Precision (default: 8)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.toFixed = function (precision) {
	if (typeof precision === 'undefined') { precision = 8; }
	this.x = this.x.toFixed(precision);
	this.y = this.y.toFixed(precision);
	return this;
};

/**
 * Performs a linear blend / interpolation of the X axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixX(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:100
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixX = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.x = (1 - amount) * this.x + amount * vec.x;
	return this;
};

/**
 * Performs a linear blend / interpolation of the Y axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixY(vec2, 0.5);
 *     vec.toString();
 *     // => x:100, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixY = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.y = (1 - amount) * this.y + amount * vec.y;
	return this;
};

/**
 * Performs a linear blend / interpolation towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mix(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mix = function (vec, amount) {
	this.mixX(vec, amount);
	this.mixY(vec, amount);
	return this;
};

/**
 * # Products
 */

/**
 * Creates a clone of this vector
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = vec1.clone();
 *
 *     vec2.toString();
 *     // => x:10, y:10
 *
 * @return {Victor} A clone of the vector
 * @api public
 */
Victor.prototype.clone = function () {
	return new Victor(this.x, this.y);
};

/**
 * Copies another vector's X component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyX(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:10
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyX = function (vec) {
	this.x = vec.x;
	return this;
};

/**
 * Copies another vector's Y component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyY(vec1);
 *
 *     vec2.toString();
 *     // => x:10, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyY = function (vec) {
	this.y = vec.y;
	return this;
};

/**
 * Copies another vector's X and Y components in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copy(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copy = function (vec) {
	this.copyX(vec);
	this.copyY(vec);
	return this;
};

/**
 * Sets the vector to zero (0,0)
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *		 var1.zero();
 *     vec1.toString();
 *     // => x:0, y:0
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.zero = function () {
	this.x = this.y = 0;
	return this;
};

/**
 * Calculates the dot product of this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.dot(vec2);
 *     // => 23000
 *
 * @param {Victor} vector The second vector
 * @return {Number} Dot product
 * @api public
 */
Victor.prototype.dot = function (vec2) {
	return this.x * vec2.x + this.y * vec2.y;
};

Victor.prototype.cross = function (vec2) {
	return (this.x * vec2.y ) - (this.y * vec2.x );
};

/**
 * Projects a vector onto another vector, setting itself to the result.
 *
 * ### Examples:
 *     var vec = new Victor(100, 0);
 *     var vec2 = new Victor(100, 100);
 *
 *     vec.projectOnto(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want to project this vector onto
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.projectOnto = function (vec2) {
    var coeff = ( (this.x * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
    this.x = coeff * vec2.x;
    this.y = coeff * vec2.y;
    return this;
};


Victor.prototype.horizontalAngle = function () {
	return Math.atan2(this.y, this.x);
};

Victor.prototype.horizontalAngleDeg = function () {
	return radian2degrees(this.horizontalAngle());
};

Victor.prototype.verticalAngle = function () {
	return Math.atan2(this.x, this.y);
};

Victor.prototype.verticalAngleDeg = function () {
	return radian2degrees(this.verticalAngle());
};

Victor.prototype.angle = Victor.prototype.horizontalAngle;
Victor.prototype.angleDeg = Victor.prototype.horizontalAngleDeg;
Victor.prototype.direction = Victor.prototype.horizontalAngle;

Victor.prototype.rotate = function (angle) {
	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

	this.x = nx;
	this.y = ny;

	return this;
};

Victor.prototype.rotateDeg = function (angle) {
	angle = degrees2radian(angle);
	return this.rotate(angle);
};

Victor.prototype.rotateTo = function(rotation) {
	return this.rotate(rotation-this.angle());
};

Victor.prototype.rotateToDeg = function(rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateTo(rotation);
};

Victor.prototype.rotateBy = function (rotation) {
	var angle = this.angle() + rotation;

	return this.rotate(angle);
};

Victor.prototype.rotateByDeg = function (rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateBy(rotation);
};

/**
 * Calculates the distance of the X axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceX(vec2);
 *     // => -100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceX = function (vec) {
	return this.x - vec.x;
};

/**
 * Same as `distanceX()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.absDistanceX(vec2);
 *     // => 100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceX = function (vec) {
	return Math.abs(this.distanceX(vec));
};

/**
 * Calculates the distance of the Y axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => -10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceY = function (vec) {
	return this.y - vec.y;
};

/**
 * Same as `distanceY()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => 10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceY = function (vec) {
	return Math.abs(this.distanceY(vec));
};

/**
 * Calculates the euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distance(vec2);
 *     // => 100.4987562112089
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distance = function (vec) {
	return Math.sqrt(this.distanceSq(vec));
};

/**
 * Calculates the squared euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceSq(vec2);
 *     // => 10100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceSq = function (vec) {
	var dx = this.distanceX(vec),
		dy = this.distanceY(vec);

	return dx * dx + dy * dy;
};

/**
 * Calculates the length or magnitude of the vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.length();
 *     // => 111.80339887498948
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.length = function () {
	return Math.sqrt(this.lengthSq());
};

/**
 * Squared length / magnitude
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.lengthSq();
 *     // => 12500
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.lengthSq = function () {
	return this.x * this.x + this.y * this.y;
};

Victor.prototype.magnitude = Victor.prototype.length;

/**
 * Returns a true if vector is (0, 0)
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.zero();
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
};

/**
 * Returns a true if this vector is the same as another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(100, 50);
 *     vec1.isEqualTo(vec2);
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isEqualTo = function(vec2) {
	return this.x === vec2.x && this.y === vec2.y;
};

/**
 * # Utility Methods
 */

/**
 * Returns an string representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toString();
 *     // => x:10, y:20
 *
 * @return {String}
 * @api public
 */
Victor.prototype.toString = function () {
	return 'x:' + this.x + ', y:' + this.y;
};

/**
 * Returns an array representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toArray();
 *     // => [10, 20]
 *
 * @return {Array}
 * @api public
 */
Victor.prototype.toArray = function () {
	return [ this.x, this.y ];
};

/**
 * Returns an object representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toObject();
 *     // => { x: 10, y: 20 }
 *
 * @return {Object}
 * @api public
 */
Victor.prototype.toObject = function () {
	return { x: this.x, y: this.y };
};


var degrees = 180 / Math.PI;

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function radian2degrees (rad) {
	return rad * degrees;
}

function degrees2radian (deg) {
	return deg / degrees;
}

},{}]},{},[7])(7)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hY2NlbGVyb21ldGVyLmpzIiwianMvYnV0dG9uLmpzIiwianMvY2FudmFzV2lkZ2V0LmpzIiwianMvY29tbXVuaWNhdGlvbi5qcyIsImpzL2RvbVdpZGdldC5qcyIsImpzL2ZpbHRlcnMuanMiLCJqcy9pbmRleC5qcyIsImpzL2pveXN0aWNrLmpzIiwianMva2V5Ym9hcmQuanMiLCJqcy9rbm9iLmpzIiwianMvbWVudS5qcyIsImpzL211bHRpQnV0dG9uLmpzIiwianMvbXVsdGlzbGlkZXIuanMiLCJqcy9wYW5lbC5qcyIsImpzL3NsaWRlci5qcyIsImpzL3RleHRJbnB1dC5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpZGdldC5qcyIsImpzL3dpZGdldExhYmVsLmpzIiwianMveHkuanMiLCJub2RlX21vZHVsZXMvcGVwanMvZGlzdC9wZXAuanMiLCJub2RlX21vZHVsZXMvdmljdG9yL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7O0FBS0EsSUFBTSxnQkFBZ0IsT0FBTyxNQUFQLENBQWUsZ0JBQWYsQ0FBdEI7QUFDQSxJQUFNLHlCQUF5QixPQUEvQjtBQUNBLElBQU0sS0FBSyxvQkFBVSxLQUFWLEVBQVg7O0FBRUEsSUFBSSxPQUFPLFNBQVgsRUFBdUI7QUFDckIsZ0JBQWMsV0FBZCxHQUE0QixDQUFDLEtBQUQsR0FBUyxzQkFBckMsQ0FEcUIsQ0FDd0M7QUFDOUQsZ0JBQWMsV0FBZCxHQUE0QixRQUFRLHNCQUFwQyxDQUZzQixDQUV1QztBQUM3RCxDQUhELE1BR0s7QUFDSixnQkFBYyxXQUFkLEdBQTZCLHNCQUE3QjtBQUNBLGdCQUFjLFdBQWQsR0FBNEIsc0JBQTVCO0FBQ0E7O0FBRUQsY0FBYyxhQUFkLEdBQThCLGNBQWMsV0FBZCxHQUE0QixjQUFjLFdBQXhFOztBQUVBLE9BQU8sTUFB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2g4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBXaWRnZXQgZnJvbSAnLi93aWRnZXQnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuXG4vKipcbiAqIERPTVdpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyBmb3Igd2lkZ2V0cyB0aGF0IHVzZSBIVE1MIGNhbnZhcyBlbGVtZW50cy5cbiAqIEBhdWdtZW50cyBXaWRnZXRcbiAqL1xuXG5jb25zdCBBY2NlbGVyb21ldGVyID0gT2JqZWN0LmNyZWF0ZSggV2lkZ2V0IClcbmNvbnN0IG1ldGVyc1BlclNlY29uZFNxdWFyZWQgPSA5LjgwNjY1XG5jb25zdCBvcyA9IFV0aWxpdGllcy5nZXRPUygpXG5cbmlmKCBvcyAhPT0gJ2FuZHJvaWQnICkge1xuICBBY2NlbGVyb21ldGVyLmhhcmR3YXJlTWluID0gLTIuMzA3ICogbWV0ZXJzUGVyU2Vjb25kU3F1YXJlZCAgLy8gYXMgZm91bmQgaGVyZTogaHR0cDovL3d3dy5pcGhvbmVkZXZzZGsuY29tL2ZvcnVtL2lwaG9uZS1zZGstZGV2ZWxvcG1lbnQvNDgyMi1tYXhpbXVtLWFjY2VsZXJvbWV0ZXItcmVhZGluZy5odG1sXG5cdEFjY2VsZXJvbWV0ZXIuaGFyZHdhcmVNYXggPSAyLjMwNyAqIG1ldGVyc1BlclNlY29uZFNxdWFyZWQgICAvLyAtMSB0byAxIHdvcmtzIG11Y2ggYmV0dGVyIGZvciBkZXZpY2VzIHdpdGhvdXQgZ3lyb3MgdG8gbWVhc3VyZSB0aWx0LCAtMiB0byAyIG11Y2ggYmV0dGVyIHRvIG1lYXN1cmUgZm9yY2Vcbn1lbHNle1xuXHRBY2NlbGVyb21ldGVyLmhhcmR3YXJlTWluICA9IG1ldGVyc1BlclNlY29uZFNxdWFyZWRcblx0QWNjZWxlcm9tZXRlci5oYXJkd2FyZU1heCA9IG1ldGVyc1BlclNlY29uZFNxdWFyZWRcbn1cblxuQWNjZWxlcm9tZXRlci5oYXJkd2FyZVJhbmdlID0gQWNjZWxlcm9tZXRlci5oYXJkd2FyZU1heCAtIEFjY2VsZXJvbWV0ZXIuaGFyZHdhcmVNaW5cblxuT2JqZWN0LmFzc2lnbiggQWNjZWxlcm9tZXRlciwge1xuICB2YWx1ZSA6IFswLDAsMF0sXG4gIF9fdmFsdWU6IFswLDAsMF0sXG4gIF9fcHJldlZhbHVlOiBbMCwwLDBdLFxuXG4gIGNyZWF0ZSgpIHtcbiAgICBjb25zdCBhY2MgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBXaWRnZXQuY3JlYXRlLmNhbGwoIGFjYyApXG4gICAgYWNjLmFkZEV2ZW50cygpXG4gICAgcmV0dXJuIGFjY1xuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2RldmljZW1vdGlvbicsICB0aGlzLnVwZGF0ZS5iaW5kKCB0aGlzICkgKVxuICB9LFxuXG4gIHVwZGF0ZSggZXZlbnQgKSB7XG4gICAgY29uc3QgIGFjY2VsZXJhdGlvbiA9IGV2ZW50LmFjY2VsZXJhdGlvblxuICAgIHRoaXMueCA9IHRoaXMuX192YWx1ZVswXSA9IHRoaXMubWluICsgKCgoKDAgLSB0aGlzLmhhcmR3YXJlTWluKSArIGFjY2VsZXJhdGlvbi54KSAvIHRoaXMuaGFyZHdhcmVSYW5nZSApICogdGhpcy5tYXgpO1xuICAgIHRoaXMueSA9IHRoaXMuX192YWx1ZVsxXSA9IHRoaXMubWluICsgKCgoKDAgLSB0aGlzLmhhcmR3YXJlTWluKSArIGFjY2VsZXJhdGlvbi55KSAvIHRoaXMuaGFyZHdhcmVSYW5nZSApICogdGhpcy5tYXgpO1xuICAgIHRoaXMueiA9IHRoaXMuX192YWx1ZVsyXSA9IHRoaXMubWluICsgKCgoKDAgLSB0aGlzLmhhcmR3YXJlTWluKSArIGFjY2VsZXJhdGlvbi56KSAvIHRoaXMuaGFyZHdhcmVSYW5nZSApICogdGhpcy5tYXgpO1xuXG4gICAgLy9pZih0eXBlb2YgdGhpcy5vbnZhbHVlY2hhbmdlICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vICB0aGlzLm9udmFsdWVjaGFuZ2UodGhpcy54LCB0aGlzLnksIHRoaXMueik7XG4gICAgLy99XG5cbiAgICAvL3RoaXMuc2VuZFRhcmdldE1lc3NhZ2UoKTtcbiAgICB0aGlzLm91dHB1dCgpXG4gIH0sXG5cbn0sIHtcbiAgeDowLFxuICB5OjAsXG4gIHo6MCxcbiAgbWluOiAwLFxuICBtYXg6IDFcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEFjY2VsZXJvbWV0ZXIgXG5cbi8qXG5JbnRlcmZhY2UuQWNjZWxlcm9tZXRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBtZXRlcnNQZXJTZWNvbmRTcXVhcmVkID0gOS44MDY2NTtcblxuICBJbnRlcmZhY2UuZXh0ZW5kKHRoaXMsIHtcbiAgICB0eXBlOlwiQWNjZWxlcm9tZXRlclwiLFxuXG4gICAgc2VyaWFsaXplTWUgOiBbXCJkZWxheVwiXSxcbiAgICBkZWxheSA6IDEwMCwgLy8gbWVhc3VyZWQgaW4gbXNcbiAgICBtaW46IDAsXG4gICAgbWF4OiAxLFxuICAgIHZhbHVlcyA6IFswLDAsMF0sXG5cbiAgICB1cGRhdGUgOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGFjY2VsZXJhdGlvbiA9IGV2ZW50LmFjY2VsZXJhdGlvbjtcbiAgICAgIHNlbGYueCA9IHNlbGYudmFsdWVzWzBdID0gc2VsZi5taW4gKyAoKCgoMCAtIHNlbGYuaGFyZHdhcmVNaW4pICsgYWNjZWxlcmF0aW9uLngpIC8gc2VsZi5oYXJkd2FyZVJhbmdlICkgKiBzZWxmLm1heCk7XG4gICAgICBzZWxmLnkgPSBzZWxmLnZhbHVlc1sxXSA9IHNlbGYubWluICsgKCgoKDAgLSBzZWxmLmhhcmR3YXJlTWluKSArIGFjY2VsZXJhdGlvbi55KSAvIHNlbGYuaGFyZHdhcmVSYW5nZSApICogc2VsZi5tYXgpO1xuICAgICAgc2VsZi56ID0gc2VsZi52YWx1ZXNbMl0gPSBzZWxmLm1pbiArICgoKCgwIC0gc2VsZi5oYXJkd2FyZU1pbikgKyBhY2NlbGVyYXRpb24ueikgLyBzZWxmLmhhcmR3YXJlUmFuZ2UgKSAqIHNlbGYubWF4KTtcblxuICAgICAgaWYodHlwZW9mIHNlbGYub252YWx1ZWNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2VsZi5vbnZhbHVlY2hhbmdlKHNlbGYueCwgc2VsZi55LCBzZWxmLnopO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnNlbmRUYXJnZXRNZXNzYWdlKCk7XG4gICAgfSxcbiAgICBzdGFydCA6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMudXBkYXRlLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc3RvcCA6IGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMudXBkYXRlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gIH0pXG4gIC5pbml0KCBhcmd1bWVudHNbMF0gKTtcblxuXHRpZighSW50ZXJmYWNlLmlzQW5kcm9pZCkge1xuXHQgICAgdGhpcy5oYXJkd2FyZU1pbiA9IC0yLjMwNyAqIG1ldGVyc1BlclNlY29uZFNxdWFyZWQ7ICAvLyBhcyBmb3VuZCBoZXJlOiBodHRwOi8vd3d3LmlwaG9uZWRldnNkay5jb20vZm9ydW0vaXBob25lLXNkay1kZXZlbG9wbWVudC80ODIyLW1heGltdW0tYWNjZWxlcm9tZXRlci1yZWFkaW5nLmh0bWxcblx0ICAgIHRoaXMuaGFyZHdhcmVNYXggPSAyLjMwNyAqIG1ldGVyc1BlclNlY29uZFNxdWFyZWQ7ICAgLy8gLTEgdG8gMSB3b3JrcyBtdWNoIGJldHRlciBmb3IgZGV2aWNlcyB3aXRob3V0IGd5cm9zIHRvIG1lYXN1cmUgdGlsdCwgLTIgdG8gMiBtdWNoIGJldHRlciB0byBtZWFzdXJlIGZvcmNlXG5cdH1lbHNle1xuXHQgICAgdGhpcy5oYXJkd2FyZU1pbiA9IG1ldGVyc1BlclNlY29uZFNxdWFyZWQ7XG5cdCAgICB0aGlzLmhhcmR3YXJlTWF4ID0gbWV0ZXJzUGVyU2Vjb25kU3F1YXJlZDtcblx0fVxuXG4gIHRoaXMuaGFyZHdhcmVSYW5nZSA9IHRoaXMuaGFyZHdhcmVNYXggLSB0aGlzLmhhcmR3YXJlTWluO1xufTtcbkludGVyZmFjZS5BY2NlbGVyb21ldGVyLnByb3RvdHlwZSA9IEludGVyZmFjZS5XaWRnZXQ7XG4qL1xuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldCdcblxuLyoqXG4gKiBBIEJ1dHRvbiB3aXRoIHRocmVlIGRpZmZlcmVudCBzdHlsZXM6ICdtb21lbnRhcnknIHRyaWdnZXJzIGEgZmxhc2ggYW5kIGluc3RhbmVvdXMgb3V0cHV0LCBcbiAqICdob2xkJyBvdXRwdXRzIHRoZSBidXR0b25zIG1heGltdW0gdmFsdWUgdW50aWwgaXQgaXMgcmVsZWFzZWQsIGFuZCAndG9nZ2xlJyBhbHRlcm5hdGVzIFxuICogYmV0d2VlbiBvdXRwdXR0aW5nIG1heGltdW0gYW5kIG1pbmltdW0gdmFsdWVzIG9uIHByZXNzLiBcbiAqIFxuICogQG1vZHVsZSBCdXR0b25cbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IEJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIEJ1dHRvbiwge1xuXG4gIC8qKiBAbGVuZHMgQnV0dG9uLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgQnV0dG9uIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6MCxcbiAgICB2YWx1ZTowLFxuICAgIGFjdGl2ZTogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlICdtb21lbnRhcnknLCAnaG9sZCcsIG9yICd0b2dnbGUnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgaW50ZXJhY3Rpb24gb2YgdGhlIEJ1dHRvbiBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICd0b2dnbGUnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBCdXR0b24gaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBCdXR0b25cbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIGEgQnV0dG9uIGluc3RhbmNlIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IGJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggYnV0dG9uIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGJ1dHRvbiwgQnV0dG9uLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcHMudmFsdWUgKSBidXR0b24uX192YWx1ZSA9IHByb3BzLnZhbHVlXG5cbiAgICBidXR0b24uaW5pdCgpXG5cbiAgICByZXR1cm4gYnV0dG9uXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEJ1dHRvbiBpbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eSBhbmQgYnV0dG9uIHN0eWxlLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuX192YWx1ZSA9PT0gMSA/IHRoaXMuZmlsbCA6IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgLy8gb25seSBob2xkIG5lZWRzIHRvIGxpc3RlbiBmb3IgcG9pbnRlcnVwIGV2ZW50czsgdG9nZ2xlIGFuZCBtb21lbnRhcnkgb25seSBjYXJlIGFib3V0IHBvaW50ZXJkb3duXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG5cbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAndG9nZ2xlJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gdGhpcy5fX3ZhbHVlID09PSAxID8gMCA6IDFcbiAgICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnbW9tZW50YXJ5JyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMVxuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+IHsgdGhpcy5fX3ZhbHVlID0gMDsgdGhpcy5kcmF3KCkgfSwgNTAgKVxuICAgICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMVxuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLm91dHB1dCgpXG5cbiAgICAgIHRoaXMuZHJhdygpXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgJiYgdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKVxuXG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDBcbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICAgIHRoaXMuZHJhdygpXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCBCdXR0b25cbiIsImltcG9ydCBET01XaWRnZXQgZnJvbSAnLi9kb21XaWRnZXQnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuaW1wb3J0IFdpZGdldExhYmVsIGZyb20gJy4vd2lkZ2V0TGFiZWwnXG5cbi8qKlxuICogQ2FudmFzV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIGZvciB3aWRnZXRzIHRoYXQgdXNlIEhUTUwgY2FudmFzIGVsZW1lbnRzLlxuICogQG1vZHVsZSBDYW52YXNXaWRnZXRcbiAqIEBhdWdtZW50cyBET01XaWRnZXRcbiAqLyBcblxubGV0IENhbnZhc1dpZGdldCA9IE9iamVjdC5jcmVhdGUoIERPTVdpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIENhbnZhc1dpZGdldCwge1xuICAvKiogQGxlbmRzIENhbnZhc1dpZGdldC5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBjb2xvcnMgYW5kIGNhbnZhcyBjb250ZXh0IHByb3BlcnRpZXMgZm9yIHVzZSBpbiBDYW52YXNXaWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBiYWNrZ3JvdW5kOicjODg4JyxcbiAgICBmaWxsOicjYWFhJyxcbiAgICBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsLjMpJyxcbiAgICBsaW5lV2lkdGg6NCxcbiAgICBkZWZhdWx0TGFiZWw6IHtcbiAgICAgIHg6LjUsIHk6LjUsIGFsaWduOidjZW50ZXInLCB3aWR0aDoxLCB0ZXh0OidkZW1vJ1xuICAgIH0sXG4gICAgc2hvdWxkRGlzcGxheVZhbHVlOmZhbHNlXG4gIH0sXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgQ2FudmFzV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgc2hvdWxkVXNlVG91Y2ggPSBVdGlsaXRpZXMuZ2V0TW9kZSgpID09PSAndG91Y2gnXG4gICAgXG4gICAgRE9NV2lkZ2V0LmNyZWF0ZS5jYWxsKCB0aGlzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIENhbnZhc1dpZGdldC5kZWZhdWx0cyApXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgY2FudmFzIDJEIGNvbnRleHQuXG4gICAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9XG4gICAgICovXG4gICAgdGhpcy5jdHggPSB0aGlzLmVsZW1lbnQuZ2V0Q29udGV4dCggJzJkJyApXG5cbiAgICB0aGlzLmFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoIClcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgdGhlIGNhbnZhcyBlbGVtZW50IHVzZWQgYnkgdGhlIHdpZGdldCBhbmQgc2V0XG4gICAqIHNvbWUgZGVmYXVsdCBDU1MgdmFsdWVzLlxuICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApXG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICd0b3VjaC1hY3Rpb24nLCAnbm9uZScgKVxuICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ICA9ICdibG9jaydcbiAgICBcbiAgICByZXR1cm4gZWxlbWVudFxuICB9LFxuXG4gIGFwcGx5SGFuZGxlcnMoIHNob3VsZFVzZVRvdWNoPWZhbHNlICkge1xuICAgIGxldCBoYW5kbGVycyA9IHNob3VsZFVzZVRvdWNoID8gQ2FudmFzV2lkZ2V0LmhhbmRsZXJzLnRvdWNoIDogQ2FudmFzV2lkZ2V0LmhhbmRsZXJzLm1vdXNlXG4gICAgXG4gICAgLy8gd2lkZ2V0cyBoYXZlIGlqcyBkZWZpbmVkIGhhbmRsZXJzIHN0b3JlZCBpbiB0aGUgX2V2ZW50cyBhcnJheSxcbiAgICAvLyBhbmQgdXNlci1kZWZpbmVkIGV2ZW50cyBzdG9yZWQgd2l0aCAnb24nIHByZWZpeGVzIChlLmcuIG9uY2xpY2ssIG9ubW91c2Vkb3duKVxuICAgIGZvciggbGV0IGhhbmRsZXJOYW1lIG9mIGhhbmRsZXJzICkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoIGhhbmRsZXJOYW1lLCBldmVudCA9PiB7XG4gICAgICAgIGlmKCB0eXBlb2YgdGhpc1sgJ29uJyArIGhhbmRsZXJOYW1lIF0gID09PSAnZnVuY3Rpb24nICApIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdKCBldmVudCApXG4gICAgICB9KVxuICAgIH1cblxuICB9LFxuXG4gIGhhbmRsZXJzOiB7XG4gICAgbW91c2U6IFtcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgJ21vdXNlZG93bicsXG4gICAgXSxcbiAgICB0b3VjaDogW11cbiAgfSxcblxuICBhZGRMYWJlbCgpIHtcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGN0eDogdGhpcy5jdHggfSwgdGhpcy5sYWJlbCB8fCB0aGlzLmRlZmF1bHRMYWJlbCApLFxuICAgICAgICBsYWJlbCA9IFdpZGdldExhYmVsLmNyZWF0ZSggcHJvcHMgKVxuXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsXG4gICAgdGhpcy5fZHJhdyA9IHRoaXMuZHJhd1xuICAgIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fZHJhdygpXG4gICAgICB0aGlzLmxhYmVsLmRyYXcoKVxuICAgIH1cbiAgfSxcblxuICBfX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAgIHRoaXMuY29udGFpbmVyID0gcGFuZWxcblxuICAgIGlmKCB0eXBlb2YgdGhpcy5hZGRFdmVudHMgPT09ICdmdW5jdGlvbicgKSB0aGlzLmFkZEV2ZW50cygpXG5cbiAgICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIHRoaXMucGxhY2UoKSBcblxuICAgIGlmKCB0aGlzLmxhYmVsIHx8IHRoaXMuc2hvdWxkRGlzcGxheVZhbHVlICkgdGhpcy5hZGRMYWJlbCgpXG4gICAgaWYoIHRoaXMuc2hvdWxkRGlzcGxheVZhbHVlICkge1xuICAgICAgdGhpcy5fX3Bvc3RmaWx0ZXJzLnB1c2goICggdmFsdWUgKSA9PiB7IFxuICAgICAgICB0aGlzLmxhYmVsLnRleHQgPSB2YWx1ZS50b0ZpeGVkKCA1IClcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLmRyYXcoKSAgICAgXG5cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQ2FudmFzV2lkZ2V0XG4iLCJpbXBvcnQgV2lkZ2V0IGZyb20gJy4vd2lkZ2V0J1xuXG5sZXQgQ29tbXVuaWNhdGlvbiA9IHtcbiAgU29ja2V0IDogbnVsbCxcbiAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5Tb2NrZXQgPSBuZXcgV2ViU29ja2V0KCB0aGlzLmdldFNlcnZlckFkZHJlc3MoKSApXG4gICAgdGhpcy5Tb2NrZXQub25tZXNzYWdlID0gdGhpcy5vbm1lc3NhZ2VcblxuICAgIGxldCBmdWxsTG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSxcbiAgICAgICAgbG9jYXRpb25TcGxpdCA9IGZ1bGxMb2NhdGlvbi5zcGxpdCggJy8nICksXG4gICAgICAgIGludGVyZmFjZU5hbWUgPSBsb2NhdGlvblNwbGl0WyBsb2NhdGlvblNwbGl0Lmxlbmd0aCAtIDEgXVxuICAgIFxuICAgIHRoaXMuU29ja2V0Lm9ub3BlbiA9ICgpPT4ge1xuICAgICAgdGhpcy5Tb2NrZXQuc2VuZCggSlNPTi5zdHJpbmdpZnkoeyB0eXBlOidtZXRhJywgaW50ZXJmYWNlTmFtZSwga2V5OidyZWdpc3RlcicgfSkgKVxuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gIH0sXG5cbiAgZ2V0U2VydmVyQWRkcmVzcygpIHtcbiAgICBsZXQgZXhwciwgc29ja2V0SVBBbmRQb3J0LCBzb2NrZXRTdHJpbmcsIGlwLCBwb3J0XG5cbiAgICBleHByID0gL1stYS16QS1aMC05Ll0rKDooNjU1M1swLTVdfDY1NVswLTJdXFxkfDY1WzAtNF1cXGR7Mn18NlswLTRdXFxkezN9fFsxLTVdXFxkezR9fFsxLTldXFxkezAsM30pKS9cblxuICAgIHNvY2tldElQQW5kUG9ydCA9IGV4cHIuZXhlYyggd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCkgKVsgMCBdLnNwbGl0KCAnOicgKVxuICAgIGlwID0gc29ja2V0SVBBbmRQb3J0WyAwIF1cbiAgICBwb3J0ID0gcGFyc2VJbnQoIHNvY2tldElQQW5kUG9ydFsgMSBdIClcblxuICAgIHNvY2tldFN0cmluZyA9IGB3czovLyR7aXB9OiR7cG9ydH1gXG5cbiAgICByZXR1cm4gc29ja2V0U3RyaW5nXG4gIH0sXG5cbiAgb25tZXNzYWdlKCBlICkge1xuICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSggZS5kYXRhIClcbiAgICBpZiggZGF0YS50eXBlID09PSAnb3NjJyApIHtcbiAgICAgIENvbW11bmljYXRpb24uT1NDLnJlY2VpdmUoIGUuZGF0YSApO1xuICAgIH1lbHNlIHtcbiAgICAgIGlmKCBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlICkge1xuICAgICAgICBDb21tdW5pY2F0aW9uLlNvY2tldC5yZWNlaXZlKCBkYXRhLmFkZHJlc3MsIGRhdGEucGFyYW1ldGVycyAgKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBPU0MgOiB7XG4gICAgY2FsbGJhY2tzOiB7fSxcbiAgICBvbm1lc3NhZ2U6IG51bGwsXG5cbiAgICBzZW5kKCBhZGRyZXNzLCBwYXJhbWV0ZXJzICkge1xuICAgICAgaWYoIENvbW11bmljYXRpb24uU29ja2V0LnJlYWR5U3RhdGUgPT09IDEgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgbGV0IG1zZyA9IHtcbiAgICAgICAgICAgIHR5cGUgOiBcIm9zY1wiLFxuICAgICAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgICAgICdwYXJhbWV0ZXJzJzogQXJyYXkuaXNBcnJheSggcGFyYW1ldGVycyApID8gcGFyYW1ldGVycyA6IFsgcGFyYW1ldGVycyBdLFxuICAgICAgICAgIH1cblxuICAgICAgICAgIENvbW11bmljYXRpb24uU29ja2V0LnNlbmQoIEpTT04uc3RyaW5naWZ5KCBtc2cgKSApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRocm93IEVycm9yKCAnSW52YWxpZCBvc2MgbWVzc2FnZTonLCBhcmd1bWVudHMgKSAgIFxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgRXJyb3IoICdTb2NrZXQgaXMgbm90IHlldCBjb25uZWN0ZWQ7IGNhbm5vdCBzZW5kIE9TQyBtZXNzc2FnZXMuJyApXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgcmVjZWl2ZSggZGF0YSApIHtcbiAgICAgIGxldCBtc2cgPSBKU09OLnBhcnNlKCBkYXRhIClcblxuICAgICAgaWYoIG1zZy5hZGRyZXNzIGluIHRoaXMuY2FsbGJhY2tzICkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1sgbXNnLmFkZHJlc3MgXSggbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGZvciggbGV0IHdpZGdldCBvZiBXaWRnZXQud2lkZ2V0cyApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCBcIkNIRUNLXCIsIGNoaWxkLmtleSwgbXNnLmFkZHJlc3MgKVxuICAgICAgICAgIGlmKCB3aWRnZXQua2V5ID09PSBtc2cuYWRkcmVzcyApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIGNoaWxkLmtleSwgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICAgICAgd2lkZ2V0LnNldFZhbHVlLmFwcGx5KCB3aWRnZXQsIG1zZy5wYXJhbWV0ZXJzIClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfSAgICBcblxuICAgICAgICBpZiggdGhpcy5vbm1lc3NhZ2UgIT09IG51bGwgKSB7IFxuICAgICAgICAgIHRoaXMucmVjZWl2ZSggbXNnLmFkZHJlc3MsIG1zZy50eXBldGFncywgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tbXVuaWNhdGlvblxuIiwiaW1wb3J0IFdpZGdldCBmcm9tICcuL3dpZGdldCdcbmltcG9ydCBVdGlsaXRpZXMgZnJvbSAnLi91dGlsaXRpZXMnXG5cbi8qKlxuICogRE9NV2lkZ2V0IGlzIHRoZSBiYXNlIGNsYXNzIGZvciB3aWRnZXRzIHRoYXQgdXNlIEhUTUwgY2FudmFzIGVsZW1lbnRzLlxuICogQGF1Z21lbnRzIFdpZGdldFxuICovXG5cbmxldCBET01XaWRnZXQgPSBPYmplY3QuY3JlYXRlKCBXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBET01XaWRnZXQsIHtcbiAgLyoqIEBsZW5kcyBET01XaWRnZXQucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBET01XaWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICB4OjAseTowLHdpZHRoOi4yNSxoZWlnaHQ6LjI1LFxuICAgIGF0dGFjaGVkOmZhbHNlLFxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgRE9NV2lkZ2V0IGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCkge1xuICAgIGxldCBzaG91bGRVc2VUb3VjaCA9IFV0aWxpdGllcy5nZXRNb2RlKCkgPT09ICd0b3VjaCdcbiAgICBcbiAgICBXaWRnZXQuY3JlYXRlLmNhbGwoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdGhpcywgRE9NV2lkZ2V0LmRlZmF1bHRzIClcblxuICAgIC8vIEFMTCBJTlNUQU5DRVMgT0YgRE9NV0lER0VUIE1VU1QgSU1QTEVNRU5UIENSRUFURSBFTEVNRU5UXG4gICAgaWYoIHR5cGVvZiB0aGlzLmNyZWF0ZUVsZW1lbnQgPT09ICdmdW5jdGlvbicgKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIERPTSBlbGVtZW50IHVzZWQgYnkgdGhlIERPTVdpZGdldFxuICAgICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAgICogQGluc3RhbmNlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY3JlYXRlRWxlbWVudCgpXG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICd3aWRnZXQgaW5oZXJpdGluZyBmcm9tIERPTVdpZGdldCBkb2VzIG5vdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCBtZXRob2Q7IHRoaXMgaXMgcmVxdWlyZWQuJyApXG4gICAgfVxuICB9LFxuICBcbiAgLyoqXG4gICAqIENyZWF0ZSBhIERPTSBlbGVtZW50IHRvIGJlIHBsYWNlZCBpbiBhIFBhbmVsLlxuICAgKiBAdmlydHVhbFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgdGhyb3cgRXJyb3IoICdhbGwgc3ViY2xhc3NlcyBvZiBET01XaWRnZXQgbXVzdCBpbXBsZW1lbnQgY3JlYXRlRWxlbWVudCgpJyApXG4gIH0sXG5cbiAgLyoqXG4gICAqIHVzZSBDU1MgdG8gcG9zaXRpb24gZWxlbWVudCBlbGVtZW50IG9mIHdpZGdldFxuICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAqL1xuICBwbGFjZSgpIHtcbiAgICBsZXQgY29udGFpbmVyV2lkdGggPSB0aGlzLmNvbnRhaW5lci5nZXRXaWR0aCgpLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ9IHRoaXMuY29udGFpbmVyLmdldEhlaWdodCgpLFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICA8PSAxID8gY29udGFpbmVyV2lkdGggICogdGhpcy53aWR0aCA6IHRoaXMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0IDw9IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLmhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHggICAgICA9IHRoaXMueCA8IDEgPyBjb250YWluZXJXaWR0aCAgKiB0aGlzLnggOiB0aGlzLngsXG4gICAgICAgIHkgICAgICA9IHRoaXMueSA8IDEgPyBjb250YWluZXJIZWlnaHQgKiB0aGlzLnkgOiB0aGlzLnlcblxuICAgIGlmKCAhdGhpcy5hdHRhY2hlZCApIHtcbiAgICAgIHRoaXMuYXR0YWNoZWQgPSB0cnVlXG4gICAgfVxuICBcbiAgICBpZiggdGhpcy5pc1NxdWFyZSApIHtcbiAgICAgIGlmKCBoZWlnaHQgPiB3aWR0aCApIHtcbiAgICAgICAgaGVpZ2h0ID0gd2lkdGhcbiAgICAgIH1lbHNle1xuICAgICAgICB3aWR0aCA9IGhlaWdodFxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZWxlbWVudC53aWR0aCAgPSB3aWR0aFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArICdweCdcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wICA9IHkgKyAncHgnXG5cbiAgICAvKipcbiAgICAgKiBCb3VuZGluZyBib3gsIGluIGFic29sdXRlIGNvb3JkaW5hdGVzLCBvZiB0aGUgRE9NV2lkZ2V0XG4gICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5yZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLm9ucGxhY2UgPT09ICdmdW5jdGlvbicgKSB0aGlzLm9ucGxhY2UoKVxuICB9LFxuICBcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IERPTVdpZGdldFxuIiwibGV0IEZpbHRlcnMgPSB7XG4gIFNjYWxlKCBpbm1pbj0wLCBpbm1heD0xLCBvdXRtaW49LTEsIG91dG1heD0xICkge1xuICAgIGxldCBpbnJhbmdlICA9IGlubWF4IC0gaW5taW4sXG4gICAgICAgIG91dHJhbmdlID0gb3V0bWF4IC0gb3V0bWluLFxuICAgICAgICByYW5nZVJhdGlvID0gb3V0cmFuZ2UgLyBpbnJhbmdlXG5cbiAgICByZXR1cm4gaW5wdXQgPT4gb3V0bWluICsgaW5wdXQgKiByYW5nZVJhdGlvXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnNcbiIsIi8vIEV2ZXJ5dGhpbmcgd2UgbmVlZCB0byBpbmNsdWRlIGdvZXMgaGVyZSBhbmQgaXMgZmVkIHRvIGJyb3dzZXJpZnkgaW4gdGhlIGd1bHBmaWxlLmpzXG5cbmltcG9ydCBQYW5lbCBmcm9tICcuL3BhbmVsJ1xuaW1wb3J0IFNsaWRlciBmcm9tICcuL3NsaWRlcidcbmltcG9ydCBKb3lzdGljayBmcm9tICcuL2pveXN0aWNrJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuL2J1dHRvbidcbmltcG9ydCBNZW51IGZyb20gJy4vbWVudSdcbmltcG9ydCBUZXh0SW5wdXQgZnJvbSAnLi90ZXh0SW5wdXQnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24nXG5pbXBvcnQgUEVQIGZyb20gJ3BlcGpzJ1xuaW1wb3J0IEtub2IgZnJvbSAnLi9rbm9iJ1xuaW1wb3J0IE11bHRpU2xpZGVyIGZyb20gJy4vbXVsdGlzbGlkZXInXG5pbXBvcnQgTXVsdGlCdXR0b24gZnJvbSAnLi9tdWx0aUJ1dHRvbidcbmltcG9ydCBLZXlib2FyZCBmcm9tICcuL2tleWJvYXJkJ1xuaW1wb3J0IFhZIGZyb20gJy4veHknXG5pbXBvcnQgQWNjZWxlcm9tZXRlciBmcm9tICcuL2FjY2VsZXJvbWV0ZXInXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuXG5leHBvcnQge1xuICBBY2NlbGVyb21ldGVyLFxuICBQYW5lbCwgXG4gIFNsaWRlciwgXG4gIEpveXN0aWNrLCBcbiAgQnV0dG9uLCBcbiAgTWVudSwgXG4gIFRleHRJbnB1dCxcbiAgQ29tbXVuaWNhdGlvbiwgXG4gIEtub2IsIFxuICBNdWx0aVNsaWRlciwgXG4gIE11bHRpQnV0dG9uLCBcbiAgS2V5Ym9hcmQsXG4gIFhZLFxuICBVdGlsaXRpZXNcbn1cbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBqb3lzdGljayB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlbGVjdCBhbiBYWSBwb3NpdGlvbiBhbmQgdGhlbiBzbmFwcyBiYWNrLiBcbiAqIEBtb2R1bGUgSm95c3RpY2tcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IEpveXN0aWNrID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIEpveXN0aWNrLCB7XG4gIC8qKiBAbGVuZHMgSm95c3RpY2sucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBKb3lzdGljayBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6Wy41LC41XSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTpbLjUsLjVdLCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEpveXN0aWNrIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIFNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBqb3lzdGljayA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggU2xpZGVyIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBqb3lzdGljayApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIGpveXN0aWNrLCBKb3lzdGljay5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBqb3lzdGljay5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIGpveXN0aWNrLmluaXQoKVxuXG4gICAgcmV0dXJuIGpveXN0aWNrXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEpveXN0aWNrIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBwZXJwX25vcm1fdmVjdG9yKHZhbHVlKSB7XG4gICAgbGV0IHgxID0gdmFsdWVbMF0tLjVcbiAgICBsZXQgeTEgPSB2YWx1ZVsxXS0uNVxuICAgIGxldCB4MiA9IDAuMFxuICAgIGxldCB5MiA9IC0oeDEveTEpKih4Mi14MSkreTFcbiAgICBsZXQgeDMgPSB4Mi14MVxuICAgIGxldCB5MyA9IHkyLXkxXG4gICAgbGV0IG0gPSBNYXRoLnNxcnQoeDMqeDMreTMqeTMpXG4gICAgeDMgPSB4My9tXG4gICAgeTMgPSB5My9tXG5cbiAgICByZXR1cm4gW3gzLHkzXVxuICB9LFxuXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgbGV0IHYgPSB0aGlzLnBlcnBfbm9ybV92ZWN0b3IodGhpcy5fX3ZhbHVlKVxuICAgIGxldCByID0gMTUuMFxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHgubW92ZVRvKHRoaXMucmVjdC53aWR0aCowLjUgKyByKnZbMF0qLjI1LHRoaXMucmVjdC5oZWlnaHQqLjUgKyByKnZbMV0qLjI1KTtcbiAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5yZWN0LndpZHRoICp0aGlzLl9fdmFsdWVbMF0rcip2WzBdLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWzFdK3IqdlsxXSk7XG4gICAgdGhpcy5jdHgubGluZVRvKHRoaXMucmVjdC53aWR0aCAqdGhpcy5fX3ZhbHVlWzBdLXIqdlswXSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsxXS1yKnZbMV0pO1xuICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLnJlY3Qud2lkdGgqMC41IC0gcip2WzBdKi4yNSx0aGlzLnJlY3QuaGVpZ2h0Ki41IC0gcip2WzFdKi4yNSk7XG4gICAgdGhpcy5jdHguZmlsbCgpO1xuICAvLyAgdGhpcy5jdHguZmlsbFJlY3QoIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZVswXSAtMTIsIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWVbMV0gLTEyLCAyNCwgMjQgKVxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LmFyYyh0aGlzLnJlY3Qud2lkdGggKnRoaXMuX192YWx1ZVswXSx0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWzFdLHIsMCwyKk1hdGguUEkpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcblxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHguYXJjKHRoaXMucmVjdC53aWR0aCAqMC41LHRoaXMucmVjdC5oZWlnaHQgKiAwLjUsciouMjUsMCwyKk1hdGguUEkpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcblxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBzbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICAgIHRoaXMuX192YWx1ZSA9IFsuNSwuNV1cbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBKb3lzdGljaydzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcblxuICAgIHRoaXMuX192YWx1ZVswXSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIHRoaXMuX192YWx1ZVsxXSA9ICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgXG5cbiAgICAvLyBjbGFtcCBfX3ZhbHVlLCB3aGljaCBpcyBvbmx5IHVzZWQgaW50ZXJuYWxseVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPiAxICkgdGhpcy5fX3ZhbHVlWzBdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPiAxICkgdGhpcy5fX3ZhbHVlWzFdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPCAwICkgdGhpcy5fX3ZhbHVlWzBdID0gMFxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPCAwICkgdGhpcy5fX3ZhbHVlWzFdID0gMFxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBKb3lzdGlja1xuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcbmltcG9ydCBVdGlsaXRpZXMgICAgZnJvbSAnLi91dGlsaXRpZXMuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgS2V5c1xuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5jb25zdCBLZXlzID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbmNvbnN0IGtleVR5cGVzRm9yTm90ZSA9IHtcbiAgYzogICAgICd3UmlnaHQnLFxuICAnYyMnOiAgJ2InLFxuICBkYjogICAgJ2InLFxuICBkOiAgICAgJ3dNaWRkbGUnLFxuICAnZCMnOiAgJ2InLFxuICBlYjogICAgJ2InLFxuICBlOiAgICAgJ3dMZWZ0JyxcbiAgZjogICAgICd3UmlnaHQnLFxuICAnZiMnOiAgJ2InLFxuICBnYjogICAgJ2InLFxuICBnOiAgICAgJ3dNaWRkbGVSJyxcbiAgJ2cjJzogICdiJyxcbiAgYWI6ICAgICdiJyxcbiAgYTogICAgICd3TWlkZGxlTCcsXG4gICdhIyc6ICAnYicsXG4gIGJiOiAgICAnYicsXG4gIGI6ICAgICAnd0xlZnQnIFxufSBcblxuY29uc3Qgbm90ZUludGVnZXJzID0gW1xuICAnYycsJ2RiJywnZCcsJ2ViJywnZScsJ2YnLCdnYicsJ2cnLCdhYicsJ2EnLCdiYicsJ2InXG5dXG5cbmNvbnN0IGtleUNvbG9ycyA9IFtcbiAgMSwwLDEsMCwxLDEsMCwxLDAsMSwwLDFcbl1cblxuXG5PYmplY3QuYXNzaWduKCBLZXlzLCB7XG4gIC8qKiBAbGVuZHMgS2V5cy5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEtleXMgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEtleXNcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIGFjdGl2ZTogICAgIGZhbHNlLFxuICAgIHN0YXJ0S2V5OiAgIDM2LFxuICAgIGVuZEtleTogICAgIDYwLFxuICAgIHdoaXRlQ29sb3I6ICcjZmZmJyxcbiAgICBibGFja0NvbG9yOiAnIzAwMCcsXG4gICAgZm9sbG93TW91c2U6IHRydWUsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBLZXlzIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgS2V5c1xuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgS2V5cyB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBrZXlzID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBLZXlzIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBrZXlzIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggXG4gICAgICBrZXlzLCBcbiAgICAgIEtleXMuZGVmYXVsdHMsIFxuICAgICAgcHJvcHMsIFxuICAgICAgeyBcbiAgICAgICAgdmFsdWU6e30sIFxuICAgICAgICBfX3ZhbHVlOnt9LCBcbiAgICAgICAgYm91bmRzOltdLCBcbiAgICAgICAgYWN0aXZlOnt9LFxuICAgICAgICBfX3ByZXZWYWx1ZTpbXSxcbiAgICAgICAgX19sYXN0S2V5Om51bGxcbiAgICAgIH1cbiAgICApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIGtleXMuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBrZXlzLmluaXQoKVxuXG4gICAgZm9yKCBsZXQgaSA9IGtleXMuc3RhcnRLZXk7IGkgPCBrZXlzLmVuZEtleTsgaSsrICkge1xuICAgICAga2V5cy5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgICBrZXlzLnZhbHVlWyBpIF0gPSAwXG4gICAgICBrZXlzLmJvdW5kc1sgaSBdID0gW11cbiAgICB9XG5cbiAgICBrZXlzLm9ucGxhY2UgPSAoKSA9PiBrZXlzLl9fZGVmaW5lQm91bmRzKClcblxuICAgIHJldHVybiBrZXlzXG4gIH0sXG5cbiAgX19kZWZpbmVCb3VuZHMoKSB7XG4gICAgY29uc3Qga2V5UmFuZ2UgPSB0aGlzLmVuZEtleSAtIHRoaXMuc3RhcnRLZXlcbiAgICBjb25zdCByZWN0ID0gdGhpcy5yZWN0XG4gICAgY29uc3Qga2V5V2lkdGggPSAocmVjdC53aWR0aCAvIGtleVJhbmdlKSAqIDEuNzI1XG4gICAgY29uc3QgYmxhY2tIZWlnaHQgPSAuNjUgKiByZWN0LmhlaWdodFxuXG4gICAgbGV0IGN1cnJlbnRYID0gMFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBrZXlSYW5nZTsgaSsrICkge1xuICAgICAgbGV0IGJvdW5kcyA9IHRoaXMuYm91bmRzWyB0aGlzLnN0YXJ0S2V5ICsgaSBdXG4gICAgICBsZXQgbm90ZU51bWJlciA9ICggdGhpcy5zdGFydEtleSArIGkgKSAlIDEyXG4gICAgICBsZXQgbm90ZU5hbWUgICA9IG5vdGVJbnRlZ2Vyc1sgbm90ZU51bWJlciBdXG4gICAgICBsZXQgbm90ZURyYXdUeXBlID0ga2V5VHlwZXNGb3JOb3RlWyBub3RlTmFtZSBdXG4gICAgICBcbiAgICAgIHN3aXRjaCggbm90ZURyYXdUeXBlICkge1xuICAgICAgICBjYXNlICd3UmlnaHQnOiAvLyBDLCBGXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNiwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjYsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTowIH0pXG5cbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC42XG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdiJzogLy8gYWxsIGZsYXRzIGFuZCBzaGFycHNcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC42LCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNiwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OjAgfSlcblxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoICogLjRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgJ3dNaWRkbGUnOiAvLyBEXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC44LCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC4yLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC4yLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OmJsYWNrSGVpZ2h0IH0pXG5cbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC44XG4gICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgY2FzZSAnd0xlZnQnOiAvLyBFLCBCXG4gICAgICAgICAgY3VycmVudFggLT0ga2V5V2lkdGggKiAuMiBcblxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjQsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjQsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnd01pZGRsZVInOiAvLyBHXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKi4yLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqLjIsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIDEuLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAxLiwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjcsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC43LCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC4yLCB5OjAgfSlcblxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoICogLjdcbiAgICAgICAgICBicmVhayBcblxuICAgICAgICBjYXNlICd3TWlkZGxlTCc6IC8vIEFcbiAgICAgICAgICBjdXJyZW50WCAtPSBrZXlXaWR0aCAqIC4xXG5cbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuOCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjMsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjMsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC44XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEtleXMgb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBLZXlzXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICBjb25zdCBjdHggID0gdGhpcy5jdHggIFxuICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuYmxhY2tDb2xvclxuICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgXG4gICAgbGV0IGNvdW50ICA9IDBcbiAgICBmb3IoIGxldCBib3VuZHMgb2YgdGhpcy5ib3VuZHMgKSB7XG4gICAgICBpZiggYm91bmRzID09PSB1bmRlZmluZWQgKSBjb250aW51ZSBcblxuICAgICAgbGV0IG5vdGVOdW1iZXIgPSAoIHRoaXMuc3RhcnRLZXkgKyBjb3VudCApICUgMTJcbiAgICAgIGxldCBub3RlTmFtZSAgID0gbm90ZUludGVnZXJzWyBub3RlTnVtYmVyIF1cbiAgICAgIGxldCBub3RlRHJhd1R5cGUgPSBrZXlUeXBlc0Zvck5vdGVbIG5vdGVOYW1lIF1cblxuICAgICAgY3R4LmJlZ2luUGF0aCgpXG5cbiAgICAgIGN0eC5tb3ZlVG8oIGJvdW5kc1swXS54LCBib3VuZHNbMF0ueSApXG5cbiAgICAgIGZvciggbGV0IGlkeCA9IDE7IGlkeCA8IGJvdW5kcy5sZW5ndGg7IGlkeCsrICkge1xuICAgICAgICBjdHgubGluZVRvKCBib3VuZHNbIGlkeCBdLngsIGJvdW5kc1sgaWR4IF0ueSApXG4gICAgICB9XG5cbiAgICAgIGN0eC5jbG9zZVBhdGgoKVxuICAgICAgXG4gICAgICBpZiggdGhpcy5fX3ZhbHVlWyB0aGlzLnN0YXJ0S2V5ICsgY291bnQgXSA9PT0gMSApIHtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjOTk5J1xuICAgICAgfWVsc2V7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBrZXlDb2xvcnNbIG5vdGVOdW1iZXIgXSA9PT0gMSA/IHRoaXMud2hpdGVDb2xvciA6IHRoaXMuYmxhY2tDb2xvclxuICAgICAgfVxuXG4gICAgICBjdHguZmlsbCgpXG4gICAgICBjdHguc3Ryb2tlKClcblxuICAgICAgY291bnQrK1xuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsIHRoaXMucG9pbnRlcmRvd24gKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgbGV0IGhpdCA9IHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSwgJ2Rvd24nICkgLy8gY2hhbmdlIGtleXMgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cbiAgICAgIGlmKCBoaXQgIT09IG51bGwgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdID0gaGl0IFxuICAgICAgICAvL3RoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmxhc3RCdXR0b24gPSBkYXRhLmJ1dHRvbk51bVxuICAgICAgfVxuXG4gICAgICAvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGxldCBrZXlOdW0gPSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXVxuXG4gICAgICBpZigga2V5TnVtICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgICBkZWxldGUgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF1cblxuICAgICAgICB0aGlzLl9fdmFsdWVbIGtleU51bSBdID0gMFxuICAgICAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KCBrZXlOdW0gKVxuICAgICAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG5cbiAgICAgICAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICAvL3dpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIC8vaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlLCAnbW92ZScgKVxuICAgICAgLy99XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBLZXlzJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgS2V5c1xuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUsIGRpciApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZSxcbiAgICAgICAgaGl0S2V5TnVtID0gbnVsbCxcbiAgICAgICAgc2hvdWxkRHJhdyA9IGZhbHNlXG5cbiAgICBmb3IoIGxldCBpID0gdGhpcy5zdGFydEtleTsgaSA8IHRoaXMuZW5kS2V5OyBpKysgKSB7XG4gICAgICBsZXQgaGl0ID0gVXRpbGl0aWVzLnBvbHlIaXRUZXN0KCBlLCB0aGlzLmJvdW5kc1sgaSBdLCB0aGlzLnJlY3QgKVxuXG4gICAgICBpZiggaGl0ID09PSB0cnVlICkge1xuICAgICAgICBoaXRLZXlOdW0gPSBpXG4gICAgICAgIGxldCBfX3Nob3VsZERyYXcgPSBmYWxzZVxuXG4gICAgICAgIGlmKCB0aGlzLmZvbGxvd01vdXNlID09PSBmYWxzZSB8fCBkaXIgIT09ICdtb3ZlJyApIHtcbiAgICAgICAgICB0aGlzLl9fdmFsdWVbIGkgXSA9IGRpciA9PT0gJ2Rvd24nID8gMSA6IDBcbiAgICAgICAgICBfX3Nob3VsZERyYXcgPSB0aGlzLm91dHB1dCggaGl0S2V5TnVtLCBkaXIgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZiggdGhpcy5fX2xhc3RLZXkgIT09IGhpdEtleU51bSAmJiBlLnByZXNzdXJlID4gMCApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coIHRoaXMuX19sYXN0S2V5LCBoaXRLZXlOdW0sIHRoaXMuX192YWx1ZVsgdGhpcy5fX2xhc3RLZXkgXSApXG4gICAgICAgICAgICB0aGlzLl9fdmFsdWVbIHRoaXMuX19sYXN0S2V5IF0gPSAwXG4gICAgICAgICAgICB0aGlzLl9fdmFsdWVbIGhpdEtleU51bSBdID0gMSAgXG5cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdID0gaGl0S2V5TnVtXG5cbiAgICAgICAgICAgIHRoaXMub3V0cHV0KCB0aGlzLl9fbGFzdEtleSwgMCApXG4gICAgICAgICAgICB0aGlzLm91dHB1dCggaGl0S2V5TnVtLCAxICkgXG5cbiAgICAgICAgICAgIF9fc2hvdWxkRHJhdyA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX19sYXN0S2V5ID0gaGl0S2V5TnVtXG4gICAgICAgIGlmKCBfX3Nob3VsZERyYXcgPT09IHRydWUgKSBzaG91bGREcmF3ID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcblxuICAgIHJldHVybiBoaXRLZXlOdW1cbiAgfSxcblxuICBvdXRwdXQoIGtleU51bSwgZGlyICkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX192YWx1ZVsga2V5TnVtIF0sIG5ld1ZhbHVlR2VuZXJhdGVkID0gZmFsc2UsIHByZXZWYWx1ZSA9IHRoaXMuX19wcmV2VmFsdWVbIGtleU51bSBdXG5cbiAgICB2YWx1ZSA9IHRoaXMucnVuRmlsdGVycyggdmFsdWUsIHRoaXMgKVxuICAgIFxuICAgIHRoaXMudmFsdWVbIGtleU51bSBdID0gdmFsdWVcbiAgICBcbiAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKSB0aGlzLnRyYW5zbWl0KCBbIHZhbHVlLCBrZXlOdW0gXSApXG5cbiAgICBpZiggcHJldlZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBpZiggdmFsdWUgIT09IHByZXZWYWx1ZSApIHtcbiAgICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiggbmV3VmFsdWVHZW5lcmF0ZWQgKSB7IFxuICAgICAgaWYoIHRoaXMub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHRoaXMub252YWx1ZWNoYW5nZSggdmFsdWUsIGtleU51bSApIFxuICAgICAgXG4gICAgICB0aGlzLl9fcHJldlZhbHVlWyBrZXlOdW0gXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgLy8gbmV3VmFsdWVHZW5lcmF0ZWQgY2FuIGJlIHVzZSB0byBkZXRlcm1pbmUgaWYgd2lkZ2V0IHNob3VsZCBkcmF3XG4gICAgcmV0dXJuIG5ld1ZhbHVlR2VuZXJhdGVkXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gS2V5c1xuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBLbm9iXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBLbm9iID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIEtub2IsIHtcbiAgLyoqIEBsZW5kcyBLbm9iLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgS25vYiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAga25vYkJ1ZmZlcjoyMCxcbiAgICB1c2VzUm90YXRpb246ZmFsc2UsXG4gICAgbGFzdFBvc2l0aW9uOjAsXG4gICAgaXNTcXVhcmU6dHJ1ZSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIEtub2IgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIEtub2JcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ2hvcml6b250YWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBLbm9iIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgS25vYiB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBrbm9iID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBLbm9iIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBrbm9iIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbigga25vYiwgS25vYi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBrbm9iLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAga25vYi5pbml0KClcblxuICAgIHJldHVybiBrbm9iXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEtub2Igb250byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkuXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuY29udGFpbmVyLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoICAgPSB0aGlzLmxpbmVXaWR0aFxuXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIGxldCB4ID0gMCxcbiAgICAgICAgeSA9IDAsXG4gICAgICAgIHdpZHRoID0gdGhpcy5yZWN0LndpZHRoLFxuICAgICAgICBoZWlnaHQ9IHRoaXMucmVjdC5oZWlnaHQsXG4gICAgICAgIHJhZGl1cyA9IHdpZHRoIC8gMlxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0IClcbiAgICAvL3RoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcblxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZCAvLyBkcmF3IGJhY2tncm91bmQgb2Ygd2lkZ2V0IGZpcnN0XG5cbiAgICBsZXQgYW5nbGUwID0gTWF0aC5QSSAqIC42LFxuICAgICAgICBhbmdsZTEgPSBNYXRoLlBJICogLjRcblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG4gICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsICAgICAgICAgYW5nbGUwLCBhbmdsZTEsIGZhbHNlIClcbiAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUgLCBhbmdsZTEsIGFuZ2xlMCwgdHJ1ZSAgKVx0XHRcbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuICAgIFxuICAgIHRoaXMuY3R4LmZpbGwoKVxuXG4gICAgbGV0IGFuZ2xlMlxuICAgIGlmKCF0aGlzLmlzSW52ZXJ0ZWQpICB7IFxuICAgICAgYW5nbGUyID0gTWF0aC5QSSAqIC42ICsgdGhpcy5fX3ZhbHVlICogMS44ICAqIE1hdGguUElcbiAgICAgIGlmKCBhbmdsZTIgPiAyICogTWF0aC5QSSkgYW5nbGUyIC09IDIgKiBNYXRoLlBJXG4gICAgfWVsc2V7XG4gICAgICBhbmdsZTIgPSBNYXRoLlBJICogKDAuNCAtICgxLjggKiB0aGlzLl9fdmFsdWUpKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpXG5cbiAgICBpZighdGhpcy5pc0ludmVydGVkKSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUwLCBhbmdsZTIsIGZhbHNlIClcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSwgYW5nbGUyLCBhbmdsZTAsIHRydWUgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlciwgYW5nbGUxLCBhbmdsZTIgLHRydWUgKVxuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41LCBhbmdsZTIsIGFuZ2xlMSwgZmFsc2UgKVxuICAgIH1cblxuICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpXG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcbiAgICB0aGlzLmN0eC5maWxsKClcbiAgXG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIC8vIGNyZWF0ZSBldmVudCBoYW5kbGVycyBib3VuZCB0byB0aGUgY3VycmVudCBvYmplY3QsIG90aGVyd2lzZSBcbiAgICAvLyB0aGUgJ3RoaXMnIGtleXdvcmQgd2lsbCByZWZlciB0byB0aGUgd2luZG93IG9iamVjdCBpbiB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgLy8gb25seSBsaXN0ZW4gZm9yIG1vdXNlZG93biBpbnRpYWxseTsgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwIGFyZSByZWdpc3RlcmVkIG9uIG1vdXNlZG93blxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAgdGhpcy5wb2ludGVyZG93biApXG4gIH0sXG5cbiAgZXZlbnRzOiB7XG4gICAgcG9pbnRlcmRvd24oIGUgKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkgLy8gY2hhbmdlIGtub2IgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIEtub2IncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBLbm9iXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cblxuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCB4T2Zmc2V0ID0gZS5jbGllbnRYLCB5T2Zmc2V0ID0gZS5jbGllbnRZXG5cbiAgICBsZXQgcmFkaXVzID0gdGhpcy5yZWN0LndpZHRoIC8gMjtcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IHRoaXMudmFsdWU7XG5cbiAgICBpZiggIXRoaXMudXNlc1JvdGF0aW9uICkge1xuICAgICAgaWYoIHRoaXMubGFzdFBvc2l0aW9uICE9PSAtMSApIHsgXG4gICAgICAgIC8vdGhpcy5fX3ZhbHVlIC09ICggeU9mZnNldCAtIHRoaXMubGFzdFBvc2l0aW9uICkgLyAocmFkaXVzICogMik7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDEgLSB5T2Zmc2V0IC8gdGhpcy5yZWN0LmhlaWdodFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdmFyIHhkaWZmID0gcmFkaXVzIC0geE9mZnNldDtcbiAgICAgIHZhciB5ZGlmZiA9IHJhZGl1cyAtIHlPZmZzZXQ7XG4gICAgICB2YXIgYW5nbGUgPSBNYXRoLlBJICsgTWF0aC5hdGFuMih5ZGlmZiwgeGRpZmYpO1xuICAgICAgdGhpcy5fX3ZhbHVlID0gICgoYW5nbGUgKyAoTWF0aC5QSSAqIDEuNSkpICUgKE1hdGguUEkgKiAyKSkgLyAoTWF0aC5QSSAqIDIpO1xuXG4gICAgICBpZih0aGlzLmxhc3RSb3RhdGlvblZhbHVlID4gLjggJiYgdGhpcy5fX3ZhbHVlIDwgLjIpIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMTtcbiAgICAgIH1lbHNlIGlmKHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPCAuMiAmJiB0aGlzLl9fdmFsdWUgPiAuOCkge1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9fdmFsdWUgPiAxKSB0aGlzLl9fdmFsdWUgPSAxO1xuICAgIGlmICh0aGlzLl9fdmFsdWUgPCAwKSB0aGlzLl9fdmFsdWUgPSAwO1xuXG4gICAgdGhpcy5sYXN0Um90YXRpb25WYWx1ZSA9IHRoaXMuX192YWx1ZTtcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHlPZmZzZXQ7XG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbiAgLy9fX2FkZFRvUGFuZWwoIHBhbmVsICkge1xuICAvLyAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gIC8vICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gIC8vICAvLyBjYWxsZWQgaWYgd2lkZ2V0IHVzZXMgRE9NV2lkZ2V0IGFzIHByb3RvdHlwZTsgLnBsYWNlIGluaGVyaXRlZCBmcm9tIERPTVdpZGdldFxuICAgIFxuICAvLyAgdGhpcy5wbGFjZSggdHJ1ZSApIFxuXG4gIC8vICBpZiggdGhpcy5sYWJlbCApIHRoaXMuYWRkTGFiZWwoKVxuXG4gIC8vICB0aGlzLmRyYXcoKSAgICAgXG5cbiAgLy99XG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gS25vYlxuIiwiaW1wb3J0IERPTVdpZGdldCBmcm9tICcuL2RvbVdpZGdldC5qcydcblxuLyoqXG4gKiBBIEhUTUwgc2VsZWN0IGVsZW1lbnQsIGZvciBwaWNraW5nIGl0ZW1zIGZyb20gYSBkcm9wLWRvd24gbWVudS4gXG4gKiBcbiAqIEBtb2R1bGUgTWVudVxuICogQGF1Z21lbnRzIERPTVdpZGdldFxuICovIFxubGV0IE1lbnUgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggTWVudSwge1xuICAvKiogQGxlbmRzIE1lbnUucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBNZW51IGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBzdGF0aWNcbiAgICovIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6MCxcbiAgICB2YWx1ZTowLFxuICAgIGJhY2tncm91bmQ6JyMzMzMnLFxuICAgIGZpbGw6JyM3NzcnLFxuICAgIHN0cm9rZTonI2FhYScsXG4gICAgYm9yZGVyV2lkdGg6NCxcblxuICAvKipcbiAgICogVGhlIG9wdGlvbnMgYXJyYXkgc3RvcmVzIHRoZSBkaWZmZXJlbnQgcG9zc2libGUgdmFsdWVzIGZvciB0aGUgTWVudVxuICAgKiB3aWRnZXQuIFRoZXJlIGFyZSB1c2VkIHRvIGNyZWF0ZSBIVE1MIG9wdGlvbiBlbGVtZW50cyB3aGljaCBhcmUgdGhlblxuICAgKiBhdHRhY2hlZCB0byB0aGUgcHJpbWFyeSBzZWxlY3QgZWxlbWVudCB1c2VkIGJ5IHRoZSBNZW51LlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi8gXG4gICAgb3B0aW9uczpbXSxcbiAgICBvbnZhbHVlY2hhbmdlOm51bGxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IE1lbnUgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBNZW51XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIE1lbnUgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbWVudSA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIERPTVdpZGdldC5jcmVhdGUuY2FsbCggbWVudSApXG5cbiAgICBPYmplY3QuYXNzaWduKCBtZW51LCBNZW51LmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBtZW51LmNyZWF0ZU9wdGlvbnMoKVxuXG4gICAgbWVudS5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoIGUgKT0+IHtcbiAgICAgIG1lbnUuX192YWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICBtZW51Lm91dHB1dCgpXG5cbiAgICAgIGlmKCBtZW51Lm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB7XG4gICAgICAgIG1lbnUub252YWx1ZWNoYW5nZSggbWVudS52YWx1ZSAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gbWVudVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcHJpbWFyeSBET00gZWxlbWVudCAoc2VsZWN0KSB0byBiZSBwbGFjZWQgaW4gYSBQYW5lbC5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICBsZXQgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKVxuXG4gICAgcmV0dXJuIHNlbGVjdFxuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBvcHRpb24gZWxlbWVudHMgZm9yIG1lbnUuIFJlbW92ZXMgcHJldmlvdXNseSBhcHBlbmRlZCBlbGVtZW50cy5cbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgY3JlYXRlT3B0aW9ucygpIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gJydcblxuICAgIGZvciggbGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMgKSB7XG4gICAgICBsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApXG4gICAgICBvcHRpb25FbC5zZXRBdHRyaWJ1dGUoICd2YWx1ZScsIG9wdGlvbiApXG4gICAgICBvcHRpb25FbC5pbm5lclRleHQgPSBvcHRpb25cbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCggb3B0aW9uRWwgKVxuICAgIH1cbiAgfSxcblxuICBzZWxlY3RPcHRpb24oIG9wdGlvblN0cmluZyApIHtcbiAgICBjb25zdCBvcHRpb25JZHggPSB0aGlzLm9wdGlvbnMuaW5kZXhPZiggb3B0aW9uU3RyaW5nIClcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLmVsZW1lbnQub3B0aW9uc1sgb3B0aW9uSWR4IF1cbiAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlXG5cbiAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdIVE1MRXZlbnRzJyApXG4gICAgZXZ0LmluaXRFdmVudCggJ2NoYW5nZScsIGZhbHNlLCB0cnVlIClcbiAgICB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudCggZXZ0IClcbiAgfSxcblxuICAvKipcbiAgICogT3ZlcnJpZGRlbiB2aXJ0dWFsIG1ldGhvZCB0byBhZGQgZWxlbWVudCB0byBwYW5lbC5cbiAgICogQHByaXZhdGVcbiAgICogQG1lbWJlcm9mIE1lbnUgXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gICAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICB0aGlzLnBsYWNlKCkgXG4gIH1cblxufSlcblxuZXhwb3J0IGRlZmF1bHQgTWVudVxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldCdcblxuLyoqXG4gKiBBIE11bHRpQnV0dG9uIHdpdGggdGhyZWUgZGlmZmVyZW50IHN0eWxlczogJ21vbWVudGFyeScgdHJpZ2dlcnMgYSBmbGFzaCBhbmQgaW5zdGFuZW91cyBvdXRwdXQsIFxuICogJ2hvbGQnIG91dHB1dHMgdGhlIG11bHRpQnV0dG9ucyBtYXhpbXVtIHZhbHVlIHVudGlsIGl0IGlzIHJlbGVhc2VkLCBhbmQgJ3RvZ2dsZScgYWx0ZXJuYXRlcyBcbiAqIGJldHdlZW4gb3V0cHV0dGluZyBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlcyBvbiBwcmVzcy4gXG4gKiBcbiAqIEBtb2R1bGUgTXVsdGlCdXR0b25cbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IE11bHRpQnV0dG9uID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0IClcblxuT2JqZWN0LmFzc2lnbiggTXVsdGlCdXR0b24sIHtcblxuICAvKiogQGxlbmRzIE11bHRpQnV0dG9uLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgTXVsdGlCdXR0b24gaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICByb3dzOjIsXG4gICAgY29sdW1uczoyLFxuICAgIGxhc3RCdXR0b246bnVsbCxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlICdtb21lbnRhcnknLCAnaG9sZCcsIG9yICd0b2dnbGUnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgaW50ZXJhY3Rpb24gb2YgdGhlIE11bHRpQnV0dG9uIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBNdWx0aUJ1dHRvblxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAndG9nZ2xlJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgTXVsdGlCdXR0b24gaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBNdWx0aUJ1dHRvblxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgYSBNdWx0aUJ1dHRvbiBpbnN0YW5jZSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBtdWx0aUJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCggbXVsdGlCdXR0b24gKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbXVsdGlCdXR0b24sIE11bHRpQnV0dG9uLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcHMudmFsdWUgKSB7XG4gICAgICBtdWx0aUJ1dHRvbi5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICB9ZWxzZXtcbiAgICAgIG11bHRpQnV0dG9uLl9fdmFsdWUgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBtdWx0aUJ1dHRvbi5jb3VudDsgaSsrICkgbXVsdGlCdXR0b24uX192YWx1ZVsgaSBdID0gMFxuICAgICAgbXVsdGlCdXR0b24udmFsdWUgPSBbXVxuICAgIH1cbiAgICBcbiAgICBtdWx0aUJ1dHRvbi5hY3RpdmUgPSB7fVxuICAgIG11bHRpQnV0dG9uLl9fcHJldlZhbHVlID0gW11cblxuICAgIG11bHRpQnV0dG9uLmluaXQoKVxuXG4gICAgcmV0dXJuIG11bHRpQnV0dG9uXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIE11bHRpQnV0dG9uIGludG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5IGFuZCBtdWx0aUJ1dHRvbiBzdHlsZS5cbiAgICogQG1lbWJlcm9mIE11bHRpQnV0dG9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuX192YWx1ZSA9PT0gMSA/IHRoaXMuZmlsbCA6IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuXG4gICAgbGV0IGJ1dHRvbldpZHRoICA9IHRoaXMucmVjdC53aWR0aCAgLyB0aGlzLmNvbHVtbnMsICBcbiAgICAgICAgYnV0dG9uSGVpZ2h0ID0gdGhpcy5yZWN0LmhlaWdodCAvIHRoaXMucm93c1xuXG4gICAgZm9yKCBsZXQgcm93ID0gMDsgcm93IDwgdGhpcy5yb3dzOyByb3crKyApIHtcbiAgICAgIGxldCB5ID0gcm93ICogYnV0dG9uSGVpZ2h0XG4gICAgICBmb3IoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCB0aGlzLmNvbHVtbnM7IGNvbHVtbisrICkge1xuICAgICAgICBsZXQgeCA9IGNvbHVtbiAqIGJ1dHRvbldpZHRoLFxuICAgICAgICAgICAgYnV0dG9uTnVtID0gcm93ICogdGhpcy5jb2x1bW5zICsgY29sdW1uXG5cbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9PT0gMSA/IHRoaXMuZmlsbCA6IHRoaXMuYmFja2dyb3VuZFxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCggeCx5LCBidXR0b25XaWR0aCwgYnV0dG9uSGVpZ2h0IClcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggeCx5LCBidXR0b25XaWR0aCwgYnV0dG9uSGVpZ2h0IClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYWRkRXZlbnRzKCkge1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGdldERhdGFGcm9tRXZlbnQoIGUgKSB7XG4gICAgbGV0IHJvd1NpemUgPSAxL3RoaXMucm93cyxcbiAgICAgICAgcm93ID0gIE1hdGguZmxvb3IoICggZS5jbGllbnRZIC8gdGhpcy5yZWN0LmhlaWdodCApIC8gcm93U2l6ZSApLFxuICAgICAgICBjb2x1bW5TaXplID0gMS90aGlzLmNvbHVtbnMsXG4gICAgICAgIGNvbHVtbiA9ICBNYXRoLmZsb29yKCAoIGUuY2xpZW50WCAvIHRoaXMucmVjdC53aWR0aCApIC8gY29sdW1uU2l6ZSApLFxuICAgICAgICBidXR0b25OdW0gPSByb3cgKiB0aGlzLmNvbHVtbnMgKyBjb2x1bW5cblxuICAgICByZXR1cm4geyBidXR0b25OdW0sIHJvdywgY29sdW1uIH1cbiAgfSxcblxuICBwcm9jZXNzQnV0dG9uT24oIGRhdGEsIGUgKSB7XG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICd0b2dnbGUnICkge1xuICAgICAgdGhpcy5fX3ZhbHVlWyBidXR0b25OdW0gXSA9IHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPT09IDEgPyAwIDogMVxuICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnbW9tZW50YXJ5JyApIHtcbiAgICAgIHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPSAxXG4gICAgICBzZXRUaW1lb3V0KCAoKT0+IHsgXG4gICAgICAgIHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPSAwO1xuICAgICAgICAvL2xldCBpZHggPSB0aGlzLmFjdGl2ZS5maW5kSW5kZXgoIHYgPT4gdi5idXR0b25OdW0gPT09IGJ1dHRvbk51bSApXG4gICAgICAgIC8vdGhpcy5hY3RpdmUuc3BsaWNlKCBpZHgsIDEgKVxuICAgICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5zcGxpY2UoIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmluZGV4T2YoIGJ1dHRvbk51bSApLCAxIClcbiAgICAgICAgdGhpcy5kcmF3KCkgXG4gICAgICB9LCA1MCApXG4gICAgfWVsc2UgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgIHRoaXMuX192YWx1ZVsgZGF0YS5idXR0b25OdW0gXSA9IDFcbiAgICB9XG5cbiAgICB0aGlzLm91dHB1dCggZGF0YSApXG5cbiAgICB0aGlzLmRyYXcoKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgLy8gb25seSBob2xkIG5lZWRzIHRvIGxpc3RlbiBmb3IgcG9pbnRlcnVwIGV2ZW50czsgdG9nZ2xlIGFuZCBtb21lbnRhcnkgb25seSBjYXJlIGFib3V0IHBvaW50ZXJkb3duXG4gICAgICBsZXQgZGF0YSA9IHRoaXMuZ2V0RGF0YUZyb21FdmVudCggZSApXG5cbiAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdID0gWyBkYXRhLmJ1dHRvbk51bSBdXG4gICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5sYXN0QnV0dG9uID0gZGF0YS5idXR0b25OdW1cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgdGhpcy5wb2ludGVydXAgKSBcblxuICAgICAgdGhpcy5wcm9jZXNzQnV0dG9uT24oIGRhdGEsIGUgKVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGxldCBkYXRhID0gdGhpcy5nZXREYXRhRnJvbUV2ZW50KCBlIClcbiAgICAgIFxuICAgICAgbGV0IGNoZWNrRm9yUHJlc3NlZCA9IHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmluZGV4T2YoIGRhdGEuYnV0dG9uTnVtICksXG4gICAgICAgICAgbGFzdEJ1dHRvbiAgPSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5sYXN0QnV0dG9uXG4gICAgICBcbiAgICAgIGlmKCBjaGVja0ZvclByZXNzZWQgPT09IC0xICYmIGxhc3RCdXR0b24gIT09IGRhdGEuYnV0dG9uTnVtICkge1xuICAgICAgICBcbiAgICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICd0b2dnbGUnIHx8IHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvbGQnICkge1xuICAgICAgICAgICAgdGhpcy5fX3ZhbHVlWyBsYXN0QnV0dG9uIF0gPSAwXG4gICAgICAgICAgICB0aGlzLm91dHB1dCggZGF0YSApXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdID0gWyBkYXRhLmJ1dHRvbk51bSBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLnB1c2goIGRhdGEuYnV0dG9uTnVtIClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdLmxhc3RCdXR0b24gPSBkYXRhLmJ1dHRvbk51bVxuXG4gICAgICAgIHRoaXMucHJvY2Vzc0J1dHRvbk9uKCBkYXRhLCBlIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIE9iamVjdC5rZXlzKCB0aGlzLmFjdGl2ZSApLmxlbmd0aCApIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwIClcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKVxuXG4gICAgICAgIGlmKCB0aGlzLnN0eWxlICE9PSAndG9nZ2xlJyApIHtcbiAgICAgICAgICBsZXQgYnV0dG9uc0ZvclBvaW50ZXIgPSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXVxuXG4gICAgICAgICAgaWYoIGJ1dHRvbnNGb3JQb2ludGVyICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBmb3IoIGxldCBidXR0b24gb2YgYnV0dG9uc0ZvclBvaW50ZXIgKSB7XG4gICAgICAgICAgICAgIHRoaXMuX192YWx1ZVsgYnV0dG9uIF0gPSAwXG4gICAgICAgICAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKCBidXR0b24gLyB0aGlzLnJvd3MgKSxcbiAgICAgICAgICAgICAgICAgIGNvbHVtbiA9IGJ1dHRvbiAlIHRoaXMuY29sdW1uc1xuXG4gICAgICAgICAgICAgIHRoaXMub3V0cHV0KHsgYnV0dG9uTnVtOmJ1dHRvbiwgcm93LCBjb2x1bW4gfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBvdXRwdXQoIGJ1dHRvbkRhdGEgKSB7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5fX3ZhbHVlWyBidXR0b25EYXRhLmJ1dHRvbk51bSBdLCBuZXdWYWx1ZUdlbmVyYXRlZCA9IGZhbHNlLCBwcmV2VmFsdWUgPSB0aGlzLl9fcHJldlZhbHVlWyBidXR0b25EYXRhLmJ1dHRvbk51bSBdXG5cbiAgICB2YWx1ZSA9IHRoaXMucnVuRmlsdGVycyggdmFsdWUsIHRoaXMgKVxuICAgIFxuICAgIHRoaXMudmFsdWVbIGJ1dHRvbkRhdGEuYnV0dG9uTnVtIF0gPSB2YWx1ZVxuICAgIFxuICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApIHRoaXMudHJhbnNtaXQoIFsgdmFsdWUsIGJ1dHRvbkRhdGEucm93LCBidXR0b25EYXRhLmNvbHVtbiBdIClcblxuICAgIGlmKCBwcmV2VmFsdWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGlmKCB2YWx1ZSAhPT0gcHJldlZhbHVlICkge1xuICAgICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmKCBuZXdWYWx1ZUdlbmVyYXRlZCApIHsgXG4gICAgICBpZiggdGhpcy5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkgdGhpcy5vbnZhbHVlY2hhbmdlKCB2YWx1ZSwgYnV0dG9uRGF0YS5yb3csIGJ1dHRvbkRhdGEuY29sdW1uIClcbiAgICAgIFxuICAgICAgdGhpcy5fX3ByZXZWYWx1ZVsgYnV0dG9uRGF0YS5idXR0b25OdW0gXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgLy8gbmV3VmFsdWVHZW5lcmF0ZWQgY2FuIGJlIHVzZSB0byBkZXRlcm1pbmUgaWYgd2lkZ2V0IHNob3VsZCBkcmF3XG4gICAgcmV0dXJuIG5ld1ZhbHVlR2VuZXJhdGVkXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBNdWx0aUJ1dHRvblxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBNdWx0aVNsaWRlclxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgTXVsdGlTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggTXVsdGlTbGlkZXIsIHtcbiAgLyoqIEBsZW5kcyBNdWx0aVNsaWRlci5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIE11bHRpU2xpZGVyIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTpbLjE1LC4zNSwuNSwuNzVdLCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOlsuNSwuNSwuNSwuNV0sICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBjb3VudCBwcm9wZXJ0eSBkZXRlcm1pbmVzIHRoZSBudW1iZXIgb2Ygc2xpZGVycyBpbiB0aGUgbXVsdGlzbGlkZXIsIGRlZmF1bHQgNC5cbiAgICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7SW50ZWdlcn1cbiAgICAgKi9cbiAgICBjb3VudDo0LFxuICAgIGxpbmVXaWR0aDoxLFxuICAgIC8qKlxuICAgICAqIFRoZSBzdHlsZSBwcm9wZXJ0eSBjYW4gYmUgZWl0aGVyICdob3Jpem9udGFsJyAodGhlIGRlZmF1bHQpIG9yICd2ZXJ0aWNhbCcuIFRoaXNcbiAgICAgKiBkZXRlcm1pbmVzIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgTXVsdGlTbGlkZXIgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTondmVydGljYWwnXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNdWx0aVNsaWRlciBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBNdWx0aVNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBtdWx0aVNsaWRlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggTXVsdGlTbGlkZXIgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIG11bHRpU2xpZGVyIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggbXVsdGlTbGlkZXIsIE11bHRpU2xpZGVyLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIG11bHRpU2xpZGVyLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuICAgIFxuICAgIC8vIGluaGVyaXRzIGZyb20gV2lkZ2V0XG4gICAgbXVsdGlTbGlkZXIuaW5pdCgpXG4gICAgXG4gICAgaWYoIHByb3BzLnZhbHVlID09PSB1bmRlZmluZWQgJiYgbXVsdGlTbGlkZXIuY291bnQgIT09IDQgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IG11bHRpU2xpZGVyLmNvdW50OyBpKysgKSB7XG4gICAgICAgIG11bHRpU2xpZGVyLl9fdmFsdWVbIGkgXSA9IGkgLyBtdWx0aVNsaWRlci5jb3VudFxuICAgICAgfVxuICAgIH1lbHNlIGlmKCB0eXBlb2YgcHJvcHMudmFsdWUgPT09ICdudW1iZXInICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBtdWx0aVNsaWRlci5jb3VudDsgaSsrICkgbXVsdGlTbGlkZXIuX192YWx1ZVsgaSBdID0gcHJvcHMudmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gbXVsdGlTbGlkZXJcbiAgfSxcbiAgXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIE11bHRpU2xpZGVyIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSAgID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcblxuICAgIC8vIGRyYXcgZmlsbCAobXVsdGlTbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBsZXQgc2xpZGVyV2lkdGggPSB0aGlzLnN0eWxlID09PSAndmVydGljYWwnID8gdGhpcy5yZWN0LndpZHRoIC8gdGhpcy5jb3VudCA6IHRoaXMucmVjdC5oZWlnaHQgLyB0aGlzLmNvdW50XG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyApIHtcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgICAgbGV0IHlwb3MgPSBNYXRoLmZsb29yKCBpICogc2xpZGVyV2lkdGggKVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwgeXBvcywgdGhpcy5yZWN0LndpZHRoICogdGhpcy5fX3ZhbHVlWyBpIF0sIE1hdGguY2VpbCggc2xpZGVyV2lkdGggKSApXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsIHlwb3MsIHRoaXMucmVjdC53aWR0aCwgc2xpZGVyV2lkdGggKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCB4cG9zID0gTWF0aC5mbG9vciggaSAqIHNsaWRlcldpZHRoIClcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHhwb3MsIHRoaXMucmVjdC5oZWlnaHQgLSB0aGlzLl9fdmFsdWVbIGkgXSAqIHRoaXMucmVjdC5oZWlnaHQsIE1hdGguY2VpbChzbGlkZXJXaWR0aCksIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWVbIGkgXSApXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIHhwb3MsIDAsIHNsaWRlcldpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgICAgIH1cbiAgICB9XG5cbiAgIFxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBtdWx0aVNsaWRlciB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICB9LFxuXG4gICAgcG9pbnRlcnVwKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgTXVsdGlTbGlkZXIncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IHByZXZWYWx1ZSA9IHRoaXMudmFsdWUsXG4gICAgICAgIHNsaWRlck51bVxuXG4gICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAgIHNsaWRlck51bSA9IE1hdGguZmxvb3IoICggZS5jbGllbnRZIC8gdGhpcy5yZWN0LmhlaWdodCApIC8gKCAxL3RoaXMuY291bnQgKSApXG4gICAgICB0aGlzLl9fdmFsdWVbIHNsaWRlck51bSBdID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5yZWN0LndpZHRoXG4gICAgfWVsc2V7XG4gICAgICBzbGlkZXJOdW0gPSBNYXRoLmZsb29yKCAoIGUuY2xpZW50WCAvIHRoaXMucmVjdC53aWR0aCApIC8gKCAxL3RoaXMuY291bnQgKSApXG4gICAgICB0aGlzLl9fdmFsdWVbIHNsaWRlck51bSBdID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgICkge1xuICAgICAgaWYoIHRoaXMuX192YWx1ZVsgaSBdID4gMSApIHRoaXMuX192YWx1ZVsgaSBdID0gMVxuICAgICAgaWYoIHRoaXMuX192YWx1ZVsgaSBdIDwgMCApIHRoaXMuX192YWx1ZVsgaSBdID0gMFxuICAgIH1cblxuICAgIGxldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIGlmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aVNsaWRlclxuIiwibGV0IFBhbmVsID0ge1xuICBkZWZhdWx0czoge1xuICAgIGZ1bGxzY3JlZW46ZmFsc2UsXG4gICAgYmFja2dyb3VuZDonIzMzMydcbiAgfSxcbiAgXG4gIC8vIGNsYXNzIHZhcmlhYmxlIGZvciByZWZlcmVuY2UgdG8gYWxsIHBhbmVsc1xuICBwYW5lbHM6W10sXG5cbiAgY3JlYXRlKCBwcm9wcyA9IG51bGwgKSB7XG4gICAgbGV0IHBhbmVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gZGVmYXVsdDogZnVsbCB3aW5kb3cgaW50ZXJmYWNlXG4gICAgaWYoIHByb3BzID09PSBudWxsICkge1xuICAgICAgICBcbiAgICAgIE9iamVjdC5hc3NpZ24oIHBhbmVsLCBQYW5lbC5kZWZhdWx0cywge1xuICAgICAgICB4OjAsXG4gICAgICAgIHk6MCxcbiAgICAgICAgd2lkdGg6MSxcbiAgICAgICAgaGVpZ2h0OjEsXG4gICAgICAgIF9feDogMCxcbiAgICAgICAgX195OiAwLFxuICAgICAgICBfX3dpZHRoOiBudWxsLFxuICAgICAgICBfX2hlaWdodDpudWxsLFxuICAgICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH0pXG4gICAgICBcbiAgICAgIHBhbmVsLmRpdiA9IHBhbmVsLl9fY3JlYXRlSFRNTEVsZW1lbnQoKVxuICAgICAgcGFuZWwubGF5b3V0KClcblxuICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnYm9keScgKVxuICAgICAgYm9keS5hcHBlbmRDaGlsZCggcGFuZWwuZGl2IClcbiAgICB9XG4gICAgXG4gICAgUGFuZWwucGFuZWxzLnB1c2goIHBhbmVsIClcblxuICAgIHJldHVybiBwYW5lbFxuICB9LFxuICBcbiAgX19jcmVhdGVIVE1MRWxlbWVudCgpIHtcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKVxuICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgICBkaXYuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuYmFja2dyb3VuZFxuICAgIFxuICAgIHJldHVybiBkaXZcbiAgfSxcblxuICBsYXlvdXQoKSB7XG4gICAgaWYoIHRoaXMuZnVsbHNjcmVlbiApIHtcbiAgICAgIHRoaXMuX193aWR0aCAgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgdGhpcy5fX2hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgdGhpcy5fX3ggICAgICA9IHRoaXMueCAqIHRoaXMuX193aWR0aFxuICAgICAgdGhpcy5fX3kgICAgICA9IHRoaXMueSAqIHRoaXMuX19oZWlnaHRcblxuICAgICAgdGhpcy5kaXYuc3R5bGUud2lkdGggID0gdGhpcy5fX3dpZHRoICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fX2hlaWdodCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgICA9IHRoaXMuX194ICsgJ3B4J1xuICAgICAgdGhpcy5kaXYuc3R5bGUudG9wICAgID0gdGhpcy5fX3kgKyAncHgnXG4gICAgfVxuICB9LFxuXG4gIGdldFdpZHRoKCkgIHsgcmV0dXJuIHRoaXMuX193aWR0aCAgfSxcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5fX2hlaWdodCB9LFxuXG4gIGFkZCggLi4ud2lkZ2V0cyApIHtcbiAgICBmb3IoIGxldCB3aWRnZXQgb2Ygd2lkZ2V0cyApIHtcblxuICAgICAgLy8gY2hlY2sgdG8gbWFrZSBzdXJlIHdpZGdldCBoYXMgbm90IGJlZW4gYWxyZWFkeSBhZGRlZFxuICAgICAgaWYoIHRoaXMuY2hpbGRyZW4uaW5kZXhPZiggd2lkZ2V0ICkgPT09IC0xICkge1xuICAgICAgICBpZiggdHlwZW9mIHdpZGdldC5fX2FkZFRvUGFuZWwgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgdGhpcy5kaXYuYXBwZW5kQ2hpbGQoIHdpZGdldC5lbGVtZW50IClcbiAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goIHdpZGdldCApXG5cbiAgICAgICAgICB3aWRnZXQuX19hZGRUb1BhbmVsKCB0aGlzIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdXaWRnZXQgY2Fubm90IGJlIGFkZGVkIHRvIHBhbmVsOyBpdCBkb2VzIG5vdCBjb250YWluIHRoZSBtZXRob2QgLl9fYWRkVG9QYW5lbCcgKVxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhyb3cgRXJyb3IoICdXaWRnZXQgaXMgYWxyZWFkeSBhZGRlZCB0byBwYW5lbC4nIClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUGFuZWwgXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIFNsaWRlclxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIFNsaWRlciwge1xuICAvKiogQGxlbmRzIFNsaWRlci5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIFNsaWRlciBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOi41LCAvLyBhbHdheXMgMC0xLCBub3QgZm9yIGVuZC11c2Vyc1xuICAgIHZhbHVlOi41LCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIFNsaWRlciBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICdob3Jpem9udGFsJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgU2xpZGVyIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBTbGlkZXIgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgc2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBTbGlkZXIgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIHNsaWRlciApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIHNsaWRlciwgU2xpZGVyLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICAvLyBzZXQgdW5kZXJseWluZyB2YWx1ZSBpZiBuZWNlc3NhcnkuLi4gVE9ETzogaG93IHNob3VsZCB0aGlzIGJlIHNldCBnaXZlbiBtaW4vbWF4P1xuICAgIGlmKCBwcm9wcy52YWx1ZSApIHNsaWRlci5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIHNsaWRlci5pbml0KClcblxuICAgIHJldHVybiBzbGlkZXJcbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgU2xpZGVyIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgU2xpZGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKHNsaWRlciB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIDAsIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZSwgdGhpcy5yZWN0LmhlaWdodCApXG4gICAgZWxzZVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIHRoaXMucmVjdC5oZWlnaHQgLSB0aGlzLl9fdmFsdWUgKiB0aGlzLnJlY3QuaGVpZ2h0LCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWUgKVxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBzbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIFNsaWRlcidzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IHByZXZWYWx1ZSA9IHRoaXMudmFsdWVcblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgICB0aGlzLl9fdmFsdWUgPSAoIGUuY2xpZW50WCAtIHRoaXMucmVjdC5sZWZ0ICkgLyB0aGlzLnJlY3Qud2lkdGhcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX192YWx1ZSA9IDEgLSAoIGUuY2xpZW50WSAtIHRoaXMucmVjdC50b3AgICkgLyB0aGlzLnJlY3QuaGVpZ2h0IFxuICAgIH1cblxuICAgIC8vIGNsYW1wIF9fdmFsdWUsIHdoaWNoIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5XG4gICAgaWYoIHRoaXMuX192YWx1ZSA+IDEgKSB0aGlzLl9fdmFsdWUgPSAxXG4gICAgaWYoIHRoaXMuX192YWx1ZSA8IDAgKSB0aGlzLl9fdmFsdWUgPSAwXG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2xpZGVyXG4iLCJpbXBvcnQgRE9NV2lkZ2V0IGZyb20gJy4vZG9tV2lkZ2V0LmpzJ1xuXG4vKipcbiAqIEEgSFRNTCBzZWxlY3QgZWxlbWVudCwgZm9yIHBpY2tpbmcgaXRlbXMgZnJvbSBhIGRyb3AtZG93biBtZW51LiBcbiAqIFxuICogQG1vZHVsZSBNZW51XG4gKiBAYXVnbWVudHMgRE9NV2lkZ2V0XG4gKi8gXG5sZXQgSW5wdXQgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKSBcblxuT2JqZWN0LmFzc2lnbiggSW5wdXQsIHtcbiAgLyoqIEBsZW5kcyBJbnB1dC5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIElucHV0IGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBJbnB1dFxuICAgKiBAc3RhdGljXG4gICAqLyBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOjAsXG4gICAgdmFsdWU6MCxcbiAgICBiYWNrZ3JvdW5kOicjMzMzJyxcbiAgICBmaWxsOicjNzc3JyxcbiAgICBzdHJva2U6JyNhYWEnLFxuICAgIGJvcmRlcldpZHRoOjQsXG5cbiAgLyoqXG4gICAqIFRoZSBvcHRpb25zIGFycmF5IHN0b3JlcyB0aGUgZGlmZmVyZW50IHBvc3NpYmxlIHZhbHVlcyBmb3IgdGhlIElucHV0XG4gICAqIHdpZGdldC4gVGhlcmUgYXJlIHVzZWQgdG8gY3JlYXRlIEhUTUwgb3B0aW9uIGVsZW1lbnRzIHdoaWNoIGFyZSB0aGVuXG4gICAqIGF0dGFjaGVkIHRvIHRoZSBwcmltYXJ5IHNlbGVjdCBlbGVtZW50IHVzZWQgYnkgdGhlIElucHV0LlxuICAgKiBAbWVtYmVyb2YgSW5wdXRcbiAgICogQGluc3RhbmNlXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovIFxuICAgIG9wdGlvbnM6W10sXG4gICAgb252YWx1ZWNoYW5nZTpudWxsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBJbnB1dCBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIElucHV0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIElucHV0IHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG1lbnUgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBET01XaWRnZXQuY3JlYXRlLmNhbGwoIG1lbnUgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbWVudSwgSW5wdXQuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIG1lbnUuZWxlbWVudC5pbm5lckhUTUwgPSBtZW51LnZhbHVlXG5cbiAgICBtZW51LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICggZSApPT4ge1xuICAgICAgbWVudS5fX3ZhbHVlID0gZS50YXJnZXQudmFsdWVcbiAgICAgIG1lbnUub3V0cHV0KClcblxuICAgICAgaWYoIG1lbnUub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHtcbiAgICAgICAgbWVudS5vbnZhbHVlY2hhbmdlKCBtZW51LnZhbHVlICApXG4gICAgICB9XG4gICAgfSlcblxuICAgIG1lbnUuaW5pdCgpXG5cbiAgICByZXR1cm4gbWVudVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgcHJpbWFyeSBET00gZWxlbWVudCAoc2VsZWN0KSB0byBiZSBwbGFjZWQgaW4gYSBQYW5lbC5cbiAgICogQG1lbWJlcm9mIElucHV0IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApXG5cbiAgICByZXR1cm4gaW5wdXRcbiAgfSxcblxuICAvKipcbiAgICogT3ZlcnJpZGRlbiB2aXJ0dWFsIG1ldGhvZCB0byBhZGQgZWxlbWVudCB0byBwYW5lbC5cbiAgICogQHByaXZhdGVcbiAgICogQG1lbWJlcm9mIElucHV0IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIF9fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAgIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgdGhpcy5wbGFjZSgpIFxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IElucHV0XG4iLCJsZXQgVXRpbGl0aWVzID0ge1xuXG4gIGdldE1vZGUoKSB7XG4gICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/ICd0b3VjaCcgOiAnbW91c2UnXG4gIH0sXG5cbiAgZ2V0T1MoKSB7XG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3Qgb3MgPSB1YS5pbmRleE9mKCdhbmRyb2lkJykgPiAtMSA/ICdhbmRyb2lkJyA6ICdpb3MnXG4gICAgcmV0dXJuIG9zXG4gIH0sXG5cbiAgY29tcGFyZUFycmF5cyggYTEsIGEyICkge1xuICAgIHJldHVybiBhMS5sZW5ndGggPT09IGEyLmxlbmd0aCAmJiBhMS5ldmVyeSgodixpKT0+IHYgPT09IGEyW2ldKVxuICB9LFxuXG4gIC8vIHBvcnRlZC9hZGFwdGVkIGZyb20gb3JpZ25hbCBJbnRlcmZhY2UuanMgQnV0dG9uViBjb2RlIGJ5IEpvbmF0aGFuIFNpbW96YXJcbiAgcG9seUhpdFRlc3QoIGUsIGJvdW5kcywgcmVjdCApIHtcbiAgICBjb25zdCB3ID0gcmVjdC53aWR0aCxcbiAgICAgICAgICBoID0gcmVjdC5oZWlnaHQsXG4gICAgICAgICAgcCA9IGJvdW5kc1xuXG4gICAgbGV0IHNpZGVzID0gMCxcbiAgICAgICAgaGl0ID0gZmFsc2VcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcC5sZW5ndGggLSAxOyBpKysgKSB7XG4gICAgICBpZiggcFsgaSsxIF0ueCA+IHBbIGkgXS54ICkge1xuICAgICAgICBpZiggKCBwWyBpIF0ueCAgPD0gZS54ICkgJiYgKCBlLnggPCAgcFtpKzFdLnggKSApIHtcbiAgICAgICAgICBsZXQgeXZhbCA9ICggcFtpKzFdLnkgLSBwW2ldLnkgKS8gKCBwW2krMV0ueCAtIHBbaV0ueCApICogaC93ICogKCBlLnggLSBwW2ldLnggKSArIHBbaV0ueVxuXG4gICAgICAgICAgaWYoIHl2YWwgLSBlLnkgPCAwICkgc2lkZXMrK1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIHBbaSsxXS54IDwgcFtpXS54ICkge1xuICAgICAgICBpZiggKCBwW2ldLnggPj0gZS54ICkgJiYgKCBlLnggPiBwW2krMV0ueCApICkge1xuICAgICAgICAgIGxldCB5dmFsID0gKCBwW2krMV0ueSAtIHBbaV0ueSkgLyAoIHBbaSsxXS54IC0gcFtpXS54KSAqIGgvdyAqICggZS54IC0gcFtpXS54ICkgKyBwW2ldLnlcblxuICAgICAgICAgIGlmKCB5dmFsIC0gZS55IDwgMCApIHNpZGVzKytcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBzaWRlcyAlIDIgPT09IDEgKSBoaXQgPSB0cnVlXG4gXG4gICAgcmV0dXJuIGhpdFxuICB9LFxuXG4gIG10b2YoIG51bSwgdHVuaW5nID0gNDQwICkge1xuICAgIHJldHVybiB0dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggbnVtIC0gNjkgKSApXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbGl0aWVzXG4iLCJpbXBvcnQgRmlsdGVycyBmcm9tICcuL2ZpbHRlcnMnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24uanMnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuXG4vKipcbiAqIFdpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyB0aGF0IGFsbCBvdGhlciBVSSBlbGVtZW50cyBpbmhlcml0cyBmcm9tLiBJdCBwcmltYXJpbHlcbiAqIGluY2x1ZGVzIG1ldGhvZHMgZm9yIGZpbHRlcmluZyAvIHNjYWxpbmcgb3V0cHV0LlxuICogQG1vZHVsZSBXaWRnZXRcbiAqL1xuXG5cbmxldCBXaWRnZXQgPSB7XG4gIC8qKiBAbGVuZHMgV2lkZ2V0LnByb3RvdHlwZSAqL1xuICBcbiAgLyoqXG4gICAqIHN0b3JlIGFsbCBpbnN0YW50aWF0ZWQgd2lkZ2V0cy5cbiAgICogQHR5cGUge0FycmF5LjxXaWRnZXQ+fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIHdpZGdldHM6IFtdLFxuICBsYXN0VmFsdWU6IG51bGwsXG4gIG9udmFsdWVjaGFuZ2U6IG51bGwsXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCB3aWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBtaW46MCwgbWF4OjEsXG4gICAgc2NhbGVPdXRwdXQ6dHJ1ZSwgLy8gYXBwbHkgc2NhbGUgZmlsdGVyIGJ5IGRlZmF1bHQgZm9yIG1pbiAvIG1heCByYW5nZXNcbiAgICB0YXJnZXQ6bnVsbCxcbiAgICBfX3ByZXZWYWx1ZTpudWxsXG4gIH0sXG4gIFxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFdpZGdldCBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSgpIHtcbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBXaWRnZXQuZGVmYXVsdHMgKVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBTdG9yZXMgZmlsdGVycyBmb3IgdHJhbnNmb3JtaW5nIHdpZGdldCBvdXRwdXQuXG4gICAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZmlsdGVycyA9IFtdXG5cbiAgICB0aGlzLl9fcHJlZmlsdGVycyA9IFtdXG4gICAgdGhpcy5fX3Bvc3RmaWx0ZXJzID0gW11cblxuICAgIFdpZGdldC53aWRnZXRzLnB1c2goIHRoaXMgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIGZvciB3aWRnZXRzLiBDaGVja3MgdG8gc2VlIGlmIHdpZGdldCBjb250YWluc1xuICAgKiBhICd0YXJnZXQnIHByb3BlcnR5OyBpZiBzbywgbWFrZXMgc3VyZSB0aGF0IGNvbW11bmljYXRpb24gd2l0aCB0aGF0XG4gICAqIHRhcmdldCBpcyBpbml0aWFsaXplZC5cbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG5cbiAgaW5pdCgpIHtcbiAgICBpZiggdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQgPT09ICdvc2MnIHx8IHRoaXMudGFyZ2V0ID09PSAnbWlkaScgKSB7XG4gICAgICBpZiggIUNvbW11bmljYXRpb24uaW5pdGlhbGl6ZWQgKSBDb21tdW5pY2F0aW9uLmluaXQoKVxuICAgIH1cblxuICAgIC8vIGlmIG1pbi9tYXggYXJlIG5vdCAwLTEgYW5kIHNjYWxpbmcgaXMgbm90IGRpc2FibGVkXG4gICAgaWYoIHRoaXMuc2NhbGVPdXRwdXQgJiYgKHRoaXMubWluICE9PSAwIHx8IHRoaXMubWF4ICE9PSAxICkpIHsgICAgICBcbiAgICAgIHRoaXMuX19wcmVmaWx0ZXJzLnB1c2goIFxuICAgICAgICBGaWx0ZXJzLlNjYWxlKCAwLDEsdGhpcy5taW4sdGhpcy5tYXggKSBcbiAgICAgIClcbiAgICB9XG4gIH0sXG5cbiAgcnVuRmlsdGVycyggdmFsdWUsIHdpZGdldCApIHtcbiAgICBmb3IoIGxldCBmaWx0ZXIgb2Ygd2lkZ2V0Ll9fcHJlZmlsdGVycyApICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB3aWRnZXQuZmlsdGVycyApICAgICAgIHZhbHVlID0gZmlsdGVyKCB2YWx1ZSApXG4gICAgZm9yKCBsZXQgZmlsdGVyIG9mIHdpZGdldC5fX3Bvc3RmaWx0ZXJzICkgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcbiAgIFxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIG91dHB1dCBvZiB3aWRnZXQgYnkgcnVubmluZyAuX192YWx1ZSBwcm9wZXJ0eSB0aHJvdWdoIGZpbHRlciBjaGFpbi5cbiAgICogVGhlIHJlc3VsdCBpcyBzdG9yZWQgaW4gdGhlIC52YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgd2lkZ2V0LCB3aGljaCBpcyB0aGVuXG4gICAqIHJldHVybmVkLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgb3V0cHV0KCkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX192YWx1ZSwgbmV3VmFsdWVHZW5lcmF0ZWQgPSBmYWxzZSwgbGFzdFZhbHVlID0gdGhpcy52YWx1ZSwgaXNBcnJheVxuXG4gICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkoIHZhbHVlIClcblxuICAgIGlmKCBpc0FycmF5ICkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoIHYgPT4gV2lkZ2V0LnJ1bkZpbHRlcnMoIHYsIHRoaXMgKSApXG4gICAgfWVsc2V7XG4gICAgICB2YWx1ZSA9IHRoaXMucnVuRmlsdGVycyggdmFsdWUsIHRoaXMgKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICBcbiAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKSB0aGlzLnRyYW5zbWl0KCB0aGlzLnZhbHVlIClcblxuICAgIGlmKCB0aGlzLl9fcHJldlZhbHVlICE9PSBudWxsICkge1xuICAgICAgaWYoIGlzQXJyYXkgKSB7XG4gICAgICAgIGlmKCAhVXRpbGl0aWVzLmNvbXBhcmVBcnJheXMoIHRoaXMuX192YWx1ZSwgdGhpcy5fX3ByZXZWYWx1ZSApICkge1xuICAgICAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIHRoaXMuX192YWx1ZSAhPT0gdGhpcy5fX3ByZXZWYWx1ZSApIHtcbiAgICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiggbmV3VmFsdWVHZW5lcmF0ZWQgKSB7IFxuICAgICAgaWYoIHRoaXMub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHRoaXMub252YWx1ZWNoYW5nZSggdGhpcy52YWx1ZSwgbGFzdFZhbHVlIClcblxuICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuX192YWx1ZSApICkge1xuICAgICAgICB0aGlzLl9fcHJldlZhbHVlID0gdGhpcy5fX3ZhbHVlLnNsaWNlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19wcmV2VmFsdWUgPSB0aGlzLl9fdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBuZXdWYWx1ZUdlbmVyYXRlZCBjYW4gYmUgdXNlIHRvIGRldGVybWluZSBpZiB3aWRnZXQgc2hvdWxkIGRyYXdcbiAgICByZXR1cm4gbmV3VmFsdWVHZW5lcmF0ZWRcbiAgfSxcblxuICAvKipcbiAgICogSWYgdGhlIHdpZGdldCBoYXMgYSByZW1vdGUgdGFyZ2V0IChub3QgYSB0YXJnZXQgaW5zaWRlIHRoZSBpbnRlcmZhY2Ugd2ViIHBhZ2UpXG4gICAqIHRoaXMgd2lsbCB0cmFuc21pdCB0aGUgd2lkZ2V0cyB2YWx1ZSB0byB0aGUgcmVtb3RlIGRlc3RpbmF0aW9uLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgdHJhbnNtaXQoIG91dHB1dCApIHtcbiAgICBpZiggdGhpcy50YXJnZXQgPT09ICdvc2MnICkge1xuICAgICAgQ29tbXVuaWNhdGlvbi5PU0Muc2VuZCggdGhpcy5hZGRyZXNzLCBvdXRwdXQgKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdGhpcy50YXJnZXRbIHRoaXMua2V5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLnRhcmdldFsgdGhpcy5rZXkgXSA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICB0aGlzLnRhcmdldFsgdGhpcy5rZXkgXSggb3V0cHV0IClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy50YXJnZXRbIHRoaXMua2V5IF0gPSBvdXRwdXQgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxuIiwibGV0IFdpZGdldExhYmVsID0ge1xuXG4gIGRlZmF1bHRzOiB7XG4gICAgc2l6ZToyNCxcbiAgICBmYWNlOidzYW5zLXNlcmlmJyxcbiAgICBmaWxsOid3aGl0ZScsXG4gICAgYWxpZ246J2NlbnRlcicsXG4gICAgYmFja2dyb3VuZDpudWxsLFxuICAgIHdpZHRoOjFcbiAgfSxcblxuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBsYWJlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbGFiZWwsIHRoaXMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCB0eXBlb2YgbGFiZWwuY3R4ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvciggJ1dpZGdldExhYmVscyBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggYSBjYW52YXMgY29udGV4dCAoY3R4KSBhcmd1bWVudCcgKVxuICAgIFxuICAgIGxhYmVsLmZvbnQgPSBgJHtsYWJlbC5zaXplfXB4ICR7bGFiZWwuZmFjZX1gXG5cbiAgICByZXR1cm4gbGFiZWxcbiAgfSxcblxuICBkcmF3KCkge1xuICAgIGxldCBjbnZzID0gdGhpcy5jdHguY2FudmFzLFxuICAgICAgICBjd2lkdGggPSBjbnZzLndpZHRoLFxuICAgICAgICBjaGVpZ2h0PSBjbnZzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gdGhpcy54ICogY3dpZHRoLFxuICAgICAgICB5ICAgICAgPSB0aGlzLnkgKiBjaGVpZ2h0LFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICogY3dpZHRoXG5cbiAgICBpZiggdGhpcy5iYWNrZ3JvdW5kICE9PSBudWxsICkge1xuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggeCx5LHdpZHRoLHRoaXMuc2l6ZSArIDEwIClcbiAgICB9XG4gICAgXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gdGhpcy5hbGlnblxuICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLmZvbnRcbiAgICB0aGlzLmN0eC5maWxsVGV4dCggdGhpcy50ZXh0LCB4LHksd2lkdGggKSAgICBcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldExhYmVsXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuaW1wb3J0IFZlYzIgZnJvbSAndmljdG9yJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIFhZXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBYWSA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBYWSwge1xuICAvKiogQGxlbmRzIFhZLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgWFkgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIFhZXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBjb3VudCBwcm9wZXJ0eSBkZXRlcm1pbmVzIHRoZSBudW1iZXIgb2Ygc2xpZGVycyBpbiB0aGUgbXVsdGlzbGlkZXIsIGRlZmF1bHQgNC5cbiAgICAgKiBAbWVtYmVyb2YgWFlcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7SW50ZWdlcn1cbiAgICAgKi9cbiAgICBjb3VudDo0LFxuICAgIGxpbmVXaWR0aDoxLFxuICAgIHVzZVBoeXNpY3M6dHJ1ZSxcbiAgICB0b3VjaFNpemU6NTAsXG4gICAgZmlsbDoncmdiYSggMjU1LDI1NSwyNTUsIC4yICknLFxuICAgIHN0cm9rZTonIzk5OScsXG4gICAgYmFja2dyb3VuZDonIzAwMCcsXG4gICAgZnJpY3Rpb246LjAsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBYWSBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIFhZXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBYWSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCB4eSA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggWFkgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIHh5IClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggeHksIFhZLmRlZmF1bHRzLCBwcm9wcywge1xuICAgICAgdmFsdWU6W10sXG4gICAgICBfX3ZhbHVlOltdLFxuICAgICAgdG91Y2hlczpbXSxcbiAgICB9KVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICAvLyBpZiggcHJvcHMudmFsdWUgKSB4eS5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIHh5LmluaXQoKVxuICAgIFxuICAgIHh5Lm9ucGxhY2UgPSAoKSA9PiB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHh5LmNvdW50OyBpKysgKSB7XG4gICAgICAgIHh5LnRvdWNoZXMucHVzaCh7XG4gICAgICAgICAgcG9zOiBuZXcgVmVjMiggaSAqICggeHkucmVjdC53aWR0aCAvIHh5LmNvdW50ICksIGkgKiAoIHh5LnJlY3QuaGVpZ2h0IC8geHkuY291bnQgKSApLFxuICAgICAgICAgIHZlbDogbmV3IFZlYzIoIDAsMCApLFxuICAgICAgICAgIGFjYzogbmV3IFZlYzIoIC4wNSwuMDUgKSxcbiAgICAgICAgICBuYW1lOiB4eS5uYW1lcyA9PT0gdW5kZWZpbmVkID8gaSA6IHh5Lm5hbWVzWyBpIF1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYoIHh5LnVzZVBoeXNpY3MgPT09IHRydWUgKVxuICAgICAgICB4eS5zdGFydEFuaW1hdGlvbkxvb3AoKVxuICAgIH1cblxuICAgIHJldHVybiB4eVxuICB9LFxuXG4gIHN0YXJ0QW5pbWF0aW9uTG9vcCgpIHtcbiAgICB0aGlzLmRyYXcoIHRydWUgKVxuXG4gICAgbGV0IGxvb3AgPSAoKT0+IHsgXG4gICAgICB0aGlzLmRyYXcoKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggbG9vcCApXG4gICAgfVxuXG4gICAgbG9vcCgpXG4gIH0sXG5cbiAgYW5pbWF0ZSgpIHtcbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRydWUgXG4gICAgbGV0IF9fZnJpY3Rpb24gPSBuZXcgVmVjMiggLTEgKiB0aGlzLmZyaWN0aW9uLCAtMSAqIHRoaXMuZnJpY3Rpb24gKVxuICAgIGZvciggbGV0IHRvdWNoIG9mIHRoaXMudG91Y2hlcyApIHtcbiAgICAgIGlmKCB0b3VjaC52ZWwueCAhPT0gMCAmJiB0b3VjaC52ZWwueSAhPT0gMCApIHtcbiAgICAgICAgLy90b3VjaC52ZWwuYWRkKCB0b3VjaC5hY2MgKVxuICAgICAgICBsZXQgZnJpY3Rpb24gPSB0b3VjaC52ZWwuY2xvbmUoKVxuICAgICAgICBmcmljdGlvbi54ICo9IC0xICogdGhpcy5mcmljdGlvblxuICAgICAgICBmcmljdGlvbi55ICo9IC0xICogdGhpcy5mcmljdGlvblxuICAgICAgICB0b3VjaC52ZWwuYWRkKCBmcmljdGlvbiApXG5cbiAgICAgICAgaWYoICh0b3VjaC5wb3MueCAtIHRoaXMudG91Y2hTaXplKSArIHRvdWNoLnZlbC54IDwgMCApIHtcbiAgICAgICAgICB0b3VjaC5wb3MueCA9IHRoaXMudG91Y2hTaXplXG4gICAgICAgICAgdG91Y2gudmVsLnggKj0gLTFcbiAgICAgICAgfSBlbHNlIGlmICggdG91Y2gucG9zLnggKyB0aGlzLnRvdWNoU2l6ZSArIHRvdWNoLnZlbC54ID4gdGhpcy5yZWN0LndpZHRoICkge1xuICAgICAgICAgIHRvdWNoLnBvcy54ID0gdGhpcy5yZWN0LndpZHRoIC0gdGhpcy50b3VjaFNpemVcbiAgICAgICAgICB0b3VjaC52ZWwueCAqPSAtMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvdWNoLnBvcy54ICs9IHRvdWNoLnZlbC54IFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICh0b3VjaC5wb3MueSAtIHRoaXMudG91Y2hTaXplKSArIHRvdWNoLnZlbC55IDwgMCApIHsgXG4gICAgICAgICAgdG91Y2gucG9zLnkgPSB0aGlzLnRvdWNoU2l6ZVxuICAgICAgICAgIHRvdWNoLnZlbC55ICo9IC0xXG4gICAgICAgIH0gZWxzZSBpZiAoIHRvdWNoLnBvcy55ICsgdGhpcy50b3VjaFNpemUgKyB0b3VjaC52ZWwueSA+IHRoaXMucmVjdC5oZWlnaHQgKSB7XG4gICAgICAgICAgdG91Y2gucG9zLnkgPSB0aGlzLnJlY3QuaGVpZ2h0IC0gdGhpcy50b3VjaFNpemVcbiAgICAgICAgICB0b3VjaC52ZWwueSAqPSAtMVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0b3VjaC5wb3MueSArPSB0b3VjaC52ZWwueVxuICAgICAgICB9XG5cbiAgICAgICAgc2hvdWxkRHJhdyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkRHJhd1xuICB9LFxuICBcbiAgLyoqXG4gICAqIERyYXcgdGhlIFhZIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgWFlcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCBvdmVycmlkZT1mYWxzZSApIHtcbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMuYW5pbWF0ZSgpXG5cbiAgICBpZiggc2hvdWxkRHJhdyA9PT0gZmFsc2UgJiYgb3ZlcnJpZGUgPT09IGZhbHNlICkgcmV0dXJuXG5cbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCAwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsICh4eSB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuICAgICAgbGV0IGNoaWxkID0gdGhpcy50b3VjaGVzWyBpIF1cbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuXG4gICAgICB0aGlzLmN0eC5hcmMoIGNoaWxkLnBvcy54LCBjaGlsZC5wb3MueSwgdGhpcy50b3VjaFNpemUsIDAsIE1hdGguUEkgKiAyLCB0cnVlIClcblxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKClcblxuICAgICAgdGhpcy5jdHguZmlsbCgpXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHRoaXMueCArIGNoaWxkLngsIHRoaXMueSArIGNoaWxkLnksIHRoaXMuY2hpbGRXaWR0aCwgdGhpcy5jaGlsZEhlaWdodCk7XG4gICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgICB0aGlzLmN0eC5mb250ID0gJ25vcm1hbCAyMHB4IEhlbHZldGljYSdcbiAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCBjaGlsZC5uYW1lLCBjaGlsZC5wb3MueCwgY2hpbGQucG9zLnkgKVxuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICB0aGlzLnBvaW50ZXJ1cCApXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSB4eSB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICBcbiAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIC8vaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgLy90aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIC8vd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIC8vfVxuICAgICAgbGV0IHRvdWNoID0gdGhpcy50b3VjaGVzLmZpbmQoIHQgPT4gdC5wb2ludGVySWQgPT09IGUucG9pbnRlcklkIClcblxuICAgICAgaWYoIHRvdWNoICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdmb3VuZCcsIHRvdWNoLm5hbWUsIGUucG9pbnRlcklkIClcbiAgICAgICAgdG91Y2gudmVsLnggPSAoIGUuY2xpZW50WCAtIHRvdWNoLmxhc3RYICkgKiAuNVxuICAgICAgICB0b3VjaC52ZWwueSA9ICggZS5jbGllbnRZIC0gdG91Y2gubGFzdFkgKSAqIC41XG4gICAgICAgIC8vY29uc29sZS5sb2coIHRvdWNoLnZlbC54LCBlLmNsaWVudFgsIHRvdWNoLmxhc3RYLCB0b3VjaC5wb3MueCAgKVxuICAgICAgICB0b3VjaC5wb2ludGVySWQgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS5sb2coJ3VuZGVmaW5lZCB0b3VjaCcsIGUucG9pbnRlcklkIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBsZXQgdG91Y2ggPSB0aGlzLnRvdWNoZXMuZmluZCggdCA9PiB0LnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQgKVxuXG4gICAgICBpZiggdG91Y2ggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdG91Y2gubGFzdFggPSB0b3VjaC5wb3MueFxuICAgICAgICB0b3VjaC5sYXN0WSA9IHRvdWNoLnBvcy55XG5cbiAgICAgICAgdG91Y2gucG9zLnggPSBlLmNsaWVudFhcbiAgICAgICAgdG91Y2gucG9zLnkgPSBlLmNsaWVudFlcbiAgICAgIH1cblxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgWFkncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBYWVxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IGNsb3Nlc3REaWZmID0gSW5maW5pdHksXG4gICAgICAgIHRvdWNoRm91bmQgPSBudWxsLFxuICAgICAgICB0b3VjaE51bSA9IG51bGxcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdG91Y2ggPSB0aGlzLnRvdWNoZXNbIGkgXSxcbiAgICAgICAgICB4ZGlmZiA9IE1hdGguYWJzKCB0b3VjaC5wb3MueCAtIGUuY2xpZW50WCApLFxuICAgICAgICAgIHlkaWZmID0gTWF0aC5hYnMoIHRvdWNoLnBvcy55IC0gZS5jbGllbnRZIClcblxuICAgICAgaWYoIHhkaWZmICsgeWRpZmYgPCBjbG9zZXN0RGlmZiApIHtcbiAgICAgICAgY2xvc2VzdERpZmYgPSB4ZGlmZiArIHlkaWZmXG4gICAgICAgIHRvdWNoRm91bmQgPSB0b3VjaFxuICAgICAgICB0b3VjaE51bSA9IGlcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ3RvdWNoIGZvdW5kJywgdG91Y2hOdW0sIGNsb3Nlc3REaWZmLCBlLnBvaW50ZXJJZCApXG4gICAgICB9XG4gICAgfVxuXG4gICAgdG91Y2hGb3VuZC5pc0FjdGl2ZSA9IHRydWVcbiAgICB0b3VjaEZvdW5kLnZlbC54ID0gMFxuICAgIHRvdWNoRm91bmQudmVsLnkgPSAwXG4gICAgdG91Y2hGb3VuZC5wb3MueCA9IHRvdWNoRm91bmQubGFzdFggPSBlLmNsaWVudFhcbiAgICB0b3VjaEZvdW5kLnBvcy55ID0gdG91Y2hGb3VuZC5sYXN0WSA9IGUuY2xpZW50WVxuICAgIHRvdWNoRm91bmQucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgIHRoaXMub3V0cHV0KClcbiAgICAvL3RvdWNoRm91bmQuaWRlbnRpZmllciA9IF90b3VjaC5pZGVudGlmaWVyXG4gICAgLy90b3VjaEZvdW5kLmNoaWxkSUQgPSB0b3VjaE51bVxuICAgIC8vaWYoIHRoaXMuc3R5bGUgPT09ICdob3Jpem9udGFsJyApIHtcbiAgICAvLyAgc2xpZGVyTnVtID0gTWF0aC5mbG9vciggKCBlLmNsaWVudFkgLyB0aGlzLnJlY3QuaGVpZ2h0ICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAvLyAgdGhpcy5fX3ZhbHVlWyBzbGlkZXJOdW0gXSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIC8vfWVsc2V7XG4gICAgLy8gIHNsaWRlck51bSA9IE1hdGguZmxvb3IoICggZS5jbGllbnRYIC8gdGhpcy5yZWN0LndpZHRoICkgLyAoIDEvdGhpcy5jb3VudCApIClcbiAgICAvLyAgdGhpcy5fX3ZhbHVlWyBzbGlkZXJOdW0gXSA9IDEgLSAoIGUuY2xpZW50WSAtIHRoaXMucmVjdC50b3AgICkgLyB0aGlzLnJlY3QuaGVpZ2h0IFxuICAgIC8vfVxuXG4gICAgLy9mb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuY291bnQ7IGkrKyAgKSB7XG4gICAgLy8gIGlmKCB0aGlzLl9fdmFsdWVbIGkgXSA+IDEgKSB0aGlzLl9fdmFsdWVbIGkgXSA9IDFcbiAgICAvLyAgaWYoIHRoaXMuX192YWx1ZVsgaSBdIDwgMCApIHRoaXMuX192YWx1ZVsgaSBdID0gMFxuICAgIC8vfVxuXG4gICAgLy9sZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICAvL2lmKCBzaG91bGREcmF3ICkgdGhpcy5kcmF3KClcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBYWVxuIiwiLyohXG4gKiBQRVAgdjAuNC4zIHwgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9QRVBcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIHwgaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5Qb2ludGVyRXZlbnRzUG9seWZpbGwgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgY29uc3RydWN0b3IgZm9yIG5ldyBQb2ludGVyRXZlbnRzLlxuICAgKlxuICAgKiBOZXcgUG9pbnRlciBFdmVudHMgbXVzdCBiZSBnaXZlbiBhIHR5cGUsIGFuZCBhbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mXG4gICAqIGluaXRpYWxpemF0aW9uIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIER1ZSB0byBjZXJ0YWluIHBsYXRmb3JtIHJlcXVpcmVtZW50cywgZXZlbnRzIHJldHVybmVkIGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gICAqIGlkZW50aWZ5IGFzIE1vdXNlRXZlbnRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IGluVHlwZSBUaGUgdHlwZSBvZiB0aGUgZXZlbnQgdG8gY3JlYXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2luRGljdF0gQW4gb3B0aW9uYWwgZGljdGlvbmFyeSBvZiBpbml0aWFsIGV2ZW50IHByb3BlcnRpZXMuXG4gICAqIEByZXR1cm4ge0V2ZW50fSBBIG5ldyBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgaW5pdGlhbGl6ZWQgd2l0aCBwcm9wZXJ0aWVzIGZyb20gYGluRGljdGAuXG4gICAqL1xuICB2YXIgTU9VU0VfUFJPUFMgPSBbXG4gICAgJ2J1YmJsZXMnLFxuICAgICdjYW5jZWxhYmxlJyxcbiAgICAndmlldycsXG4gICAgJ2RldGFpbCcsXG4gICAgJ3NjcmVlblgnLFxuICAgICdzY3JlZW5ZJyxcbiAgICAnY2xpZW50WCcsXG4gICAgJ2NsaWVudFknLFxuICAgICdjdHJsS2V5JyxcbiAgICAnYWx0S2V5JyxcbiAgICAnc2hpZnRLZXknLFxuICAgICdtZXRhS2V5JyxcbiAgICAnYnV0dG9uJyxcbiAgICAncmVsYXRlZFRhcmdldCcsXG4gICAgJ3BhZ2VYJyxcbiAgICAncGFnZVknXG4gIF07XG5cbiAgdmFyIE1PVVNFX0RFRkFVTFRTID0gW1xuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIDAsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICBmdW5jdGlvbiBQb2ludGVyRXZlbnQoaW5UeXBlLCBpbkRpY3QpIHtcbiAgICBpbkRpY3QgPSBpbkRpY3QgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZS5pbml0RXZlbnQoaW5UeXBlLCBpbkRpY3QuYnViYmxlcyB8fCBmYWxzZSwgaW5EaWN0LmNhbmNlbGFibGUgfHwgZmFsc2UpO1xuXG4gICAgLy8gZGVmaW5lIGluaGVyaXRlZCBNb3VzZUV2ZW50IHByb3BlcnRpZXNcbiAgICAvLyBza2lwIGJ1YmJsZXMgYW5kIGNhbmNlbGFibGUgc2luY2UgdGhleSdyZSBzZXQgYWJvdmUgaW4gaW5pdEV2ZW50KClcbiAgICBmb3IgKHZhciBpID0gMiwgcDsgaSA8IE1PVVNFX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwID0gTU9VU0VfUFJPUFNbaV07XG4gICAgICBlW3BdID0gaW5EaWN0W3BdIHx8IE1PVVNFX0RFRkFVTFRTW2ldO1xuICAgIH1cbiAgICBlLmJ1dHRvbnMgPSBpbkRpY3QuYnV0dG9ucyB8fCAwO1xuXG4gICAgLy8gU3BlYyByZXF1aXJlcyB0aGF0IHBvaW50ZXJzIHdpdGhvdXQgcHJlc3N1cmUgc3BlY2lmaWVkIHVzZSAwLjUgZm9yIGRvd25cbiAgICAvLyBzdGF0ZSBhbmQgMCBmb3IgdXAgc3RhdGUuXG4gICAgdmFyIHByZXNzdXJlID0gMDtcblxuICAgIGlmIChpbkRpY3QucHJlc3N1cmUgJiYgZS5idXR0b25zKSB7XG4gICAgICBwcmVzc3VyZSA9IGluRGljdC5wcmVzc3VyZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJlc3N1cmUgPSBlLmJ1dHRvbnMgPyAwLjUgOiAwO1xuICAgIH1cblxuICAgIC8vIGFkZCB4L3kgcHJvcGVydGllcyBhbGlhc2VkIHRvIGNsaWVudFgvWVxuICAgIGUueCA9IGUuY2xpZW50WDtcbiAgICBlLnkgPSBlLmNsaWVudFk7XG5cbiAgICAvLyBkZWZpbmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIFBvaW50ZXJFdmVudCBpbnRlcmZhY2VcbiAgICBlLnBvaW50ZXJJZCA9IGluRGljdC5wb2ludGVySWQgfHwgMDtcbiAgICBlLndpZHRoID0gaW5EaWN0LndpZHRoIHx8IDA7XG4gICAgZS5oZWlnaHQgPSBpbkRpY3QuaGVpZ2h0IHx8IDA7XG4gICAgZS5wcmVzc3VyZSA9IHByZXNzdXJlO1xuICAgIGUudGlsdFggPSBpbkRpY3QudGlsdFggfHwgMDtcbiAgICBlLnRpbHRZID0gaW5EaWN0LnRpbHRZIHx8IDA7XG4gICAgZS50d2lzdCA9IGluRGljdC50d2lzdCB8fCAwO1xuICAgIGUudGFuZ2VudGlhbFByZXNzdXJlID0gaW5EaWN0LnRhbmdlbnRpYWxQcmVzc3VyZSB8fCAwO1xuICAgIGUucG9pbnRlclR5cGUgPSBpbkRpY3QucG9pbnRlclR5cGUgfHwgJyc7XG4gICAgZS5od1RpbWVzdGFtcCA9IGluRGljdC5od1RpbWVzdGFtcCB8fCAwO1xuICAgIGUuaXNQcmltYXJ5ID0gaW5EaWN0LmlzUHJpbWFyeSB8fCBmYWxzZTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSBpbXBsZW1lbnRzIGEgbWFwIG9mIHBvaW50ZXIgc3RhdGVzXG4gICAqL1xuICB2YXIgVVNFX01BUCA9IHdpbmRvdy5NYXAgJiYgd2luZG93Lk1hcC5wcm90b3R5cGUuZm9yRWFjaDtcbiAgdmFyIFBvaW50ZXJNYXAgPSBVU0VfTUFQID8gTWFwIDogU3BhcnNlQXJyYXlNYXA7XG5cbiAgZnVuY3Rpb24gU3BhcnNlQXJyYXlNYXAoKSB7XG4gICAgdGhpcy5hcnJheSA9IFtdO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gIH1cblxuICBTcGFyc2VBcnJheU1hcC5wcm90b3R5cGUgPSB7XG4gICAgc2V0OiBmdW5jdGlvbihrLCB2KSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZShrKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5oYXMoaykpIHtcbiAgICAgICAgdGhpcy5zaXplKys7XG4gICAgICB9XG4gICAgICB0aGlzLmFycmF5W2tdID0gdjtcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXlba10gIT09IHVuZGVmaW5lZDtcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24oaykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmFycmF5W2tdO1xuICAgICAgICB0aGlzLnNpemUtLTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXlba107XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFycmF5Lmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnNpemUgPSAwO1xuICAgIH0sXG5cbiAgICAvLyByZXR1cm4gdmFsdWUsIGtleSwgbWFwXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmFycmF5LmZvckVhY2goZnVuY3Rpb24odiwgaykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIGssIHRoaXMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBDTE9ORV9QUk9QUyA9IFtcblxuICAgIC8vIE1vdXNlRXZlbnRcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcblxuICAgIC8vIERPTSBMZXZlbCAzXG4gICAgJ2J1dHRvbnMnLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgJ3BvaW50ZXJJZCcsXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAncHJlc3N1cmUnLFxuICAgICd0aWx0WCcsXG4gICAgJ3RpbHRZJyxcbiAgICAncG9pbnRlclR5cGUnLFxuICAgICdod1RpbWVzdGFtcCcsXG4gICAgJ2lzUHJpbWFyeScsXG5cbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICd0eXBlJyxcbiAgICAndGFyZ2V0JyxcbiAgICAnY3VycmVudFRhcmdldCcsXG4gICAgJ3doaWNoJyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWScsXG4gICAgJ3RpbWVTdGFtcCdcbiAgXTtcblxuICB2YXIgQ0xPTkVfREVGQVVMVFMgPSBbXG5cbiAgICAvLyBNb3VzZUV2ZW50XG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuXG4gICAgLy8gRE9NIExldmVsIDNcbiAgICAwLFxuXG4gICAgLy8gUG9pbnRlckV2ZW50XG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgJycsXG4gICAgMCxcbiAgICBmYWxzZSxcblxuICAgIC8vIGV2ZW50IGluc3RhbmNlXG4gICAgJycsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICB2YXIgQk9VTkRBUllfRVZFTlRTID0ge1xuICAgICdwb2ludGVyb3Zlcic6IDEsXG4gICAgJ3BvaW50ZXJvdXQnOiAxLFxuICAgICdwb2ludGVyZW50ZXInOiAxLFxuICAgICdwb2ludGVybGVhdmUnOiAxXG4gIH07XG5cbiAgdmFyIEhBU19TVkdfSU5TVEFOQ0UgPSAodHlwZW9mIFNWR0VsZW1lbnRJbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSBpcyBmb3Igbm9ybWFsaXppbmcgZXZlbnRzLiBNb3VzZSBhbmQgVG91Y2ggZXZlbnRzIHdpbGwgYmVcbiAgICogY29sbGVjdGVkIGhlcmUsIGFuZCBmaXJlIFBvaW50ZXJFdmVudHMgdGhhdCBoYXZlIHRoZSBzYW1lIHNlbWFudGljcywgbm9cbiAgICogbWF0dGVyIHRoZSBzb3VyY2UuXG4gICAqIEV2ZW50cyBmaXJlZDpcbiAgICogICAtIHBvaW50ZXJkb3duOiBhIHBvaW50aW5nIGlzIGFkZGVkXG4gICAqICAgLSBwb2ludGVydXA6IGEgcG9pbnRlciBpcyByZW1vdmVkXG4gICAqICAgLSBwb2ludGVybW92ZTogYSBwb2ludGVyIGlzIG1vdmVkXG4gICAqICAgLSBwb2ludGVyb3ZlcjogYSBwb2ludGVyIGNyb3NzZXMgaW50byBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyb3V0OiBhIHBvaW50ZXIgbGVhdmVzIGFuIGVsZW1lbnRcbiAgICogICAtIHBvaW50ZXJjYW5jZWw6IGEgcG9pbnRlciB3aWxsIG5vIGxvbmdlciBnZW5lcmF0ZSBldmVudHNcbiAgICovXG4gIHZhciBkaXNwYXRjaGVyID0ge1xuICAgIHBvaW50ZXJtYXA6IG5ldyBQb2ludGVyTWFwKCksXG4gICAgZXZlbnRNYXA6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgY2FwdHVyZUluZm86IE9iamVjdC5jcmVhdGUobnVsbCksXG5cbiAgICAvLyBTY29wZSBvYmplY3RzIGZvciBuYXRpdmUgZXZlbnRzLlxuICAgIC8vIFRoaXMgZXhpc3RzIGZvciBlYXNlIG9mIHRlc3RpbmcuXG4gICAgZXZlbnRTb3VyY2VzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGV2ZW50U291cmNlTGlzdDogW10sXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGV2ZW50IHNvdXJjZSB0aGF0IHdpbGwgZ2VuZXJhdGUgcG9pbnRlciBldmVudHMuXG4gICAgICpcbiAgICAgKiBgaW5Tb3VyY2VgIG11c3QgY29udGFpbiBhbiBhcnJheSBvZiBldmVudCBuYW1lcyBuYW1lZCBgZXZlbnRzYCwgYW5kXG4gICAgICogZnVuY3Rpb25zIHdpdGggdGhlIG5hbWVzIHNwZWNpZmllZCBpbiB0aGUgYGV2ZW50c2AgYXJyYXkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBuYW1lIGZvciB0aGUgZXZlbnQgc291cmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBBIG5ldyBzb3VyY2Ugb2YgcGxhdGZvcm0gZXZlbnRzLlxuICAgICAqL1xuICAgIHJlZ2lzdGVyU291cmNlOiBmdW5jdGlvbihuYW1lLCBzb3VyY2UpIHtcbiAgICAgIHZhciBzID0gc291cmNlO1xuICAgICAgdmFyIG5ld0V2ZW50cyA9IHMuZXZlbnRzO1xuICAgICAgaWYgKG5ld0V2ZW50cykge1xuICAgICAgICBuZXdFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKHNbZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYXBbZV0gPSBzW2VdLmJpbmQocyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZXNbbmFtZV0gPSBzO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlTGlzdC5wdXNoKHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBsID0gdGhpcy5ldmVudFNvdXJjZUxpc3QubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVzOyAoaSA8IGwpICYmIChlcyA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0W2ldKTsgaSsrKSB7XG5cbiAgICAgICAgLy8gY2FsbCBldmVudHNvdXJjZSByZWdpc3RlclxuICAgICAgICBlcy5yZWdpc3Rlci5jYWxsKGVzLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBsID0gdGhpcy5ldmVudFNvdXJjZUxpc3QubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVzOyAoaSA8IGwpICYmIChlcyA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0W2ldKTsgaSsrKSB7XG5cbiAgICAgICAgLy8gY2FsbCBldmVudHNvdXJjZSByZWdpc3RlclxuICAgICAgICBlcy51bnJlZ2lzdGVyLmNhbGwoZXMsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbnM6IC8qc2NvcGUuZXh0ZXJuYWwuY29udGFpbnMgfHwgKi9mdW5jdGlvbihjb250YWluZXIsIGNvbnRhaW5lZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhjb250YWluZWQpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcblxuICAgICAgICAvLyBtb3N0IGxpa2VseTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjA4NDI3XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRVZFTlRTXG4gICAgZG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyZG93bicsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVybW92ZScsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcnVwJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBlbnRlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gZmFsc2U7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmVudGVyJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBsZWF2ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gZmFsc2U7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmxlYXZlJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBvdmVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJvdmVyJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBvdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm91dCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJjYW5jZWwnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGxlYXZlT3V0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdGhpcy5vdXQoZXZlbnQpO1xuICAgICAgdGhpcy5wcm9wYWdhdGUoZXZlbnQsIHRoaXMubGVhdmUsIGZhbHNlKTtcbiAgICB9LFxuICAgIGVudGVyT3ZlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMub3ZlcihldmVudCk7XG4gICAgICB0aGlzLnByb3BhZ2F0ZShldmVudCwgdGhpcy5lbnRlciwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIC8vIExJU1RFTkVSIExPR0lDXG4gICAgZXZlbnRIYW5kbGVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG5cbiAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IG11bHRpcGxlIGRpc3BhdGNoIG9mIHBvaW50ZXJldmVudHMgZnJvbVxuICAgICAgLy8gcGxhdGZvcm0gZXZlbnRzLiBUaGlzIGNhbiBoYXBwZW4gd2hlbiB0d28gZWxlbWVudHMgaW4gZGlmZmVyZW50IHNjb3Blc1xuICAgICAgLy8gYXJlIHNldCB1cCB0byBjcmVhdGUgcG9pbnRlciBldmVudHMsIHdoaWNoIGlzIHJlbGV2YW50IHRvIFNoYWRvdyBET00uXG4gICAgICBpZiAoaW5FdmVudC5faGFuZGxlZEJ5UEUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHR5cGUgPSBpbkV2ZW50LnR5cGU7XG4gICAgICB2YXIgZm4gPSB0aGlzLmV2ZW50TWFwICYmIHRoaXMuZXZlbnRNYXBbdHlwZV07XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgZm4oaW5FdmVudCk7XG4gICAgICB9XG4gICAgICBpbkV2ZW50Ll9oYW5kbGVkQnlQRSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8vIHNldCB1cCBldmVudCBsaXN0ZW5lcnNcbiAgICBsaXN0ZW46IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRzKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQodGFyZ2V0LCBlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyByZW1vdmUgZXZlbnQgbGlzdGVuZXJzXG4gICAgdW5saXN0ZW46IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRzKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnQodGFyZ2V0LCBlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgYWRkRXZlbnQ6IC8qc2NvcGUuZXh0ZXJuYWwuYWRkRXZlbnQgfHwgKi9mdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSkge1xuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmJvdW5kSGFuZGxlcik7XG4gICAgfSxcbiAgICByZW1vdmVFdmVudDogLypzY29wZS5leHRlcm5hbC5yZW1vdmVFdmVudCB8fCAqL2Z1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuYm91bmRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLy8gRVZFTlQgQ1JFQVRJT04gQU5EIFRSQUNLSU5HXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFdmVudCBvZiB0eXBlIGBpblR5cGVgLCBiYXNlZCBvbiB0aGUgaW5mb3JtYXRpb24gaW5cbiAgICAgKiBgaW5FdmVudGAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW5UeXBlIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHlwZSBvZiBldmVudCB0byBjcmVhdGVcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBpbkV2ZW50IEEgcGxhdGZvcm0gZXZlbnQgd2l0aCBhIHRhcmdldFxuICAgICAqIEByZXR1cm4ge0V2ZW50fSBBIFBvaW50ZXJFdmVudCBvZiB0eXBlIGBpblR5cGVgXG4gICAgICovXG4gICAgbWFrZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcblxuICAgICAgLy8gcmVsYXRlZFRhcmdldCBtdXN0IGJlIG51bGwgaWYgcG9pbnRlciBpcyBjYXB0dXJlZFxuICAgICAgaWYgKHRoaXMuY2FwdHVyZUluZm9baW5FdmVudC5wb2ludGVySWRdKSB7XG4gICAgICAgIGluRXZlbnQucmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgZSA9IG5ldyBQb2ludGVyRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIGlmIChpbkV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQgPSBpbkV2ZW50LnByZXZlbnREZWZhdWx0O1xuICAgICAgfVxuICAgICAgZS5fdGFyZ2V0ID0gZS5fdGFyZ2V0IHx8IGluRXZlbnQudGFyZ2V0O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8vIG1ha2UgYW5kIGRpc3BhdGNoIGFuIGV2ZW50IGluIG9uZSBjYWxsXG4gICAgZmlyZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5tYWtlRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc25hcHNob3Qgb2YgaW5FdmVudCwgd2l0aCB3cml0YWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBbiBldmVudCB0aGF0IGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gY29weS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIHNoYWxsb3cgY29waWVzIG9mIGBpbkV2ZW50YCdzXG4gICAgICogICAgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICBjbG9uZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnRDb3B5ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHZhciBwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBDTE9ORV9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwID0gQ0xPTkVfUFJPUFNbaV07XG4gICAgICAgIGV2ZW50Q29weVtwXSA9IGluRXZlbnRbcF0gfHwgQ0xPTkVfREVGQVVMVFNbaV07XG5cbiAgICAgICAgLy8gV29yayBhcm91bmQgU1ZHSW5zdGFuY2VFbGVtZW50IHNoYWRvdyB0cmVlXG4gICAgICAgIC8vIFJldHVybiB0aGUgPHVzZT4gZWxlbWVudCB0aGF0IGlzIHJlcHJlc2VudGVkIGJ5IHRoZSBpbnN0YW5jZSBmb3IgU2FmYXJpLCBDaHJvbWUsIElFLlxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBiZWhhdmlvciBpbXBsZW1lbnRlZCBieSBGaXJlZm94LlxuICAgICAgICBpZiAoSEFTX1NWR19JTlNUQU5DRSAmJiAocCA9PT0gJ3RhcmdldCcgfHwgcCA9PT0gJ3JlbGF0ZWRUYXJnZXQnKSkge1xuICAgICAgICAgIGlmIChldmVudENvcHlbcF0gaW5zdGFuY2VvZiBTVkdFbGVtZW50SW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGV2ZW50Q29weVtwXSA9IGV2ZW50Q29weVtwXS5jb3JyZXNwb25kaW5nVXNlRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8ga2VlcCB0aGUgc2VtYW50aWNzIG9mIHByZXZlbnREZWZhdWx0XG4gICAgICBpZiAoaW5FdmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudENvcHkucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRDb3B5O1xuICAgIH0sXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IHRoaXMuY2FwdHVyZUluZm9baW5FdmVudC5wb2ludGVySWRdO1xuICAgICAgaWYgKCFjYXB0dXJlKSB7XG4gICAgICAgIHJldHVybiBpbkV2ZW50Ll90YXJnZXQ7XG4gICAgICB9XG4gICAgICBpZiAoaW5FdmVudC5fdGFyZ2V0ID09PSBjYXB0dXJlIHx8ICEoaW5FdmVudC50eXBlIGluIEJPVU5EQVJZX0VWRU5UUykpIHtcbiAgICAgICAgcmV0dXJuIGNhcHR1cmU7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm9wYWdhdGU6IGZ1bmN0aW9uKGV2ZW50LCBmbiwgcHJvcGFnYXRlRG93bikge1xuICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgIHZhciB0YXJnZXRzID0gW107XG5cbiAgICAgIC8vIE9yZGVyIG9mIGNvbmRpdGlvbnMgZHVlIHRvIGRvY3VtZW50LmNvbnRhaW5zKCkgbWlzc2luZyBpbiBJRS5cbiAgICAgIHdoaWxlICh0YXJnZXQgIT09IGRvY3VtZW50ICYmICF0YXJnZXQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0cy5wdXNoKHRhcmdldCk7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIFRvdWNoOiBEbyBub3QgcHJvcGFnYXRlIGlmIG5vZGUgaXMgZGV0YWNoZWQuXG4gICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocHJvcGFnYXRlRG93bikge1xuICAgICAgICB0YXJnZXRzLnJldmVyc2UoKTtcbiAgICAgIH1cbiAgICAgIHRhcmdldHMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgZXZlbnQudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgc2V0Q2FwdHVyZTogZnVuY3Rpb24oaW5Qb2ludGVySWQsIGluVGFyZ2V0LCBza2lwRGlzcGF0Y2gpIHtcbiAgICAgIGlmICh0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSkge1xuICAgICAgICB0aGlzLnJlbGVhc2VDYXB0dXJlKGluUG9pbnRlcklkLCBza2lwRGlzcGF0Y2gpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSA9IGluVGFyZ2V0O1xuICAgICAgdGhpcy5pbXBsaWNpdFJlbGVhc2UgPSB0aGlzLnJlbGVhc2VDYXB0dXJlLmJpbmQodGhpcywgaW5Qb2ludGVySWQsIHNraXBEaXNwYXRjaCk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyY2FuY2VsJywgdGhpcy5pbXBsaWNpdFJlbGVhc2UpO1xuXG4gICAgICB2YXIgZSA9IG5ldyBQb2ludGVyRXZlbnQoJ2dvdHBvaW50ZXJjYXB0dXJlJyk7XG4gICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgZS5fdGFyZ2V0ID0gaW5UYXJnZXQ7XG5cbiAgICAgIGlmICghc2tpcERpc3BhdGNoKSB7XG4gICAgICAgIHRoaXMuYXN5bmNEaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVsZWFzZUNhcHR1cmU6IGZ1bmN0aW9uKGluUG9pbnRlcklkLCBza2lwRGlzcGF0Y2gpIHtcbiAgICAgIHZhciB0ID0gdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF07XG4gICAgICBpZiAoIXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSA9IHVuZGVmaW5lZDtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG5cbiAgICAgIHZhciBlID0gbmV3IFBvaW50ZXJFdmVudCgnbG9zdHBvaW50ZXJjYXB0dXJlJyk7XG4gICAgICBlLnBvaW50ZXJJZCA9IGluUG9pbnRlcklkO1xuICAgICAgZS5fdGFyZ2V0ID0gdDtcblxuICAgICAgaWYgKCFza2lwRGlzcGF0Y2gpIHtcbiAgICAgICAgdGhpcy5hc3luY0Rpc3BhdGNoRXZlbnQoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIHRoZSBldmVudCB0byBpdHMgdGFyZ2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBUaGUgZXZlbnQgdG8gYmUgZGlzcGF0Y2hlZC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIGFuIGV2ZW50IGhhbmRsZXIgcmV0dXJucyB0cnVlLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZGlzcGF0Y2hFdmVudDogLypzY29wZS5leHRlcm5hbC5kaXNwYXRjaEV2ZW50IHx8ICovZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHQgPSB0aGlzLmdldFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGlmICh0KSB7XG4gICAgICAgIHJldHVybiB0LmRpc3BhdGNoRXZlbnQoaW5FdmVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3luY0Rpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRpc3BhdGNoRXZlbnQuYmluZCh0aGlzLCBpbkV2ZW50KSk7XG4gICAgfVxuICB9O1xuICBkaXNwYXRjaGVyLmJvdW5kSGFuZGxlciA9IGRpc3BhdGNoZXIuZXZlbnRIYW5kbGVyLmJpbmQoZGlzcGF0Y2hlcik7XG5cbiAgdmFyIHRhcmdldGluZyA9IHtcbiAgICBzaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIGlmIChpbkVsKSB7XG4gICAgICAgIHJldHVybiBpbkVsLnNoYWRvd1Jvb3QgfHwgaW5FbC53ZWJraXRTaGFkb3dSb290O1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuVGFyZ2V0OiBmdW5jdGlvbihzaGFkb3cpIHtcbiAgICAgIHJldHVybiBzaGFkb3cgJiYgQm9vbGVhbihzaGFkb3cuZWxlbWVudEZyb21Qb2ludCk7XG4gICAgfSxcbiAgICB0YXJnZXRpbmdTaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIHZhciBzID0gdGhpcy5zaGFkb3coaW5FbCk7XG4gICAgICBpZiAodGhpcy5jYW5UYXJnZXQocykpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbGRlclNoYWRvdzogZnVuY3Rpb24oc2hhZG93KSB7XG4gICAgICB2YXIgb3MgPSBzaGFkb3cub2xkZXJTaGFkb3dSb290O1xuICAgICAgaWYgKCFvcykge1xuICAgICAgICB2YXIgc2UgPSBzaGFkb3cucXVlcnlTZWxlY3Rvcignc2hhZG93Jyk7XG4gICAgICAgIGlmIChzZSkge1xuICAgICAgICAgIG9zID0gc2Uub2xkZXJTaGFkb3dSb290O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3M7XG4gICAgfSxcbiAgICBhbGxTaGFkb3dzOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgc2hhZG93cyA9IFtdO1xuICAgICAgdmFyIHMgPSB0aGlzLnNoYWRvdyhlbGVtZW50KTtcbiAgICAgIHdoaWxlIChzKSB7XG4gICAgICAgIHNoYWRvd3MucHVzaChzKTtcbiAgICAgICAgcyA9IHRoaXMub2xkZXJTaGFkb3cocyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2hhZG93cztcbiAgICB9LFxuICAgIHNlYXJjaFJvb3Q6IGZ1bmN0aW9uKGluUm9vdCwgeCwgeSkge1xuICAgICAgaWYgKGluUm9vdCkge1xuICAgICAgICB2YXIgdCA9IGluUm9vdC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICB2YXIgc3QsIHNyO1xuXG4gICAgICAgIC8vIGlzIGVsZW1lbnQgYSBzaGFkb3cgaG9zdD9cbiAgICAgICAgc3IgPSB0aGlzLnRhcmdldGluZ1NoYWRvdyh0KTtcbiAgICAgICAgd2hpbGUgKHNyKSB7XG5cbiAgICAgICAgICAvLyBmaW5kIHRoZSB0aGUgZWxlbWVudCBpbnNpZGUgdGhlIHNoYWRvdyByb290XG4gICAgICAgICAgc3QgPSBzci5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICAgIGlmICghc3QpIHtcblxuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIG9sZGVyIHNoYWRvd3NcbiAgICAgICAgICAgIHNyID0gdGhpcy5vbGRlclNoYWRvdyhzcik7XG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gc2hhZG93ZWQgZWxlbWVudCBtYXkgY29udGFpbiBhIHNoYWRvdyByb290XG4gICAgICAgICAgICB2YXIgc3NyID0gdGhpcy50YXJnZXRpbmdTaGFkb3coc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoUm9vdChzc3IsIHgsIHkpIHx8IHN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxpZ2h0IGRvbSBlbGVtZW50IGlzIHRoZSB0YXJnZXRcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBvd25lcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIHMgPSBlbGVtZW50O1xuXG4gICAgICAvLyB3YWxrIHVwIHVudGlsIHlvdSBoaXQgdGhlIHNoYWRvdyByb290IG9yIGRvY3VtZW50XG4gICAgICB3aGlsZSAocy5wYXJlbnROb2RlKSB7XG4gICAgICAgIHMgPSBzLnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRoZSBvd25lciBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGJlIGEgRG9jdW1lbnQgb3IgU2hhZG93Um9vdFxuICAgICAgaWYgKHMubm9kZVR5cGUgIT09IE5vZGUuRE9DVU1FTlRfTk9ERSAmJiBzLm5vZGVUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbiAgICAgICAgcyA9IGRvY3VtZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHM7XG4gICAgfSxcbiAgICBmaW5kVGFyZ2V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgeCA9IGluRXZlbnQuY2xpZW50WDtcbiAgICAgIHZhciB5ID0gaW5FdmVudC5jbGllbnRZO1xuXG4gICAgICAvLyBpZiB0aGUgbGlzdGVuZXIgaXMgaW4gdGhlIHNoYWRvdyByb290LCBpdCBpcyBtdWNoIGZhc3RlciB0byBzdGFydCB0aGVyZVxuICAgICAgdmFyIHMgPSB0aGlzLm93bmVyKGluRXZlbnQudGFyZ2V0KTtcblxuICAgICAgLy8gaWYgeCwgeSBpcyBub3QgaW4gdGhpcyByb290LCBmYWxsIGJhY2sgdG8gZG9jdW1lbnQgc2VhcmNoXG4gICAgICBpZiAoIXMuZWxlbWVudEZyb21Qb2ludCh4LCB5KSkge1xuICAgICAgICBzID0gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZWFyY2hSb290KHMsIHgsIHkpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCk7XG4gIHZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUubWFwKTtcbiAgdmFyIHRvQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG4gIHZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuZmlsdGVyKTtcbiAgdmFyIE1PID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBTRUxFQ1RPUiA9ICdbdG91Y2gtYWN0aW9uXSc7XG4gIHZhciBPQlNFUlZFUl9JTklUID0ge1xuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgYXR0cmlidXRlRmlsdGVyOiBbJ3RvdWNoLWFjdGlvbiddXG4gIH07XG5cbiAgZnVuY3Rpb24gSW5zdGFsbGVyKGFkZCwgcmVtb3ZlLCBjaGFuZ2VkLCBiaW5kZXIpIHtcbiAgICB0aGlzLmFkZENhbGxiYWNrID0gYWRkLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLnJlbW92ZUNhbGxiYWNrID0gcmVtb3ZlLmJpbmQoYmluZGVyKTtcbiAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayA9IGNoYW5nZWQuYmluZChiaW5kZXIpO1xuICAgIGlmIChNTykge1xuICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNTyh0aGlzLm11dGF0aW9uV2F0Y2hlci5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBJbnN0YWxsZXIucHJvdG90eXBlID0ge1xuICAgIHdhdGNoU3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG5cbiAgICAgIC8vIE9ubHkgd2F0Y2ggc2NvcGVzIHRoYXQgY2FuIHRhcmdldCBmaW5kLCBhcyB0aGVzZSBhcmUgdG9wLWxldmVsLlxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbiBzZWUgZHVwbGljYXRlIGFkZGl0aW9ucyBhbmQgcmVtb3ZhbHMgdGhhdCBhZGQgbm9pc2UuXG4gICAgICAvL1xuICAgICAgLy8gVE9ETyhkZnJlZWRtYW4pOiBGb3Igc29tZSBpbnN0YW5jZXMgd2l0aCBTaGFkb3dET01Qb2x5ZmlsbCwgd2UgY2FuIHNlZVxuICAgICAgLy8gYSByZW1vdmFsIHdpdGhvdXQgYW4gaW5zZXJ0aW9uIHdoZW4gYSBub2RlIGlzIHJlZGlzdHJpYnV0ZWQgYW1vbmdcbiAgICAgIC8vIHNoYWRvd3MuIFNpbmNlIGl0IGFsbCBlbmRzIHVwIGNvcnJlY3QgaW4gdGhlIGRvY3VtZW50LCB3YXRjaGluZyBvbmx5XG4gICAgICAvLyB0aGUgZG9jdW1lbnQgd2lsbCB5aWVsZCB0aGUgY29ycmVjdCBtdXRhdGlvbnMgdG8gd2F0Y2guXG4gICAgICBpZiAodGhpcy5vYnNlcnZlciAmJiB0YXJnZXRpbmcuY2FuVGFyZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgT0JTRVJWRVJfSU5JVCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmFibGVPblN1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdGhpcy53YXRjaFN1YnRyZWUodGFyZ2V0KTtcbiAgICAgIGlmICh0YXJnZXQgPT09IGRvY3VtZW50ICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsT25Mb2FkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmluc3RhbGxOZXdTdWJ0cmVlKHRhcmdldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbnN0YWxsTmV3U3VidHJlZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBmb3JFYWNoKHRoaXMuZmluZEVsZW1lbnRzKHRhcmdldCksIHRoaXMuYWRkRWxlbWVudCwgdGhpcyk7XG4gICAgfSxcbiAgICBmaW5kRWxlbWVudHM6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUik7XG4gICAgICB9XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcbiAgICByZW1vdmVFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5yZW1vdmVDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBhZGRFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgdGhpcy5hZGRDYWxsYmFjayhlbCk7XG4gICAgfSxcbiAgICBlbGVtZW50Q2hhbmdlZDogZnVuY3Rpb24oZWwsIG9sZFZhbHVlKSB7XG4gICAgICB0aGlzLmNoYW5nZWRDYWxsYmFjayhlbCwgb2xkVmFsdWUpO1xuICAgIH0sXG4gICAgY29uY2F0TGlzdHM6IGZ1bmN0aW9uKGFjY3VtLCBsaXN0KSB7XG4gICAgICByZXR1cm4gYWNjdW0uY29uY2F0KHRvQXJyYXkobGlzdCkpO1xuICAgIH0sXG5cbiAgICAvLyByZWdpc3RlciBhbGwgdG91Y2gtYWN0aW9uID0gbm9uZSBub2RlcyBvbiBkb2N1bWVudCBsb2FkXG4gICAgaW5zdGFsbE9uTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgdGhpcy5pbnN0YWxsTmV3U3VidHJlZShkb2N1bWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBpc0VsZW1lbnQ6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIHJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbiAgICB9LFxuICAgIGZsYXR0ZW5NdXRhdGlvblRyZWU6IGZ1bmN0aW9uKGluTm9kZXMpIHtcblxuICAgICAgLy8gZmluZCBjaGlsZHJlbiB3aXRoIHRvdWNoLWFjdGlvblxuICAgICAgdmFyIHRyZWUgPSBtYXAoaW5Ob2RlcywgdGhpcy5maW5kRWxlbWVudHMsIHRoaXMpO1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhlIGFkZGVkIG5vZGVzIGFyZSBhY2NvdW50ZWQgZm9yXG4gICAgICB0cmVlLnB1c2goZmlsdGVyKGluTm9kZXMsIHRoaXMuaXNFbGVtZW50KSk7XG5cbiAgICAgIC8vIGZsYXR0ZW4gdGhlIGxpc3RcbiAgICAgIHJldHVybiB0cmVlLnJlZHVjZSh0aGlzLmNvbmNhdExpc3RzLCBbXSk7XG4gICAgfSxcbiAgICBtdXRhdGlvbldhdGNoZXI6IGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2godGhpcy5tdXRhdGlvbkhhbmRsZXIsIHRoaXMpO1xuICAgIH0sXG4gICAgbXV0YXRpb25IYW5kbGVyOiBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAobS50eXBlID09PSAnY2hpbGRMaXN0Jykge1xuICAgICAgICB2YXIgYWRkZWQgPSB0aGlzLmZsYXR0ZW5NdXRhdGlvblRyZWUobS5hZGRlZE5vZGVzKTtcbiAgICAgICAgYWRkZWQuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnQsIHRoaXMpO1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IHRoaXMuZmxhdHRlbk11dGF0aW9uVHJlZShtLnJlbW92ZWROb2Rlcyk7XG4gICAgICAgIHJlbW92ZWQuZm9yRWFjaCh0aGlzLnJlbW92ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgfSBlbHNlIGlmIChtLnR5cGUgPT09ICdhdHRyaWJ1dGVzJykge1xuICAgICAgICB0aGlzLmVsZW1lbnRDaGFuZ2VkKG0udGFyZ2V0LCBtLm9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc2hhZG93U2VsZWN0b3Iodikge1xuICAgIHJldHVybiAnYm9keSAvc2hhZG93LWRlZXAvICcgKyBzZWxlY3Rvcih2KTtcbiAgfVxuICBmdW5jdGlvbiBzZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdbdG91Y2gtYWN0aW9uPVwiJyArIHYgKyAnXCJdJztcbiAgfVxuICBmdW5jdGlvbiBydWxlKHYpIHtcbiAgICByZXR1cm4gJ3sgLW1zLXRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb246ICcgKyB2ICsgJzsgfSc7XG4gIH1cbiAgdmFyIGF0dHJpYjJjc3MgPSBbXG4gICAgJ25vbmUnLFxuICAgICdhdXRvJyxcbiAgICAncGFuLXgnLFxuICAgICdwYW4teScsXG4gICAge1xuICAgICAgcnVsZTogJ3Bhbi14IHBhbi15JyxcbiAgICAgIHNlbGVjdG9yczogW1xuICAgICAgICAncGFuLXggcGFuLXknLFxuICAgICAgICAncGFuLXkgcGFuLXgnXG4gICAgICBdXG4gICAgfVxuICBdO1xuICB2YXIgc3R5bGVzID0gJyc7XG5cbiAgLy8gb25seSBpbnN0YWxsIHN0eWxlc2hlZXQgaWYgdGhlIGJyb3dzZXIgaGFzIHRvdWNoIGFjdGlvbiBzdXBwb3J0XG4gIHZhciBoYXNOYXRpdmVQRSA9IHdpbmRvdy5Qb2ludGVyRXZlbnQgfHwgd2luZG93Lk1TUG9pbnRlckV2ZW50O1xuXG4gIC8vIG9ubHkgYWRkIHNoYWRvdyBzZWxlY3RvcnMgaWYgc2hhZG93ZG9tIGlzIHN1cHBvcnRlZFxuICB2YXIgaGFzU2hhZG93Um9vdCA9ICF3aW5kb3cuU2hhZG93RE9NUG9seWZpbGwgJiYgZG9jdW1lbnQuaGVhZC5jcmVhdGVTaGFkb3dSb290O1xuXG4gIGZ1bmN0aW9uIGFwcGx5QXR0cmlidXRlU3R5bGVzKCkge1xuICAgIGlmIChoYXNOYXRpdmVQRSkge1xuICAgICAgYXR0cmliMmNzcy5mb3JFYWNoKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgaWYgKFN0cmluZyhyKSA9PT0gcikge1xuICAgICAgICAgIHN0eWxlcyArPSBzZWxlY3RvcihyKSArIHJ1bGUocikgKyAnXFxuJztcbiAgICAgICAgICBpZiAoaGFzU2hhZG93Um9vdCkge1xuICAgICAgICAgICAgc3R5bGVzICs9IHNoYWRvd1NlbGVjdG9yKHIpICsgcnVsZShyKSArICdcXG4nO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZXMgKz0gci5zZWxlY3RvcnMubWFwKHNlbGVjdG9yKSArIHJ1bGUoci5ydWxlKSArICdcXG4nO1xuICAgICAgICAgIGlmIChoYXNTaGFkb3dSb290KSB7XG4gICAgICAgICAgICBzdHlsZXMgKz0gci5zZWxlY3RvcnMubWFwKHNoYWRvd1NlbGVjdG9yKSArIHJ1bGUoci5ydWxlKSArICdcXG4nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwb2ludGVybWFwID0gZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuXG4gIC8vIHJhZGl1cyBhcm91bmQgdG91Y2hlbmQgdGhhdCBzd2FsbG93cyBtb3VzZSBldmVudHNcbiAgdmFyIERFRFVQX0RJU1QgPSAyNTtcblxuICAvLyBsZWZ0LCBtaWRkbGUsIHJpZ2h0LCBiYWNrLCBmb3J3YXJkXG4gIHZhciBCVVRUT05fVE9fQlVUVE9OUyA9IFsxLCA0LCAyLCA4LCAxNl07XG5cbiAgdmFyIEhBU19CVVRUT05TID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgSEFTX0JVVFRPTlMgPSBuZXcgTW91c2VFdmVudCgndGVzdCcsIHsgYnV0dG9uczogMSB9KS5idXR0b25zID09PSAxO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIC8vIGhhbmRsZXIgYmxvY2sgZm9yIG5hdGl2ZSBtb3VzZSBldmVudHNcbiAgdmFyIG1vdXNlRXZlbnRzID0ge1xuICAgIFBPSU5URVJfSUQ6IDEsXG4gICAgUE9JTlRFUl9UWVBFOiAnbW91c2UnLFxuICAgIGV2ZW50czogW1xuICAgICAgJ21vdXNlZG93bicsXG4gICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICdtb3VzZXVwJyxcbiAgICAgICdtb3VzZW92ZXInLFxuICAgICAgJ21vdXNlb3V0J1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGRpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBsYXN0VG91Y2hlczogW10sXG5cbiAgICAvLyBjb2xsaWRlIHdpdGggdGhlIGdsb2JhbCBtb3VzZSBsaXN0ZW5lclxuICAgIGlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2g6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSB0aGlzLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFg7XG4gICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbHRzLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBsdHNbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBzaW11bGF0ZWQgbW91c2UgZXZlbnRzIHdpbGwgYmUgc3dhbGxvd2VkIG5lYXIgYSBwcmltYXJ5IHRvdWNoZW5kXG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHggLSB0LngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1QgJiYgZHkgPD0gREVEVVBfRElTVCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuXG4gICAgICAvLyBmb3J3YXJkIG1vdXNlIHByZXZlbnREZWZhdWx0XG4gICAgICB2YXIgcGQgPSBlLnByZXZlbnREZWZhdWx0O1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHBkKCk7XG4gICAgICB9O1xuICAgICAgZS5wb2ludGVySWQgPSB0aGlzLlBPSU5URVJfSUQ7XG4gICAgICBlLmlzUHJpbWFyeSA9IHRydWU7XG4gICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEU7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByZXBhcmVCdXR0b25zRm9yTW92ZTogZnVuY3Rpb24oZSwgaW5FdmVudCkge1xuICAgICAgdmFyIHAgPSBwb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuXG4gICAgICAvLyBVcGRhdGUgYnV0dG9ucyBzdGF0ZSBhZnRlciBwb3NzaWJsZSBvdXQtb2YtZG9jdW1lbnQgbW91c2V1cC5cbiAgICAgIGlmIChpbkV2ZW50LndoaWNoID09PSAwIHx8ICFwKSB7XG4gICAgICAgIGUuYnV0dG9ucyA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlLmJ1dHRvbnMgPSBwLmJ1dHRvbnM7XG4gICAgICB9XG4gICAgICBpbkV2ZW50LmJ1dHRvbnMgPSBlLmJ1dHRvbnM7XG4gICAgfSxcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBwID0gcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgIGUuYnV0dG9ucyA9IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcbiAgICAgICAgICBpZiAocCkgeyBlLmJ1dHRvbnMgfD0gcC5idXR0b25zOyB9XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50ZXJtYXAuc2V0KHRoaXMuUE9JTlRFUl9JRCwgaW5FdmVudCk7XG4gICAgICAgIGlmICghcCB8fCBwLmJ1dHRvbnMgPT09IDApIHtcbiAgICAgICAgICBkaXNwYXRjaGVyLmRvd24oZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHsgdGhpcy5wcmVwYXJlQnV0dG9uc0Zvck1vdmUoZSwgaW5FdmVudCk7IH1cbiAgICAgICAgZS5idXR0b24gPSAtMTtcbiAgICAgICAgcG9pbnRlcm1hcC5zZXQodGhpcy5QT0lOVEVSX0lELCBpbkV2ZW50KTtcbiAgICAgICAgZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2V1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIHAgPSBwb2ludGVybWFwLmdldCh0aGlzLlBPSU5URVJfSUQpO1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBpZiAoIUhBU19CVVRUT05TKSB7XG4gICAgICAgICAgdmFyIHVwID0gQlVUVE9OX1RPX0JVVFRPTlNbZS5idXR0b25dO1xuXG4gICAgICAgICAgLy8gUHJvZHVjZXMgd3Jvbmcgc3RhdGUgb2YgYnV0dG9ucyBpbiBCcm93c2VycyB3aXRob3V0IGBidXR0b25zYCBzdXBwb3J0XG4gICAgICAgICAgLy8gd2hlbiBhIG1vdXNlIGJ1dHRvbiB0aGF0IHdhcyBwcmVzc2VkIG91dHNpZGUgdGhlIGRvY3VtZW50IGlzIHJlbGVhc2VkXG4gICAgICAgICAgLy8gaW5zaWRlIGFuZCBvdGhlciBidXR0b25zIGFyZSBzdGlsbCBwcmVzc2VkIGRvd24uXG4gICAgICAgICAgZS5idXR0b25zID0gcCA/IHAuYnV0dG9ucyAmIH51cCA6IDA7XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50ZXJtYXAuc2V0KHRoaXMuUE9JTlRFUl9JRCwgaW5FdmVudCk7XG5cbiAgICAgICAgLy8gU3VwcG9ydDogRmlyZWZveCA8PTQ0IG9ubHlcbiAgICAgICAgLy8gRkYgVWJ1bnR1IGluY2x1ZGVzIHRoZSBsaWZ0ZWQgYnV0dG9uIGluIHRoZSBgYnV0dG9uc2AgcHJvcGVydHkgb25cbiAgICAgICAgLy8gbW91c2V1cC5cbiAgICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTIyMzM2NlxuICAgICAgICBlLmJ1dHRvbnMgJj0gfkJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcbiAgICAgICAgaWYgKGUuYnV0dG9ucyA9PT0gMCkge1xuICAgICAgICAgIGRpc3BhdGNoZXIudXAoZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGlmICghSEFTX0JVVFRPTlMpIHsgdGhpcy5wcmVwYXJlQnV0dG9uc0Zvck1vdmUoZSwgaW5FdmVudCk7IH1cbiAgICAgICAgZS5idXR0b24gPSAtMTtcbiAgICAgICAgcG9pbnRlcm1hcC5zZXQodGhpcy5QT0lOVEVSX0lELCBpbkV2ZW50KTtcbiAgICAgICAgZGlzcGF0Y2hlci5lbnRlck92ZXIoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBlLmJ1dHRvbiA9IC0xO1xuICAgICAgICBkaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmRlYWN0aXZhdGVNb3VzZSgpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZU1vdXNlOiBmdW5jdGlvbigpIHtcbiAgICAgIHBvaW50ZXJtYXAuZGVsZXRlKHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjYXB0dXJlSW5mbyA9IGRpc3BhdGNoZXIuY2FwdHVyZUluZm87XG4gIHZhciBmaW5kVGFyZ2V0ID0gdGFyZ2V0aW5nLmZpbmRUYXJnZXQuYmluZCh0YXJnZXRpbmcpO1xuICB2YXIgYWxsU2hhZG93cyA9IHRhcmdldGluZy5hbGxTaGFkb3dzLmJpbmQodGFyZ2V0aW5nKTtcbiAgdmFyIHBvaW50ZXJtYXAkMSA9IGRpc3BhdGNoZXIucG9pbnRlcm1hcDtcblxuICAvLyBUaGlzIHNob3VsZCBiZSBsb25nIGVub3VnaCB0byBpZ25vcmUgY29tcGF0IG1vdXNlIGV2ZW50cyBtYWRlIGJ5IHRvdWNoXG4gIHZhciBERURVUF9USU1FT1VUID0gMjUwMDtcbiAgdmFyIENMSUNLX0NPVU5UX1RJTUVPVVQgPSAyMDA7XG4gIHZhciBBVFRSSUIgPSAndG91Y2gtYWN0aW9uJztcbiAgdmFyIElOU1RBTExFUjtcblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgdG91Y2ggZXZlbnRzXG4gIHZhciB0b3VjaEV2ZW50cyA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgJ3RvdWNoZW5kJyxcbiAgICAgICd0b3VjaGNhbmNlbCdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIElOU1RBTExFUi5lbmFibGVPblN1YnRyZWUodGFyZ2V0KTtcbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAvLyBUT0RPKGRmcmVlZG1hbik6IGlzIGl0IHdvcnRoIGl0IHRvIGRpc2Nvbm5lY3QgdGhlIE1PP1xuICAgIH0sXG4gICAgZWxlbWVudEFkZGVkOiBmdW5jdGlvbihlbCkge1xuICAgICAgdmFyIGEgPSBlbC5nZXRBdHRyaWJ1dGUoQVRUUklCKTtcbiAgICAgIHZhciBzdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUoYSk7XG4gICAgICBpZiAoc3QpIHtcbiAgICAgICAgZWwuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oZWwsIHRoaXMuZXZlbnRzKTtcblxuICAgICAgICAvLyBzZXQgdG91Y2gtYWN0aW9uIG9uIHNoYWRvd3MgYXMgd2VsbFxuICAgICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICBzLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4ocywgdGhpcy5ldmVudHMpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVsZW1lbnRSZW1vdmVkOiBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuX3Njcm9sbFR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKGVsLCB0aGlzLmV2ZW50cyk7XG5cbiAgICAgIC8vIHJlbW92ZSB0b3VjaC1hY3Rpb24gZnJvbSBzaGFkb3dcbiAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICBzLl9zY3JvbGxUeXBlID0gdW5kZWZpbmVkO1xuICAgICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKHMsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgZWxlbWVudENoYW5nZWQ6IGZ1bmN0aW9uKGVsLCBvbGRWYWx1ZSkge1xuICAgICAgdmFyIGEgPSBlbC5nZXRBdHRyaWJ1dGUoQVRUUklCKTtcbiAgICAgIHZhciBzdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUoYSk7XG4gICAgICB2YXIgb2xkU3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKG9sZFZhbHVlKTtcblxuICAgICAgLy8gc2ltcGx5IHVwZGF0ZSBzY3JvbGxUeXBlIGlmIGxpc3RlbmVycyBhcmUgYWxyZWFkeSBlc3RhYmxpc2hlZFxuICAgICAgaWYgKHN0ICYmIG9sZFN0KSB7XG4gICAgICAgIGVsLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgIHMuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKG9sZFN0KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlbW92ZWQoZWwpO1xuICAgICAgfSBlbHNlIGlmIChzdCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRBZGRlZChlbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzY3JvbGxUeXBlczoge1xuICAgICAgRU1JVFRFUjogJ25vbmUnLFxuICAgICAgWFNDUk9MTEVSOiAncGFuLXgnLFxuICAgICAgWVNDUk9MTEVSOiAncGFuLXknLFxuICAgICAgU0NST0xMRVI6IC9eKD86cGFuLXggcGFuLXkpfCg/OnBhbi15IHBhbi14KXxhdXRvJC9cbiAgICB9LFxuICAgIHRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlOiBmdW5jdGlvbih0b3VjaEFjdGlvbikge1xuICAgICAgdmFyIHQgPSB0b3VjaEFjdGlvbjtcbiAgICAgIHZhciBzdCA9IHRoaXMuc2Nyb2xsVHlwZXM7XG4gICAgICBpZiAodCA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgICB9IGVsc2UgaWYgKHQgPT09IHN0LlhTQ1JPTExFUikge1xuICAgICAgICByZXR1cm4gJ1gnO1xuICAgICAgfSBlbHNlIGlmICh0ID09PSBzdC5ZU0NST0xMRVIpIHtcbiAgICAgICAgcmV0dXJuICdZJztcbiAgICAgIH0gZWxzZSBpZiAoc3QuU0NST0xMRVIuZXhlYyh0KSkge1xuICAgICAgICByZXR1cm4gJ1hZJztcbiAgICAgIH1cbiAgICB9LFxuICAgIFBPSU5URVJfVFlQRTogJ3RvdWNoJyxcbiAgICBmaXJzdFRvdWNoOiBudWxsLFxuICAgIGlzUHJpbWFyeVRvdWNoOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdFRvdWNoID09PSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgfSxcbiAgICBzZXRQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcblxuICAgICAgLy8gc2V0IHByaW1hcnkgdG91Y2ggaWYgdGhlcmUgbm8gcG9pbnRlcnMsIG9yIHRoZSBvbmx5IHBvaW50ZXIgaXMgdGhlIG1vdXNlXG4gICAgICBpZiAocG9pbnRlcm1hcCQxLnNpemUgPT09IDAgfHwgKHBvaW50ZXJtYXAkMS5zaXplID09PSAxICYmIHBvaW50ZXJtYXAkMS5oYXMoMSkpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RUb3VjaCA9IGluVG91Y2guaWRlbnRpZmllcjtcbiAgICAgICAgdGhpcy5maXJzdFhZID0geyBYOiBpblRvdWNoLmNsaWVudFgsIFk6IGluVG91Y2guY2xpZW50WSB9O1xuICAgICAgICB0aGlzLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbFJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlUHJpbWFyeVBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgaWYgKGluUG9pbnRlci5pc1ByaW1hcnkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNldENsaWNrQ291bnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWNrQ291bnQ6IDAsXG4gICAgcmVzZXRJZDogbnVsbCxcbiAgICByZXNldENsaWNrQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucmVzZXRJZCA9IG51bGw7XG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLnJlc2V0SWQgPSBzZXRUaW1lb3V0KGZuLCBDTElDS19DT1VOVF9USU1FT1VUKTtcbiAgICB9LFxuICAgIGNhbmNlbFJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZXNldElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0SWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHlwZVRvQnV0dG9uczogZnVuY3Rpb24odHlwZSkge1xuICAgICAgdmFyIHJldCA9IDA7XG4gICAgICBpZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHJldCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgdG91Y2hUb1BvaW50ZXI6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIHZhciBjdGUgPSB0aGlzLmN1cnJlbnRUb3VjaEV2ZW50O1xuICAgICAgdmFyIGUgPSBkaXNwYXRjaGVyLmNsb25lRXZlbnQoaW5Ub3VjaCk7XG5cbiAgICAgIC8vIFdlIHJlc2VydmUgcG9pbnRlcklkIDEgZm9yIE1vdXNlLlxuICAgICAgLy8gVG91Y2ggaWRlbnRpZmllcnMgY2FuIHN0YXJ0IGF0IDAuXG4gICAgICAvLyBBZGQgMiB0byB0aGUgdG91Y2ggaWRlbnRpZmllciBmb3IgY29tcGF0aWJpbGl0eS5cbiAgICAgIHZhciBpZCA9IGUucG9pbnRlcklkID0gaW5Ub3VjaC5pZGVudGlmaWVyICsgMjtcbiAgICAgIGUudGFyZ2V0ID0gY2FwdHVyZUluZm9baWRdIHx8IGZpbmRUYXJnZXQoZSk7XG4gICAgICBlLmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgZS5jYW5jZWxhYmxlID0gdHJ1ZTtcbiAgICAgIGUuZGV0YWlsID0gdGhpcy5jbGlja0NvdW50O1xuICAgICAgZS5idXR0b24gPSAwO1xuICAgICAgZS5idXR0b25zID0gdGhpcy50eXBlVG9CdXR0b25zKGN0ZS50eXBlKTtcbiAgICAgIGUud2lkdGggPSAoaW5Ub3VjaC5yYWRpdXNYIHx8IGluVG91Y2gud2Via2l0UmFkaXVzWCB8fCAwKSAqIDI7XG4gICAgICBlLmhlaWdodCA9IChpblRvdWNoLnJhZGl1c1kgfHwgaW5Ub3VjaC53ZWJraXRSYWRpdXNZIHx8IDApICogMjtcbiAgICAgIGUucHJlc3N1cmUgPSBpblRvdWNoLmZvcmNlIHx8IGluVG91Y2gud2Via2l0Rm9yY2UgfHwgMC41O1xuICAgICAgZS5pc1ByaW1hcnkgPSB0aGlzLmlzUHJpbWFyeVRvdWNoKGluVG91Y2gpO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuXG4gICAgICAvLyBmb3J3YXJkIG1vZGlmaWVyIGtleXNcbiAgICAgIGUuYWx0S2V5ID0gY3RlLmFsdEtleTtcbiAgICAgIGUuY3RybEtleSA9IGN0ZS5jdHJsS2V5O1xuICAgICAgZS5tZXRhS2V5ID0gY3RlLm1ldGFLZXk7XG4gICAgICBlLnNoaWZ0S2V5ID0gY3RlLnNoaWZ0S2V5O1xuXG4gICAgICAvLyBmb3J3YXJkIHRvdWNoIHByZXZlbnREZWZhdWx0c1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICBjdGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByb2Nlc3NUb3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50LCBpbkZ1bmN0aW9uKSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgdGhpcy5jdXJyZW50VG91Y2hFdmVudCA9IGluRXZlbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMCwgdDsgaSA8IHRsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHQgPSB0bFtpXTtcbiAgICAgICAgaW5GdW5jdGlvbi5jYWxsKHRoaXMsIHRoaXMudG91Y2hUb1BvaW50ZXIodCkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBGb3Igc2luZ2xlIGF4aXMgc2Nyb2xsZXJzLCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVsZW1lbnQgc2hvdWxkIGVtaXRcbiAgICAvLyBwb2ludGVyIGV2ZW50cyBvciBiZWhhdmUgYXMgYSBzY3JvbGxlclxuICAgIHNob3VsZFNjcm9sbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKHRoaXMuZmlyc3RYWSkge1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICB2YXIgc2Nyb2xsQXhpcyA9IGluRXZlbnQuY3VycmVudFRhcmdldC5fc2Nyb2xsVHlwZTtcbiAgICAgICAgaWYgKHNjcm9sbEF4aXMgPT09ICdub25lJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IGlzIGEgdG91Y2gtYWN0aW9uOiBub25lLCBzaG91bGQgbmV2ZXIgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsQXhpcyA9PT0gJ1hZJykge1xuXG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IHNob3VsZCBhbHdheXMgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICAgICAgICAvLyBjaGVjayB0aGUgaW50ZW5kZWQgc2Nyb2xsIGF4aXMsIGFuZCBvdGhlciBheGlzXG4gICAgICAgICAgdmFyIGEgPSBzY3JvbGxBeGlzO1xuICAgICAgICAgIHZhciBvYSA9IHNjcm9sbEF4aXMgPT09ICdZJyA/ICdYJyA6ICdZJztcbiAgICAgICAgICB2YXIgZGEgPSBNYXRoLmFicyh0WydjbGllbnQnICsgYV0gLSB0aGlzLmZpcnN0WFlbYV0pO1xuICAgICAgICAgIHZhciBkb2EgPSBNYXRoLmFicyh0WydjbGllbnQnICsgb2FdIC0gdGhpcy5maXJzdFhZW29hXSk7XG5cbiAgICAgICAgICAvLyBpZiBkZWx0YSBpbiB0aGUgc2Nyb2xsIGF4aXMgPiBkZWx0YSBvdGhlciBheGlzLCBzY3JvbGwgaW5zdGVhZCBvZlxuICAgICAgICAgIC8vIG1ha2luZyBldmVudHNcbiAgICAgICAgICByZXQgPSBkYSA+PSBkb2E7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZpbmRUb3VjaDogZnVuY3Rpb24oaW5UTCwgaW5JZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpblRMLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBpblRMW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0LmlkZW50aWZpZXIgPT09IGluSWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBJbiBzb21lIGluc3RhbmNlcywgYSB0b3VjaHN0YXJ0IGNhbiBoYXBwZW4gd2l0aG91dCBhIHRvdWNoZW5kLiBUaGlzXG4gICAgLy8gbGVhdmVzIHRoZSBwb2ludGVybWFwIGluIGEgYnJva2VuIHN0YXRlLlxuICAgIC8vIFRoZXJlZm9yZSwgb24gZXZlcnkgdG91Y2hzdGFydCwgd2UgcmVtb3ZlIHRoZSB0b3VjaGVzIHRoYXQgZGlkIG5vdCBmaXJlIGFcbiAgICAvLyB0b3VjaGVuZCBldmVudC5cbiAgICAvLyBUbyBrZWVwIHN0YXRlIGdsb2JhbGx5IGNvbnNpc3RlbnQsIHdlIGZpcmUgYVxuICAgIC8vIHBvaW50ZXJjYW5jZWwgZm9yIHRoaXMgXCJhYmFuZG9uZWRcIiB0b3VjaFxuICAgIHZhY3V1bVRvdWNoZXM6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB0bCA9IGluRXZlbnQudG91Y2hlcztcblxuICAgICAgLy8gcG9pbnRlcm1hcC5zaXplIHNob3VsZCBiZSA8IHRsLmxlbmd0aCBoZXJlLCBhcyB0aGUgdG91Y2hzdGFydCBoYXMgbm90XG4gICAgICAvLyBiZWVuIHByb2Nlc3NlZCB5ZXQuXG4gICAgICBpZiAocG9pbnRlcm1hcCQxLnNpemUgPj0gdGwubGVuZ3RoKSB7XG4gICAgICAgIHZhciBkID0gW107XG4gICAgICAgIHBvaW50ZXJtYXAkMS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcblxuICAgICAgICAgIC8vIE5ldmVyIHJlbW92ZSBwb2ludGVySWQgPT0gMSwgd2hpY2ggaXMgbW91c2UuXG4gICAgICAgICAgLy8gVG91Y2ggaWRlbnRpZmllcnMgYXJlIDIgc21hbGxlciB0aGFuIHRoZWlyIHBvaW50ZXJJZCwgd2hpY2ggaXMgdGhlXG4gICAgICAgICAgLy8gaW5kZXggaW4gcG9pbnRlcm1hcC5cbiAgICAgICAgICBpZiAoa2V5ICE9PSAxICYmICF0aGlzLmZpbmRUb3VjaCh0bCwga2V5IC0gMikpIHtcbiAgICAgICAgICAgIHZhciBwID0gdmFsdWUub3V0O1xuICAgICAgICAgICAgZC5wdXNoKHApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIGQuZm9yRWFjaCh0aGlzLmNhbmNlbE91dCwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3VjaHN0YXJ0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLnZhY3V1bVRvdWNoZXMoaW5FdmVudCk7XG4gICAgICB0aGlzLnNldFByaW1hcnlUb3VjaChpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKTtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICB0aGlzLmNsaWNrQ291bnQrKztcbiAgICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLm92ZXJEb3duKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG92ZXJEb3duOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHBvaW50ZXJtYXAkMS5zZXQoaW5Qb2ludGVyLnBvaW50ZXJJZCwge1xuICAgICAgICB0YXJnZXQ6IGluUG9pbnRlci50YXJnZXQsXG4gICAgICAgIG91dDogaW5Qb2ludGVyLFxuICAgICAgICBvdXRUYXJnZXQ6IGluUG9pbnRlci50YXJnZXRcbiAgICAgIH0pO1xuICAgICAgZGlzcGF0Y2hlci5lbnRlck92ZXIoaW5Qb2ludGVyKTtcbiAgICAgIGRpc3BhdGNoZXIuZG93bihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgdG91Y2htb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNjcm9sbChpbkV2ZW50KSkge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRvdWNoY2FuY2VsKGluRXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMubW92ZU92ZXJPdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3ZlT3Zlck91dDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICB2YXIgZXZlbnQgPSBpblBvaW50ZXI7XG4gICAgICB2YXIgcG9pbnRlciA9IHBvaW50ZXJtYXAkMS5nZXQoZXZlbnQucG9pbnRlcklkKTtcblxuICAgICAgLy8gYSBmaW5nZXIgZHJpZnRlZCBvZmYgdGhlIHNjcmVlbiwgaWdub3JlIGl0XG4gICAgICBpZiAoIXBvaW50ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIG91dEV2ZW50ID0gcG9pbnRlci5vdXQ7XG4gICAgICB2YXIgb3V0VGFyZ2V0ID0gcG9pbnRlci5vdXRUYXJnZXQ7XG4gICAgICBkaXNwYXRjaGVyLm1vdmUoZXZlbnQpO1xuICAgICAgaWYgKG91dEV2ZW50ICYmIG91dFRhcmdldCAhPT0gZXZlbnQudGFyZ2V0KSB7XG4gICAgICAgIG91dEV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBvdXRUYXJnZXQ7XG5cbiAgICAgICAgLy8gcmVjb3ZlciBmcm9tIHJldGFyZ2V0aW5nIGJ5IHNoYWRvd1xuICAgICAgICBvdXRFdmVudC50YXJnZXQgPSBvdXRUYXJnZXQ7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQpIHtcbiAgICAgICAgICBkaXNwYXRjaGVyLmxlYXZlT3V0KG91dEV2ZW50KTtcbiAgICAgICAgICBkaXNwYXRjaGVyLmVudGVyT3ZlcihldmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAvLyBjbGVhbiB1cCBjYXNlIHdoZW4gZmluZ2VyIGxlYXZlcyB0aGUgc2NyZWVuXG4gICAgICAgICAgZXZlbnQudGFyZ2V0ID0gb3V0VGFyZ2V0O1xuICAgICAgICAgIGV2ZW50LnJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuY2FuY2VsT3V0KGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9pbnRlci5vdXQgPSBldmVudDtcbiAgICAgIHBvaW50ZXIub3V0VGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgIH0sXG4gICAgdG91Y2hlbmQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLnVwT3V0KTtcbiAgICB9LFxuICAgIHVwT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgZGlzcGF0Y2hlci51cChpblBvaW50ZXIpO1xuICAgICAgICBkaXNwYXRjaGVyLmxlYXZlT3V0KGluUG9pbnRlcik7XG4gICAgICB9XG4gICAgICB0aGlzLmNsZWFuVXBQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICB0b3VjaGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLmNhbmNlbE91dCk7XG4gICAgfSxcbiAgICBjYW5jZWxPdXQ6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgZGlzcGF0Y2hlci5jYW5jZWwoaW5Qb2ludGVyKTtcbiAgICAgIGRpc3BhdGNoZXIubGVhdmVPdXQoaW5Qb2ludGVyKTtcbiAgICAgIHRoaXMuY2xlYW5VcFBvaW50ZXIoaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIGNsZWFuVXBQb2ludGVyOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHBvaW50ZXJtYXAkMS5kZWxldGUoaW5Qb2ludGVyLnBvaW50ZXJJZCk7XG4gICAgICB0aGlzLnJlbW92ZVByaW1hcnlQb2ludGVyKGluUG9pbnRlcik7XG4gICAgfSxcblxuICAgIC8vIHByZXZlbnQgc3ludGggbW91c2UgZXZlbnRzIGZyb20gY3JlYXRpbmcgcG9pbnRlciBldmVudHNcbiAgICBkZWR1cFN5bnRoTW91c2U6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSBtb3VzZUV2ZW50cy5sYXN0VG91Y2hlcztcbiAgICAgIHZhciB0ID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuICAgICAgLy8gb25seSB0aGUgcHJpbWFyeSBmaW5nZXIgd2lsbCBzeW50aCBtb3VzZSBldmVudHNcbiAgICAgIGlmICh0aGlzLmlzUHJpbWFyeVRvdWNoKHQpKSB7XG5cbiAgICAgICAgLy8gcmVtZW1iZXIgeC95IG9mIGxhc3QgdG91Y2hcbiAgICAgICAgdmFyIGx0ID0geyB4OiB0LmNsaWVudFgsIHk6IHQuY2xpZW50WSB9O1xuICAgICAgICBsdHMucHVzaChsdCk7XG4gICAgICAgIHZhciBmbiA9IChmdW5jdGlvbihsdHMsIGx0KSB7XG4gICAgICAgICAgdmFyIGkgPSBsdHMuaW5kZXhPZihsdCk7XG4gICAgICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICAgICAgbHRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQobnVsbCwgbHRzLCBsdCk7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIERFRFVQX1RJTUVPVVQpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBJTlNUQUxMRVIgPSBuZXcgSW5zdGFsbGVyKHRvdWNoRXZlbnRzLmVsZW1lbnRBZGRlZCwgdG91Y2hFdmVudHMuZWxlbWVudFJlbW92ZWQsXG4gICAgdG91Y2hFdmVudHMuZWxlbWVudENoYW5nZWQsIHRvdWNoRXZlbnRzKTtcblxuICB2YXIgcG9pbnRlcm1hcCQyID0gZGlzcGF0Y2hlci5wb2ludGVybWFwO1xuICB2YXIgSEFTX0JJVE1BUF9UWVBFID0gd2luZG93Lk1TUG9pbnRlckV2ZW50ICYmXG4gICAgdHlwZW9mIHdpbmRvdy5NU1BvaW50ZXJFdmVudC5NU1BPSU5URVJfVFlQRV9NT1VTRSA9PT0gJ251bWJlcic7XG4gIHZhciBtc0V2ZW50cyA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICdNU1BvaW50ZXJEb3duJyxcbiAgICAgICdNU1BvaW50ZXJNb3ZlJyxcbiAgICAgICdNU1BvaW50ZXJVcCcsXG4gICAgICAnTVNQb2ludGVyT3V0JyxcbiAgICAgICdNU1BvaW50ZXJPdmVyJyxcbiAgICAgICdNU1BvaW50ZXJDYW5jZWwnLFxuICAgICAgJ01TR290UG9pbnRlckNhcHR1cmUnLFxuICAgICAgJ01TTG9zdFBvaW50ZXJDYXB0dXJlJ1xuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGRpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBQT0lOVEVSX1RZUEVTOiBbXG4gICAgICAnJyxcbiAgICAgICd1bmF2YWlsYWJsZScsXG4gICAgICAndG91Y2gnLFxuICAgICAgJ3BlbicsXG4gICAgICAnbW91c2UnXG4gICAgXSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gaW5FdmVudDtcbiAgICAgIGlmIChIQVNfQklUTUFQX1RZUEUpIHtcbiAgICAgICAgZSA9IGRpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFU1tpbkV2ZW50LnBvaW50ZXJUeXBlXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgY2xlYW51cDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHBvaW50ZXJtYXAkMi5kZWxldGUoaWQpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyRG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgcG9pbnRlcm1hcCQyLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgaW5FdmVudCk7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyTW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIGRpc3BhdGNoZXIubW92ZShlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlclVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZGlzcGF0Y2hlci51cChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJPdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBkaXNwYXRjaGVyLmxlYXZlT3V0KGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyT3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIGRpc3BhdGNoZXIuZW50ZXJPdmVyKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyQ2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmNsZWFudXAoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH0sXG4gICAgTVNMb3N0UG9pbnRlckNhcHR1cmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gZGlzcGF0Y2hlci5tYWtlRXZlbnQoJ2xvc3Rwb2ludGVyY2FwdHVyZScsIGluRXZlbnQpO1xuICAgICAgZGlzcGF0Y2hlci5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgTVNHb3RQb2ludGVyQ2FwdHVyZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSBkaXNwYXRjaGVyLm1ha2VFdmVudCgnZ290cG9pbnRlcmNhcHR1cmUnLCBpbkV2ZW50KTtcbiAgICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gYXBwbHlQb2x5ZmlsbCgpIHtcblxuICAgIC8vIG9ubHkgYWN0aXZhdGUgaWYgdGhpcyBwbGF0Zm9ybSBkb2VzIG5vdCBoYXZlIHBvaW50ZXIgZXZlbnRzXG4gICAgaWYgKCF3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG4gICAgICB3aW5kb3cuUG9pbnRlckV2ZW50ID0gUG9pbnRlckV2ZW50O1xuXG4gICAgICBpZiAod2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgICAgIHZhciB0cCA9IHdpbmRvdy5uYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cztcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5uYXZpZ2F0b3IsICdtYXhUb3VjaFBvaW50cycsIHtcbiAgICAgICAgICB2YWx1ZTogdHAsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgZGlzcGF0Y2hlci5yZWdpc3RlclNvdXJjZSgnbXMnLCBtc0V2ZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93Lm5hdmlnYXRvciwgJ21heFRvdWNoUG9pbnRzJywge1xuICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGRpc3BhdGNoZXIucmVnaXN0ZXJTb3VyY2UoJ21vdXNlJywgbW91c2VFdmVudHMpO1xuICAgICAgICBpZiAod2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZGlzcGF0Y2hlci5yZWdpc3RlclNvdXJjZSgndG91Y2gnLCB0b3VjaEV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGlzcGF0Y2hlci5yZWdpc3Rlcihkb2N1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG4gPSB3aW5kb3cubmF2aWdhdG9yO1xuICB2YXIgcztcbiAgdmFyIHI7XG4gIHZhciBoO1xuICBmdW5jdGlvbiBhc3NlcnRBY3RpdmUoaWQpIHtcbiAgICBpZiAoIWRpc3BhdGNoZXIucG9pbnRlcm1hcC5oYXMoaWQpKSB7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ0ludmFsaWRQb2ludGVySWQnKTtcbiAgICAgIGVycm9yLm5hbWUgPSAnSW52YWxpZFBvaW50ZXJJZCc7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gYXNzZXJ0Q29ubmVjdGVkKGVsZW0pIHtcbiAgICB2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9PSBlbGVtLm93bmVyRG9jdW1lbnQpIHtcbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICBpZiAoIXBhcmVudCkge1xuICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicpO1xuICAgICAgZXJyb3IubmFtZSA9ICdJbnZhbGlkU3RhdGVFcnJvcic7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gaW5BY3RpdmVCdXR0b25TdGF0ZShpZCkge1xuICAgIHZhciBwID0gZGlzcGF0Y2hlci5wb2ludGVybWFwLmdldChpZCk7XG4gICAgcmV0dXJuIHAuYnV0dG9ucyAhPT0gMDtcbiAgfVxuICBpZiAobi5tc1BvaW50ZXJFbmFibGVkKSB7XG4gICAgcyA9IGZ1bmN0aW9uKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0QWN0aXZlKHBvaW50ZXJJZCk7XG4gICAgICBhc3NlcnRDb25uZWN0ZWQodGhpcyk7XG4gICAgICBpZiAoaW5BY3RpdmVCdXR0b25TdGF0ZShwb2ludGVySWQpKSB7XG4gICAgICAgIGRpc3BhdGNoZXIuc2V0Q2FwdHVyZShwb2ludGVySWQsIHRoaXMsIHRydWUpO1xuICAgICAgICB0aGlzLm1zU2V0UG9pbnRlckNhcHR1cmUocG9pbnRlcklkKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHIgPSBmdW5jdGlvbihwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydEFjdGl2ZShwb2ludGVySWQpO1xuICAgICAgZGlzcGF0Y2hlci5yZWxlYXNlQ2FwdHVyZShwb2ludGVySWQsIHRydWUpO1xuICAgICAgdGhpcy5tc1JlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcyA9IGZ1bmN0aW9uIHNldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0QWN0aXZlKHBvaW50ZXJJZCk7XG4gICAgICBhc3NlcnRDb25uZWN0ZWQodGhpcyk7XG4gICAgICBpZiAoaW5BY3RpdmVCdXR0b25TdGF0ZShwb2ludGVySWQpKSB7XG4gICAgICAgIGRpc3BhdGNoZXIuc2V0Q2FwdHVyZShwb2ludGVySWQsIHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gICAgciA9IGZ1bmN0aW9uIHJlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydEFjdGl2ZShwb2ludGVySWQpO1xuICAgICAgZGlzcGF0Y2hlci5yZWxlYXNlQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gIH1cbiAgaCA9IGZ1bmN0aW9uIGhhc1BvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgIHJldHVybiAhIWRpc3BhdGNoZXIuY2FwdHVyZUluZm9bcG9pbnRlcklkXTtcbiAgfTtcblxuICBmdW5jdGlvbiBhcHBseVBvbHlmaWxsJDEoKSB7XG4gICAgaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5zZXRQb2ludGVyQ2FwdHVyZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRWxlbWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgJ3NldFBvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIH0sXG4gICAgICAgICdyZWxlYXNlUG9pbnRlckNhcHR1cmUnOiB7XG4gICAgICAgICAgdmFsdWU6IHJcbiAgICAgICAgfSxcbiAgICAgICAgJ2hhc1BvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiBoXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5QXR0cmlidXRlU3R5bGVzKCk7XG4gIGFwcGx5UG9seWZpbGwoKTtcbiAgYXBwbHlQb2x5ZmlsbCQxKCk7XG5cbiAgdmFyIHBvaW50ZXJldmVudHMgPSB7XG4gICAgZGlzcGF0Y2hlcjogZGlzcGF0Y2hlcixcbiAgICBJbnN0YWxsZXI6IEluc3RhbGxlcixcbiAgICBQb2ludGVyRXZlbnQ6IFBvaW50ZXJFdmVudCxcbiAgICBQb2ludGVyTWFwOiBQb2ludGVyTWFwLFxuICAgIHRhcmdldEZpbmRpbmc6IHRhcmdldGluZ1xuICB9O1xuXG4gIHJldHVybiBwb2ludGVyZXZlbnRzO1xuXG59KSk7IiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVmljdG9yO1xuXG4vKipcbiAqICMgVmljdG9yIC0gQSBKYXZhU2NyaXB0IDJEIHZlY3RvciBjbGFzcyB3aXRoIG1ldGhvZHMgZm9yIGNvbW1vbiB2ZWN0b3Igb3BlcmF0aW9uc1xuICovXG5cbi8qKlxuICogQ29uc3RydWN0b3IuIFdpbGwgYWxzbyB3b3JrIHdpdGhvdXQgdGhlIGBuZXdgIGtleXdvcmRcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gVmljdG9yKDQyLCAxMzM3KTtcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBWYWx1ZSBvZiB0aGUgeCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0geSBWYWx1ZSBvZiB0aGUgeSBheGlzXG4gKiBAcmV0dXJuIHtWaWN0b3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBWaWN0b3IgKHgsIHkpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFZpY3RvcikpIHtcblx0XHRyZXR1cm4gbmV3IFZpY3Rvcih4LCB5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgWCBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLng7XG5cdCAqICAgICAvLyA9PiA0MlxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy54ID0geCB8fCAwO1xuXG5cdC8qKlxuXHQgKiBUaGUgWSBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLnk7XG5cdCAqICAgICAvLyA9PiAyMVxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy55ID0geSB8fCAwO1xufTtcblxuLyoqXG4gKiAjIFN0YXRpY1xuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBmcm9tIGFuIGFycmF5XG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBWaWN0b3IuZnJvbUFycmF5KFs0MiwgMjFdKTtcbiAqXG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo0MiwgeToyMVxuICpcbiAqIEBuYW1lIFZpY3Rvci5mcm9tQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IHdpdGggdGhlIHggYW5kIHkgdmFsdWVzIGF0IGluZGV4IDAgYW5kIDEgcmVzcGVjdGl2ZWx5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IFRoZSBuZXcgaW5zdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKGFyclswXSB8fCAwLCBhcnJbMV0gfHwgMCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IFZpY3Rvci5mcm9tT2JqZWN0KHsgeDogNDIsIHk6IDIxIH0pO1xuICpcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjQyLCB5OjIxXG4gKlxuICogQG5hbWUgVmljdG9yLmZyb21PYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogT2JqZWN0IHdpdGggdGhlIHZhbHVlcyBmb3IgeCBhbmQgeVxuICogQHJldHVybiB7VmljdG9yfSBUaGUgbmV3IGluc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IuZnJvbU9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0cmV0dXJuIG5ldyBWaWN0b3Iob2JqLnggfHwgMCwgb2JqLnkgfHwgMCk7XG59O1xuXG4vKipcbiAqICMgTWFuaXB1bGF0aW9uXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGFyZSBjaGFpbmFibGUuXG4gKi9cblxuLyoqXG4gKiBBZGRzIGFub3RoZXIgdmVjdG9yJ3MgWCBheGlzIHRvIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLmFkZFgodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6MTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCArPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW5vdGhlciB2ZWN0b3IncyBZIGF4aXMgdG8gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuYWRkWSh2ZWMyKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeTo0MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCB0byBhZGQgdG8gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkWSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy55ICs9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbm90aGVyIHZlY3RvciB0byB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5hZGQodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6NDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54ICs9IHZlYy54O1xuXHR0aGlzLnkgKz0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gYm90aCB2ZWN0b3IgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAzLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCArPSBzY2FsYXI7XG5cdHRoaXMueSArPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhclgoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMywgeTogMlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54ICs9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGdpdmVuIHNjYWxhciB0byB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEsIDIpO1xuICpcbiAqICAgICB2ZWMuYWRkU2NhbGFyWSgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAxLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgKz0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBYIGF4aXMgb2YgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3RYKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjgwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggLT0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIFkgYXhpcyBvZiBhbm90aGVyIHZlY3RvciBmcm9tIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5zdWJ0cmFjdFkodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjIwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RZID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3QodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6ODAsIHk6MjBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgc3VidHJhY3QgZnJvbSB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54IC09IHZlYy54O1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHNjYWxhciBmcm9tIGJvdGggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhcigyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogODAsIHk6IDE4MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBzdWJ0cmFjdFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdFNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54IC09IHNjYWxhcjtcblx0dGhpcy55IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgZ2l2ZW4gc2NhbGFyIGZyb20gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhclgoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDgwLCB5OiAyMDBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBnaXZlbiBzY2FsYXIgZnJvbSB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMjAwKTtcbiAqXG4gKiAgICAgdmVjLnN1YnRyYWN0U2NhbGFyWSgyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMTAwLCB5OiAxODBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSB4IGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlWCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVYID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggLz0gdmVjdG9yLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIHRoZSBZIGF4aXMgYnkgdGhlIHkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5kaXZpZGVZKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgYSBheGlzIHZhbHVlcyBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6MjVcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54IC89IHZlY3Rvci54O1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhciB2YWx1ZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZVNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdFx0dGhpcy55IC89IHNjYWxhcjtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnggPSAwO1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJYKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gVGhlIHNjYWxhciB0byBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy54ID0gMDtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJZKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnkgLz0gc2NhbGFyO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFgoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4Oi0xMDAsIHk6NTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFggPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueCAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFkoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTotNTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFkgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueSAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgYm90aCBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuaW52ZXJ0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDotMTAwLCB5Oi01MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmludmVydFgoKTtcblx0dGhpcy5pbnZlcnRZKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgWCBjb21wb25lbnQgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5WCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5WCA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54ICo9IHZlY3Rvci54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IFkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgKj0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdmFsdWVzIGZyb20gYSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHkodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggKj0gdmVjdG9yLng7XG5cdHRoaXMueSAqPSB2ZWN0b3IueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgYm90aCB2ZWN0b3IgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCAqPSBzY2FsYXI7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5U2NhbGFyWCgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVNjYWxhclkoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIGF4aXMgd2l0aFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemVcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0aWYgKGxlbmd0aCA9PT0gMCkge1xuXHRcdHRoaXMueCA9IDE7XG5cdFx0dGhpcy55ID0gMDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmRpdmlkZShWaWN0b3IobGVuZ3RoLCBsZW5ndGgpKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUubm9ybSA9IFZpY3Rvci5wcm90b3R5cGUubm9ybWFsaXplO1xuXG4vKipcbiAqIElmIHRoZSBhYnNvbHV0ZSB2ZWN0b3IgYXhpcyBpcyBncmVhdGVyIHRoYW4gYG1heGAsIG11bHRpcGxpZXMgdGhlIGF4aXMgYnkgYGZhY3RvcmBcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5saW1pdCg4MCwgMC45KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjkwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1heCBUaGUgbWF4aW11bSB2YWx1ZSBmb3IgYm90aCB4IGFuZCB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBmYWN0b3IgRmFjdG9yIGJ5IHdoaWNoIHRoZSBheGlzIGFyZSB0byBiZSBtdWx0aXBsaWVkIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobWF4LCBmYWN0b3IpIHtcblx0aWYgKE1hdGguYWJzKHRoaXMueCkgPiBtYXgpeyB0aGlzLnggKj0gZmFjdG9yOyB9XG5cdGlmIChNYXRoLmFicyh0aGlzLnkpID4gbWF4KXsgdGhpcy55ICo9IGZhY3RvcjsgfVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyBib3RoIHZlY3RvciBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZShuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NjcsIHk6NzNcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR0aGlzLnJhbmRvbWl6ZVgodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21pemVzIHRoZSB5IGF4aXMgd2l0aCBhIHZhbHVlIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplWChuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTUsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZVggPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dmFyIG1pbiA9IE1hdGgubWluKHRvcExlZnQueCwgYm90dG9tUmlnaHQueCk7XG5cdHZhciBtYXggPSBNYXRoLm1heCh0b3BMZWZ0LngsIGJvdHRvbVJpZ2h0LngpO1xuXHR0aGlzLnggPSByYW5kb20obWluLCBtYXgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyB0aGUgeSBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZVkobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo2NlxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplWSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR2YXIgbWluID0gTWF0aC5taW4odG9wTGVmdC55LCBib3R0b21SaWdodC55KTtcblx0dmFyIG1heCA9IE1hdGgubWF4KHRvcExlZnQueSwgYm90dG9tUmlnaHQueSk7XG5cdHRoaXMueSA9IHJhbmRvbShtaW4sIG1heCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21seSByYW5kb21pemVzIGVpdGhlciBheGlzIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplQW55KG5ldyBWaWN0b3IoNTAsIDYwKSwgbmV3IFZpY3Rvcig3MCwgODApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo3N1xuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplQW55ID0gZnVuY3Rpb24gKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XG5cdGlmICghISBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpKSB7XG5cdFx0dGhpcy5yYW5kb21pemVYKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3VuZHMgYm90aCBheGlzIHRvIGFuIGludGVnZXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLjIsIDUwLjkpO1xuICpcbiAqICAgICB2ZWMudW5mbG9hdCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjUxXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS51bmZsb2F0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XG5cdHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdW5kcyBib3RoIGF4aXMgdG8gYSBjZXJ0YWluIHByZWNpc2lvblxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAuMiwgNTAuOSk7XG4gKlxuICogICAgIHZlYy51bmZsb2F0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NTFcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gUHJlY2lzaW9uIChkZWZhdWx0OiA4KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b0ZpeGVkID0gZnVuY3Rpb24gKHByZWNpc2lvbikge1xuXHRpZiAodHlwZW9mIHByZWNpc2lvbiA9PT0gJ3VuZGVmaW5lZCcpIHsgcHJlY2lzaW9uID0gODsgfVxuXHR0aGlzLnggPSB0aGlzLngudG9GaXhlZChwcmVjaXNpb24pO1xuXHR0aGlzLnkgPSB0aGlzLnkudG9GaXhlZChwcmVjaXNpb24pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBYIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhYID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueCA9ICgxIC0gYW1vdW50KSAqIHRoaXMueCArIGFtb3VudCAqIHZlYy54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBZIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WSh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhZID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueSA9ICgxIC0gYW1vdW50KSAqIHRoaXMueSArIGFtb3VudCAqIHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXggPSBmdW5jdGlvbiAodmVjLCBhbW91bnQpIHtcblx0dGhpcy5taXhYKHZlYywgYW1vdW50KTtcblx0dGhpcy5taXhZKHZlYywgYW1vdW50KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqICMgUHJvZHVjdHNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IHZlYzEuY2xvbmUoKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IEEgY2xvbmUgb2YgdGhlIHZlY3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIG5ldyBWaWN0b3IodGhpcy54LCB0aGlzLnkpO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYW5vdGhlciB2ZWN0b3IncyBYIGNvbXBvbmVudCBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5WCh2ZWMxKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmNvcHlYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbm90aGVyIHZlY3RvcidzIFkgY29tcG9uZW50IGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHlZKHZlYzEpO1xuICpcbiAqICAgICB2ZWMyLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeToyMFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY29weVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueSA9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29waWVzIGFub3RoZXIgdmVjdG9yJ3MgWCBhbmQgWSBjb21wb25lbnRzIGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHkodmVjMSk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwLCB5OjIwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLmNvcHlYKHZlYyk7XG5cdHRoaXMuY29weVkodmVjKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZlY3RvciB0byB6ZXJvICgwLDApXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICpcdFx0IHZhcjEuemVybygpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjAsIHk6MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy54ID0gdGhpcy55ID0gMDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZG90KHZlYzIpO1xuICogICAgIC8vID0+IDIzMDAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEb3QgcHJvZHVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiAodmVjMikge1xuXHRyZXR1cm4gdGhpcy54ICogdmVjMi54ICsgdGhpcy55ICogdmVjMi55O1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uICh2ZWMyKSB7XG5cdHJldHVybiAodGhpcy54ICogdmVjMi55ICkgLSAodGhpcy55ICogdmVjMi54ICk7XG59O1xuXG4vKipcbiAqIFByb2plY3RzIGEgdmVjdG9yIG9udG8gYW5vdGhlciB2ZWN0b3IsIHNldHRpbmcgaXRzZWxmIHRvIHRoZSByZXN1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqXG4gKiAgICAgdmVjLnByb2plY3RPbnRvKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gcHJvamVjdCB0aGlzIHZlY3RvciBvbnRvXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnByb2plY3RPbnRvID0gZnVuY3Rpb24gKHZlYzIpIHtcbiAgICB2YXIgY29lZmYgPSAoICh0aGlzLnggKiB2ZWMyLngpKyh0aGlzLnkgKiB2ZWMyLnkpICkgLyAoKHZlYzIueCp2ZWMyLngpKyh2ZWMyLnkqdmVjMi55KSk7XG4gICAgdGhpcy54ID0gY29lZmYgKiB2ZWMyLng7XG4gICAgdGhpcy55ID0gY29lZmYgKiB2ZWMyLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZURlZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHJhZGlhbjJkZWdyZWVzKHRoaXMuaG9yaXpvbnRhbEFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS52ZXJ0aWNhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLngsIHRoaXMueSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnZlcnRpY2FsQW5nbGVEZWcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiByYWRpYW4yZGVncmVlcyh0aGlzLnZlcnRpY2FsQW5nbGUoKSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGU7XG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlRGVnID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGVEZWc7XG5WaWN0b3IucHJvdG90eXBlLmRpcmVjdGlvbiA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlO1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuXHR2YXIgbnggPSAodGhpcy54ICogTWF0aC5jb3MoYW5nbGUpKSAtICh0aGlzLnkgKiBNYXRoLnNpbihhbmdsZSkpO1xuXHR2YXIgbnkgPSAodGhpcy54ICogTWF0aC5zaW4oYW5nbGUpKSArICh0aGlzLnkgKiBNYXRoLmNvcyhhbmdsZSkpO1xuXG5cdHRoaXMueCA9IG54O1xuXHR0aGlzLnkgPSBueTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlRGVnID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cdGFuZ2xlID0gZGVncmVlczJyYWRpYW4oYW5nbGUpO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGUoYW5nbGUpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUbyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJldHVybiB0aGlzLnJvdGF0ZShyb3RhdGlvbi10aGlzLmFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUb0RlZyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVUbyhyb3RhdGlvbik7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5ID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHZhciBhbmdsZSA9IHRoaXMuYW5nbGUoKSArIHJvdGF0aW9uO1xuXG5cdHJldHVybiB0aGlzLnJvdGF0ZShhbmdsZSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5RGVnID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVCeShyb3RhdGlvbik7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIG9mIHRoZSBYIGF4aXMgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWCh2ZWMyKTtcbiAqICAgICAvLyA9PiAtMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiB0aGlzLnggLSB2ZWMueDtcbn07XG5cbi8qKlxuICogU2FtZSBhcyBgZGlzdGFuY2VYKClgIGJ1dCBhbHdheXMgcmV0dXJucyBhbiBhYnNvbHV0ZSBudW1iZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5hYnNEaXN0YW5jZVgodmVjMik7XG4gKiAgICAgLy8gPT4gMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWCh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2Ugb2YgdGhlIFkgYXhpcyBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IC0xMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VZID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gdGhpcy55IC0gdmVjLnk7XG59O1xuXG4vKipcbiAqIFNhbWUgYXMgYGRpc3RhbmNlWSgpYCBidXQgYWx3YXlzIHJldHVybnMgYW4gYWJzb2x1dGUgbnVtYmVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IDEwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWSh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5kaXN0YW5jZSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDAuNDk4NzU2MjExMjA4OVxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVNxKHZlYykpO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VTcSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VTcSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dmFyIGR4ID0gdGhpcy5kaXN0YW5jZVgodmVjKSxcblx0XHRkeSA9IHRoaXMuZGlzdGFuY2VZKHZlYyk7XG5cblx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb3IgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGgoKTtcbiAqICAgICAvLyA9PiAxMTEuODAzMzk4ODc0OTg5NDhcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IExlbmd0aCAvIE1hZ25pdHVkZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcbn07XG5cbi8qKlxuICogU3F1YXJlZCBsZW5ndGggLyBtYWduaXR1ZGVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGhTcSgpO1xuICogICAgIC8vID0+IDEyNTAwXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBMZW5ndGggLyBNYWduaXR1ZGVcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGVuZ3RoU3EgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IFZpY3Rvci5wcm90b3R5cGUubGVuZ3RoO1xuXG4vKipcbiAqIFJldHVybnMgYSB0cnVlIGlmIHZlY3RvciBpcyAoMCwgMClcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmVjLnplcm8oKTtcbiAqXG4gKiAgICAgLy8gPT4gdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHRydWUgaWYgdGhpcyB2ZWN0b3IgaXMgdGhlIHNhbWUgYXMgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZlYzEuaXNFcXVhbFRvKHZlYzIpO1xuICpcbiAqICAgICAvLyA9PiB0cnVlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaXNFcXVhbFRvID0gZnVuY3Rpb24odmVjMikge1xuXHRyZXR1cm4gdGhpcy54ID09PSB2ZWMyLnggJiYgdGhpcy55ID09PSB2ZWMyLnk7XG59O1xuXG4vKipcbiAqICMgVXRpbGl0eSBNZXRob2RzXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIGFuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MjBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gJ3g6JyArIHRoaXMueCArICcsIHk6JyArIHRoaXMueTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b0FycmF5KCk7XG4gKiAgICAgLy8gPT4gWzEwLCAyMF1cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9PYmplY3QoKTtcbiAqICAgICAvLyA9PiB7IHg6IDEwLCB5OiAyMCB9XG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b09iamVjdCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHsgeDogdGhpcy54LCB5OiB0aGlzLnkgfTtcbn07XG5cblxudmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5mdW5jdGlvbiByYW5kb20gKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG59XG5cbmZ1bmN0aW9uIHJhZGlhbjJkZWdyZWVzIChyYWQpIHtcblx0cmV0dXJuIHJhZCAqIGRlZ3JlZXM7XG59XG5cbmZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFuIChkZWcpIHtcblx0cmV0dXJuIGRlZyAvIGRlZ3JlZXM7XG59XG4iXX0=

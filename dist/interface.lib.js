(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Interface = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./canvasWidget":2}],2:[function(require,module,exports){
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

    var shouldUseTouch = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

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

},{"./domWidget":4,"./utilities":15,"./widgetLabel":17}],3:[function(require,module,exports){
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
      Communication.OSC._receive(e.data);
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

},{"./widget":16}],4:[function(require,module,exports){
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
    this.element.style.left = x;
    this.element.style.top = y;

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

},{"./utilities":15,"./widget":16}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Filters = {
  Scale: function Scale() {
    var inmin = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var inmax = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var outmin = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
    var outmax = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

    var inrange = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange;

    return function (input) {
      return outmin + input * rangeRatio;
    };
  }
};

exports.default = Filters;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XY = exports.Keyboard = exports.MultiButton = exports.MultiSlider = exports.Knob = exports.Communication = exports.Menu = exports.Button = exports.Joystick = exports.Slider = exports.Panel = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Everything we need to include goes here and is fed to browserify in the gulpfile.js

exports.Panel = _panel2.default;
exports.Slider = _slider2.default;
exports.Joystick = _joystick2.default;
exports.Button = _button2.default;
exports.Menu = _menu2.default;
exports.Communication = _communication2.default;
exports.Knob = _knob2.default;
exports.MultiSlider = _multislider2.default;
exports.MultiButton = _multiButton2.default;
exports.Keyboard = _keyboard2.default;
exports.XY = _xy2.default;

},{"./button":1,"./communication":3,"./joystick":7,"./keyboard":8,"./knob":9,"./menu":10,"./multiButton":11,"./multislider":12,"./panel":13,"./slider":14,"./xy":18,"pepjs":19}],7:[function(require,module,exports){
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

},{"./canvasWidget.js":2}],8:[function(require,module,exports){
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
    blackColor: '#000'
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
      __prevValue: []
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
          bounds.push({ x: currentX, y: 0 });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .6, y: 0 });
          bounds.push({ x: currentX, y: 0 });

          currentX += keyWidth * .4;
          break;

        case 'wMiddle':
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
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: blackHeight });
          bounds.push({ x: currentX, y: blackHeight });
          bounds.push({ x: currentX, y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1.1, y: rect.height });
          bounds.push({ x: currentX + keyWidth * 1.1, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: blackHeight });
          bounds.push({ x: currentX + keyWidth * .7, y: 0 });
          bounds.push({ x: currentX + keyWidth * .2, y: 0 });

          currentX += keyWidth * .7;
          break;

        case 'wMiddleL':
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
      if (this.active && e.pointerId === this.pointerId) {
        //this.processPointerPosition( e )
      }
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
        this.__value[i] = dir === 'down' ? 1 : 0;
        var __shouldDraw = this.output(hitKeyNum, dir);

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

},{"./canvasWidget.js":2,"./utilities.js":15}],9:[function(require,module,exports){
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
});

module.exports = Knob;

},{"./canvasWidget.js":2}],10:[function(require,module,exports){
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

},{"./domWidget.js":4}],11:[function(require,module,exports){
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

},{"./canvasWidget":2}],12:[function(require,module,exports){
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

},{"./canvasWidget.js":2}],13:[function(require,module,exports){
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
    var props = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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

},{}],14:[function(require,module,exports){
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

},{"./canvasWidget.js":2}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Utilities = {
  getMode: function getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse';
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
  }
};

exports.default = Utilities;

},{}],16:[function(require,module,exports){
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

},{"./communication.js":3,"./filters":5,"./utilities":15}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

},{}],18:[function(require,module,exports){
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
    var override = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

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

},{"./canvasWidget.js":2,"victor":20}],19:[function(require,module,exports){
/*!
 * PEP v0.4.1 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.PointerEventsPolyfill = factory()
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
    if (inDict.pressure) {
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
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  var _PointerEvent = PointerEvent;

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

  var _pointermap = PointerMap;

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
    pointermap: new _pointermap(),
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
      if (!this.contains(event.target, event.relatedTarget)) {
        this.leave(event);
      }
    },
    enterOver: function(event) {
      this.over(event);
      if (!this.contains(event.target, event.relatedTarget)) {
        this.enter(event);
      }
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
      var e = new _PointerEvent(inType, inEvent);
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
    setCapture: function(inPointerId, inTarget) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId);
      }
      this.captureInfo[inPointerId] = inTarget;
      var e = document.createEvent('Event');
      e.initEvent('gotpointercapture', true, false);
      e.pointerId = inPointerId;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);
      e._target = inTarget;
      this.asyncDispatchEvent(e);
    },
    releaseCapture: function(inPointerId) {
      var t = this.captureInfo[inPointerId];
      if (t) {
        var e = document.createEvent('Event');
        e.initEvent('lostpointercapture', true, false);
        e.pointerId = inPointerId;
        this.captureInfo[inPointerId] = undefined;
        document.removeEventListener('pointerup', this.implicitRelease);
        document.removeEventListener('pointercancel', this.implicitRelease);
        e._target = t;
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

  var _dispatcher = dispatcher;

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

  /**
   * This module uses Mutation Observers to dynamically adjust which nodes will
   * generate Pointer Events.
   *
   * All nodes that wish to generate Pointer Events must have the attribute
   * `touch-action` set to `none`.
   */
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

  var installer = Installer;

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; touch-action-delay: none; }';
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

  var mouse__pointermap = _dispatcher.pointermap;

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
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
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
      var e = _dispatcher.cloneEvent(inEvent);

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
      var p = mouse__pointermap.get(this.POINTER_ID);
      e.buttons = p ? p.buttons : 0;
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);
        if (!p) {
          _dispatcher.down(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = mouse__pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        mouse__pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        if (e.buttons === 0 || e.buttons === BUTTON_TO_BUTTONS[e.button]) {
          this.cleanupMouse();
          _dispatcher.up(e);
        } else {
          _dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        _dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanupMouse();
    },
    cleanupMouse: function() {
      mouse__pointermap.delete(this.POINTER_ID);
    }
  };

  var mouse = mouseEvents;

  var captureInfo = _dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var touch__pointermap = _dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // The presence of touch event handlers blocks scrolling, and so we must be careful to
  // avoid adding handlers unnecessarily.  Chrome plans to add a touch-action-delay property
  // (crbug.com/329559) to address this, and once we have that we can opt-in to a simpler
  // handler registration mechanism.  Rather than try to predict how exactly to opt-in to
  // that we'll just leave this disabled until there is a build of Chrome to test.
  var HAS_TOUCH_ACTION_DELAY = false;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.listen(target, this.events);
      } else {
        INSTALLER.enableOnSubtree(target);
      }
    },
    unregister: function(target) {
      if (HAS_TOUCH_ACTION_DELAY) {
        _dispatcher.unlisten(target, this.events);
      } else {

        // TODO(dfreedman): is it worth it to disconnect the MO?
      }
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        _dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          _dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      _dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        _dispatcher.unlisten(s, this.events);
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
      if (touch__pointermap.size === 0 || (touch__pointermap.size === 1 && touch__pointermap.has(1))) {
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
      var e = _dispatcher.cloneEvent(inTouch);

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
      e.width = inTouch.radiusX || inTouch.webkitRadiusX || 0;
      e.height = inTouch.radiusY || inTouch.webkitRadiusY || 0;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

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
      if (touch__pointermap.size >= tl.length) {
        var d = [];
        touch__pointermap.forEach(function(value, key) {

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
      touch__pointermap.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      _dispatcher.over(inPointer);
      _dispatcher.enter(inPointer);
      _dispatcher.down(inPointer);
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
      var pointer = touch__pointermap.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      _dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          _dispatcher.leaveOut(outEvent);
          _dispatcher.enterOver(event);
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
        _dispatcher.up(inPointer);
        _dispatcher.out(inPointer);
        _dispatcher.leave(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      _dispatcher.cancel(inPointer);
      _dispatcher.out(inPointer);
      _dispatcher.leave(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      touch__pointermap.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouse.lastTouches;
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

  if (!HAS_TOUCH_ACTION_DELAY) {
    INSTALLER = new installer(touchEvents.elementAdded, touchEvents.elementRemoved,
      touchEvents.elementChanged, touchEvents);
  }

  var touch = touchEvents;

  var ms__pointermap = _dispatcher.pointermap;
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
      _dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      _dispatcher.unlisten(target, this.events);
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
        e = _dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      ms__pointermap.delete(id);
    },
    MSPointerDown: function(inEvent) {
      ms__pointermap.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      _dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      _dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('lostpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = _dispatcher.makeEvent('gotpointercapture', inEvent);
      _dispatcher.dispatchEvent(e);
    }
  };

  var ms = msEvents;

  function platform_events__applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = _PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        _dispatcher.registerSource('ms', ms);
      } else {
        _dispatcher.registerSource('mouse', mouse);
        if (window.ontouchstart !== undefined) {
          _dispatcher.registerSource('touch', touch);
        }
      }

      _dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s, r;
  function assertDown(id) {
    if (!_dispatcher.pointermap.has(id)) {
      throw new Error('InvalidPointerId');
    }
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertDown(pointerId);
      this.msSetPointerCapture(pointerId);
    };
    r = function(pointerId) {
      assertDown(pointerId);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.setCapture(pointerId, this);
    };
    r = function releasePointerCapture(pointerId) {
      assertDown(pointerId);
      _dispatcher.releaseCapture(pointerId, this);
    };
  }

  function _capture__applyPolyfill() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        }
      });
    }
  }

  applyAttributeStyles();
  platform_events__applyPolyfill();
  _capture__applyPolyfill();

  var pointerevents = {
    dispatcher: _dispatcher,
    Installer: installer,
    PointerEvent: _PointerEvent,
    PointerMap: _pointermap,
    targetFinding: targeting
  };

  return pointerevents;

}));
},{}],20:[function(require,module,exports){
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

},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idXR0b24uanMiLCJqcy9jYW52YXNXaWRnZXQuanMiLCJqcy9jb21tdW5pY2F0aW9uLmpzIiwianMvZG9tV2lkZ2V0LmpzIiwianMvZmlsdGVycy5qcyIsImpzL2luZGV4LmpzIiwianMvam95c3RpY2suanMiLCJqcy9rZXlib2FyZC5qcyIsImpzL2tub2IuanMiLCJqcy9tZW51LmpzIiwianMvbXVsdGlCdXR0b24uanMiLCJqcy9tdWx0aXNsaWRlci5qcyIsImpzL3BhbmVsLmpzIiwianMvc2xpZGVyLmpzIiwianMvdXRpbGl0aWVzLmpzIiwianMvd2lkZ2V0LmpzIiwianMvd2lkZ2V0TGFiZWwuanMiLCJqcy94eS5qcyIsIm5vZGVfbW9kdWxlcy9wZXBqcy9kaXN0L3BlcC5qcyIsIm5vZGVfbW9kdWxlcy92aWN0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0FBRUE7Ozs7Ozs7OztBQVNBLElBQUksU0FBUyxPQUFPLE1BQVAsd0JBQWI7O0FBRUEsT0FBTyxNQUFQLENBQWUsTUFBZixFQUF1Qjs7QUFFckI7O0FBRUE7Ozs7Ozs7QUFPQSxZQUFVO0FBQ1IsYUFBUSxDQURBO0FBRVIsV0FBTSxDQUZFO0FBR1IsWUFBUSxLQUhBOztBQUtSOzs7Ozs7O0FBT0EsV0FBUTtBQVpBLEdBWFc7O0FBMEJyQjs7Ozs7OztBQU9BLFFBakNxQixrQkFpQ2IsS0FqQ2EsRUFpQ0w7QUFDZCxRQUFJLFNBQVMsT0FBTyxNQUFQLENBQWUsSUFBZixDQUFiOztBQUVBLDJCQUFhLE1BQWIsQ0FBb0IsSUFBcEIsQ0FBMEIsTUFBMUI7O0FBRUEsV0FBTyxNQUFQLENBQWUsTUFBZixFQUF1QixPQUFPLFFBQTlCLEVBQXdDLEtBQXhDOztBQUVBLFFBQUksTUFBTSxLQUFWLEVBQWtCLE9BQU8sT0FBUCxHQUFpQixNQUFNLEtBQXZCOztBQUVsQixXQUFP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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcDVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQnXG5cbi8qKlxuICogQSBCdXR0b24gd2l0aCB0aHJlZSBkaWZmZXJlbnQgc3R5bGVzOiAnbW9tZW50YXJ5JyB0cmlnZ2VycyBhIGZsYXNoIGFuZCBpbnN0YW5lb3VzIG91dHB1dCwgXG4gKiAnaG9sZCcgb3V0cHV0cyB0aGUgYnV0dG9ucyBtYXhpbXVtIHZhbHVlIHVudGlsIGl0IGlzIHJlbGVhc2VkLCBhbmQgJ3RvZ2dsZScgYWx0ZXJuYXRlcyBcbiAqIGJldHdlZW4gb3V0cHV0dGluZyBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlcyBvbiBwcmVzcy4gXG4gKiBcbiAqIEBtb2R1bGUgQnV0dG9uXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBCdXR0b24gPSBPYmplY3QuY3JlYXRlKCBDYW52YXNXaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBCdXR0b24sIHtcblxuICAvKiogQGxlbmRzIEJ1dHRvbi5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEJ1dHRvbiBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOjAsXG4gICAgdmFsdWU6MCxcbiAgICBhY3RpdmU6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSAnbW9tZW50YXJ5JywgJ2hvbGQnLCBvciAndG9nZ2xlJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIGludGVyYWN0aW9uIG9mIHRoZSBCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAndG9nZ2xlJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgQnV0dG9uIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgQnV0dG9uXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBhIEJ1dHRvbiBpbnN0YW5jZSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBidXR0b24gPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIGJ1dHRvbiApXG5cbiAgICBPYmplY3QuYXNzaWduKCBidXR0b24sIEJ1dHRvbi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgaWYoIHByb3BzLnZhbHVlICkgYnV0dG9uLl9fdmFsdWUgPSBwcm9wcy52YWx1ZVxuXG4gICAgYnV0dG9uLmluaXQoKVxuXG4gICAgcmV0dXJuIGJ1dHRvblxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBCdXR0b24gaW50byBpdHMgY2FudmFzIGNvbnRleHQgdXNpbmcgdGhlIGN1cnJlbnQgLl9fdmFsdWUgcHJvcGVydHkgYW5kIGJ1dHRvbiBzdHlsZS5cbiAgICogQG1lbWJlcm9mIEJ1dHRvblxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLl9fdmFsdWUgPT09IDEgPyB0aGlzLmZpbGwgOiB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIC8vIG9ubHkgaG9sZCBuZWVkcyB0byBsaXN0ZW4gZm9yIHBvaW50ZXJ1cCBldmVudHM7IHRvZ2dsZSBhbmQgbW9tZW50YXJ5IG9ubHkgY2FyZSBhYm91dCBwb2ludGVyZG93blxuICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICAgIHRoaXMucG9pbnRlcklkID0gZS5wb2ludGVySWRcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuXG4gICAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ3RvZ2dsZScgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IHRoaXMuX192YWx1ZSA9PT0gMSA/IDAgOiAxXG4gICAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ21vbWVudGFyeScgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgICAgc2V0VGltZW91dCggKCk9PiB7IHRoaXMuX192YWx1ZSA9IDA7IHRoaXMuZHJhdygpIH0sIDUwIClcbiAgICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDFcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGhpcy5vdXRwdXQoKVxuXG4gICAgICB0aGlzLmRyYXcoKVxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICYmIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwIClcblxuICAgICAgICB0aGlzLl9fdmFsdWUgPSAwXG4gICAgICAgIHRoaXMub3V0cHV0KClcblxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uXG4iLCJpbXBvcnQgRE9NV2lkZ2V0IGZyb20gJy4vZG9tV2lkZ2V0J1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcbmltcG9ydCBXaWRnZXRMYWJlbCBmcm9tICcuL3dpZGdldExhYmVsJ1xuXG4vKipcbiAqIENhbnZhc1dpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyBmb3Igd2lkZ2V0cyB0aGF0IHVzZSBIVE1MIGNhbnZhcyBlbGVtZW50cy5cbiAqIEBtb2R1bGUgQ2FudmFzV2lkZ2V0XG4gKiBAYXVnbWVudHMgRE9NV2lkZ2V0XG4gKi8gXG5cbmxldCBDYW52YXNXaWRnZXQgPSBPYmplY3QuY3JlYXRlKCBET01XaWRnZXQgKVxuXG5PYmplY3QuYXNzaWduKCBDYW52YXNXaWRnZXQsIHtcbiAgLyoqIEBsZW5kcyBDYW52YXNXaWRnZXQucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgY29sb3JzIGFuZCBjYW52YXMgY29udGV4dCBwcm9wZXJ0aWVzIGZvciB1c2UgaW4gQ2FudmFzV2lkZ2V0c1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgYmFja2dyb3VuZDonIzg4OCcsXG4gICAgZmlsbDonI2FhYScsXG4gICAgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LC4zKScsXG4gICAgbGluZVdpZHRoOjQsXG4gICAgZGVmYXVsdExhYmVsOiB7XG4gICAgICB4Oi41LCB5Oi41LCBhbGlnbjonY2VudGVyJywgd2lkdGg6MSwgdGV4dDonZGVtbydcbiAgICB9LFxuICAgIHNob3VsZERpc3BsYXlWYWx1ZTpmYWxzZVxuICB9LFxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IENhbnZhc1dpZGdldCBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgQ2FudmFzV2lkZ2V0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IHNob3VsZFVzZVRvdWNoID0gVXRpbGl0aWVzLmdldE1vZGUoKSA9PT0gJ3RvdWNoJ1xuICAgIFxuICAgIERPTVdpZGdldC5jcmVhdGUuY2FsbCggdGhpcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBDYW52YXNXaWRnZXQuZGVmYXVsdHMgKVxuXG4gICAgLyoqXG4gICAgICogU3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGNhbnZhcyAyRCBjb250ZXh0LlxuICAgICAqIEBtZW1iZXJvZiBDYW52YXNXaWRnZXRcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAqL1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbGVtZW50LmdldENvbnRleHQoICcyZCcgKVxuXG4gICAgdGhpcy5hcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaCApXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHRoZSBjYW52YXMgZWxlbWVudCB1c2VkIGJ5IHRoZSB3aWRnZXQgYW5kIHNldFxuICAgKiBzb21lIGRlZmF1bHQgQ1NTIHZhbHVlcy5cbiAgICogQG1lbWJlcm9mIENhbnZhc1dpZGdldFxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGVFbGVtZW50KCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKVxuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAndG91Y2gtYWN0aW9uJywgJ25vbmUnIClcbiAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSAgPSAnYmxvY2snXG4gICAgXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfSxcblxuICBhcHBseUhhbmRsZXJzKCBzaG91bGRVc2VUb3VjaD1mYWxzZSApIHtcbiAgICBsZXQgaGFuZGxlcnMgPSBzaG91bGRVc2VUb3VjaCA/IENhbnZhc1dpZGdldC5oYW5kbGVycy50b3VjaCA6IENhbnZhc1dpZGdldC5oYW5kbGVycy5tb3VzZVxuICAgIFxuICAgIC8vIHdpZGdldHMgaGF2ZSBpanMgZGVmaW5lZCBoYW5kbGVycyBzdG9yZWQgaW4gdGhlIF9ldmVudHMgYXJyYXksXG4gICAgLy8gYW5kIHVzZXItZGVmaW5lZCBldmVudHMgc3RvcmVkIHdpdGggJ29uJyBwcmVmaXhlcyAoZS5nLiBvbmNsaWNrLCBvbm1vdXNlZG93bilcbiAgICBmb3IoIGxldCBoYW5kbGVyTmFtZSBvZiBoYW5kbGVycyApIHtcbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCBoYW5kbGVyTmFtZSwgZXZlbnQgPT4ge1xuICAgICAgICBpZiggdHlwZW9mIHRoaXNbICdvbicgKyBoYW5kbGVyTmFtZSBdICA9PT0gJ2Z1bmN0aW9uJyAgKSB0aGlzWyAnb24nICsgaGFuZGxlck5hbWUgXSggZXZlbnQgKVxuICAgICAgfSlcbiAgICB9XG5cbiAgfSxcblxuICBoYW5kbGVyczoge1xuICAgIG1vdXNlOiBbXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAnbW91c2Vtb3ZlJyxcbiAgICAgICdtb3VzZWRvd24nLFxuICAgIF0sXG4gICAgdG91Y2g6IFtdXG4gIH0sXG5cbiAgYWRkTGFiZWwoKSB7XG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBjdHg6IHRoaXMuY3R4IH0sIHRoaXMubGFiZWwgfHwgdGhpcy5kZWZhdWx0TGFiZWwgKSxcbiAgICAgICAgbGFiZWwgPSBXaWRnZXRMYWJlbC5jcmVhdGUoIHByb3BzIClcblxuICAgIHRoaXMubGFiZWwgPSBsYWJlbFxuICAgIHRoaXMuX2RyYXcgPSB0aGlzLmRyYXdcbiAgICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2RyYXcoKVxuICAgICAgdGhpcy5sYWJlbC5kcmF3KClcbiAgICB9XG4gIH0sXG5cbiAgX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHBhbmVsXG5cbiAgICBpZiggdHlwZW9mIHRoaXMuYWRkRXZlbnRzID09PSAnZnVuY3Rpb24nICkgdGhpcy5hZGRFdmVudHMoKVxuXG4gICAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICB0aGlzLnBsYWNlKCkgXG5cbiAgICBpZiggdGhpcy5sYWJlbCB8fCB0aGlzLnNob3VsZERpc3BsYXlWYWx1ZSApIHRoaXMuYWRkTGFiZWwoKVxuICAgIGlmKCB0aGlzLnNob3VsZERpc3BsYXlWYWx1ZSApIHtcbiAgICAgIHRoaXMuX19wb3N0ZmlsdGVycy5wdXNoKCAoIHZhbHVlICkgPT4geyBcbiAgICAgICAgdGhpcy5sYWJlbC50ZXh0ID0gdmFsdWUudG9GaXhlZCggNSApXG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5kcmF3KCkgICAgIFxuXG4gIH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhc1dpZGdldFxuIiwiaW1wb3J0IFdpZGdldCBmcm9tICcuL3dpZGdldCdcblxubGV0IENvbW11bmljYXRpb24gPSB7XG4gIFNvY2tldCA6IG51bGwsXG4gIGluaXRpYWxpemVkOiBmYWxzZSxcblxuICBpbml0KCkge1xuICAgIHRoaXMuU29ja2V0ID0gbmV3IFdlYlNvY2tldCggdGhpcy5nZXRTZXJ2ZXJBZGRyZXNzKCkgKVxuICAgIHRoaXMuU29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMub25tZXNzYWdlXG5cbiAgICBsZXQgZnVsbExvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCksXG4gICAgICAgIGxvY2F0aW9uU3BsaXQgPSBmdWxsTG9jYXRpb24uc3BsaXQoICcvJyApLFxuICAgICAgICBpbnRlcmZhY2VOYW1lID0gbG9jYXRpb25TcGxpdFsgbG9jYXRpb25TcGxpdC5sZW5ndGggLSAxIF1cbiAgICBcbiAgICB0aGlzLlNvY2tldC5vbm9wZW4gPSAoKT0+IHtcbiAgICAgIHRoaXMuU29ja2V0LnNlbmQoIEpTT04uc3RyaW5naWZ5KHsgdHlwZTonbWV0YScsIGludGVyZmFjZU5hbWUsIGtleToncmVnaXN0ZXInIH0pIClcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICB9LFxuXG4gIGdldFNlcnZlckFkZHJlc3MoKSB7XG4gICAgbGV0IGV4cHIsIHNvY2tldElQQW5kUG9ydCwgc29ja2V0U3RyaW5nLCBpcCwgcG9ydFxuXG4gICAgZXhwciA9IC9bLWEtekEtWjAtOS5dKyg6KDY1NTNbMC01XXw2NTVbMC0yXVxcZHw2NVswLTRdXFxkezJ9fDZbMC00XVxcZHszfXxbMS01XVxcZHs0fXxbMS05XVxcZHswLDN9KSkvXG5cbiAgICBzb2NrZXRJUEFuZFBvcnQgPSBleHByLmV4ZWMoIHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpIClbIDAgXS5zcGxpdCggJzonIClcbiAgICBpcCA9IHNvY2tldElQQW5kUG9ydFsgMCBdXG4gICAgcG9ydCA9IHBhcnNlSW50KCBzb2NrZXRJUEFuZFBvcnRbIDEgXSApXG5cbiAgICBzb2NrZXRTdHJpbmcgPSBgd3M6Ly8ke2lwfToke3BvcnR9YFxuXG4gICAgcmV0dXJuIHNvY2tldFN0cmluZ1xuICB9LFxuXG4gIG9ubWVzc2FnZSggZSApIHtcbiAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoIGUuZGF0YSApXG4gICAgaWYoIGRhdGEudHlwZSA9PT0gJ29zYycgKSB7XG4gICAgICBDb21tdW5pY2F0aW9uLk9TQy5fcmVjZWl2ZSggZS5kYXRhICk7XG4gICAgfWVsc2Uge1xuICAgICAgaWYoIENvbW11bmljYXRpb24uU29ja2V0LnJlY2VpdmUgKSB7XG4gICAgICAgIENvbW11bmljYXRpb24uU29ja2V0LnJlY2VpdmUoIGRhdGEuYWRkcmVzcywgZGF0YS5wYXJhbWV0ZXJzICApXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIE9TQyA6IHtcbiAgICBjYWxsYmFja3M6IHt9LFxuICAgIG9ubWVzc2FnZTogbnVsbCxcblxuICAgIHNlbmQoIGFkZHJlc3MsIHBhcmFtZXRlcnMgKSB7XG4gICAgICBpZiggQ29tbXVuaWNhdGlvbi5Tb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSApIHtcbiAgICAgICAgaWYoIHR5cGVvZiBhZGRyZXNzID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICBsZXQgbXNnID0ge1xuICAgICAgICAgICAgdHlwZSA6IFwib3NjXCIsXG4gICAgICAgICAgICBhZGRyZXNzLFxuICAgICAgICAgICAgJ3BhcmFtZXRlcnMnOiBBcnJheS5pc0FycmF5KCBwYXJhbWV0ZXJzICkgPyBwYXJhbWV0ZXJzIDogWyBwYXJhbWV0ZXJzIF0sXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgQ29tbXVuaWNhdGlvbi5Tb2NrZXQuc2VuZCggSlNPTi5zdHJpbmdpZnkoIG1zZyApIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdJbnZhbGlkIG9zYyBtZXNzYWdlOicsIGFyZ3VtZW50cyApICAgXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aHJvdyBFcnJvciggJ1NvY2tldCBpcyBub3QgeWV0IGNvbm5lY3RlZDsgY2Fubm90IHNlbmQgT1NDIG1lc3NzYWdlcy4nIClcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICByZWNlaXZlKCBkYXRhICkge1xuICAgICAgbGV0IG1zZyA9IEpTT04ucGFyc2UoIGRhdGEgKVxuXG4gICAgICBpZiggbXNnLmFkZHJlc3MgaW4gdGhpcy5jYWxsYmFja3MgKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzWyBtc2cuYWRkcmVzcyBdKCBtc2cucGFyYW1ldGVycyApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZm9yKCBsZXQgd2lkZ2V0IG9mIFdpZGdldC53aWRnZXRzICkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coIFwiQ0hFQ0tcIiwgY2hpbGQua2V5LCBtc2cuYWRkcmVzcyApXG4gICAgICAgICAgaWYoIHdpZGdldC5rZXkgPT09IG1zZy5hZGRyZXNzICkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggY2hpbGQua2V5LCBtc2cucGFyYW1ldGVycyApXG4gICAgICAgICAgICB3aWRnZXQuc2V0VmFsdWUuYXBwbHkoIHdpZGdldCwgbXNnLnBhcmFtZXRlcnMgKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9ICAgIFxuXG4gICAgICAgIGlmKCB0aGlzLm9ubWVzc2FnZSAhPT0gbnVsbCApIHsgXG4gICAgICAgICAgdGhpcy5yZWNlaXZlKCBtc2cuYWRkcmVzcywgbXNnLnR5cGV0YWdzLCBtc2cucGFyYW1ldGVycyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21tdW5pY2F0aW9uXG4iLCJpbXBvcnQgV2lkZ2V0IGZyb20gJy4vd2lkZ2V0J1xuaW1wb3J0IFV0aWxpdGllcyBmcm9tICcuL3V0aWxpdGllcydcblxuLyoqXG4gKiBET01XaWRnZXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIHdpZGdldHMgdGhhdCB1c2UgSFRNTCBjYW52YXMgZWxlbWVudHMuXG4gKiBAYXVnbWVudHMgV2lkZ2V0XG4gKi9cblxubGV0IERPTVdpZGdldCA9IE9iamVjdC5jcmVhdGUoIFdpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIERPTVdpZGdldCwge1xuICAvKiogQGxlbmRzIERPTVdpZGdldC5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIERPTVdpZGdldHNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIHg6MCx5OjAsd2lkdGg6LjI1LGhlaWdodDouMjUsXG4gICAgYXR0YWNoZWQ6ZmFsc2UsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBET01XaWRnZXQgaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoKSB7XG4gICAgbGV0IHNob3VsZFVzZVRvdWNoID0gVXRpbGl0aWVzLmdldE1vZGUoKSA9PT0gJ3RvdWNoJ1xuICAgIFxuICAgIFdpZGdldC5jcmVhdGUuY2FsbCggdGhpcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBET01XaWRnZXQuZGVmYXVsdHMgKVxuXG4gICAgLy8gQUxMIElOU1RBTkNFUyBPRiBET01XSURHRVQgTVVTVCBJTVBMRU1FTlQgQ1JFQVRFIEVMRU1FTlRcbiAgICBpZiggdHlwZW9mIHRoaXMuY3JlYXRlRWxlbWVudCA9PT0gJ2Z1bmN0aW9uJyApIHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgRE9NIGVsZW1lbnQgdXNlZCBieSB0aGUgRE9NV2lkZ2V0XG4gICAgICAgKiBAbWVtYmVyb2YgRE9NV2lkZ2V0XG4gICAgICAgKiBAaW5zdGFuY2VcbiAgICAgICAqL1xuICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jcmVhdGVFbGVtZW50KClcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3dpZGdldCBpbmhlcml0aW5nIGZyb20gRE9NV2lkZ2V0IGRvZXMgbm90IGltcGxlbWVudCBjcmVhdGVFbGVtZW50IG1ldGhvZDsgdGhpcyBpcyByZXF1aXJlZC4nIClcbiAgICB9XG4gIH0sXG4gIFxuICAvKipcbiAgICogQ3JlYXRlIGEgRE9NIGVsZW1lbnQgdG8gYmUgcGxhY2VkIGluIGEgUGFuZWwuXG4gICAqIEB2aXJ0dWFsXG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICB0aHJvdyBFcnJvciggJ2FsbCBzdWJjbGFzc2VzIG9mIERPTVdpZGdldCBtdXN0IGltcGxlbWVudCBjcmVhdGVFbGVtZW50KCknIClcbiAgfSxcblxuICAvKipcbiAgICogdXNlIENTUyB0byBwb3NpdGlvbiBlbGVtZW50IGVsZW1lbnQgb2Ygd2lkZ2V0XG4gICAqIEBtZW1iZXJvZiBET01XaWRnZXRcbiAgICovXG4gIHBsYWNlKCkge1xuICAgIGxldCBjb250YWluZXJXaWR0aCA9IHRoaXMuY29udGFpbmVyLmdldFdpZHRoKCksXG4gICAgICAgIGNvbnRhaW5lckhlaWdodD0gdGhpcy5jb250YWluZXIuZ2V0SGVpZ2h0KCksXG4gICAgICAgIHdpZHRoICA9IHRoaXMud2lkdGggIDw9IDEgPyBjb250YWluZXJXaWR0aCAgKiB0aGlzLndpZHRoIDogdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQgPD0gMSA/IGNvbnRhaW5lckhlaWdodCAqIHRoaXMuaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gdGhpcy54IDwgMSA/IGNvbnRhaW5lcldpZHRoICAqIHRoaXMueCA6IHRoaXMueCxcbiAgICAgICAgeSAgICAgID0gdGhpcy55IDwgMSA/IGNvbnRhaW5lckhlaWdodCAqIHRoaXMueSA6IHRoaXMueVxuXG4gICAgaWYoICF0aGlzLmF0dGFjaGVkICkge1xuICAgICAgdGhpcy5hdHRhY2hlZCA9IHRydWVcbiAgICB9XG4gIFxuICAgIGlmKCB0aGlzLmlzU3F1YXJlICkge1xuICAgICAgaWYoIGhlaWdodCA+IHdpZHRoICkge1xuICAgICAgICBoZWlnaHQgPSB3aWR0aFxuICAgICAgfWVsc2V7XG4gICAgICAgIHdpZHRoID0gaGVpZ2h0XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LndpZHRoICA9IHdpZHRoXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gICAgdGhpcy5lbGVtZW50LmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmxlZnQgPSB4XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLnRvcCAgPSB5XG5cbiAgICAvKipcbiAgICAgKiBCb3VuZGluZyBib3gsIGluIGFic29sdXRlIGNvb3JkaW5hdGVzLCBvZiB0aGUgRE9NV2lkZ2V0XG4gICAgICogQG1lbWJlcm9mIERPTVdpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5yZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLm9ucGxhY2UgPT09ICdmdW5jdGlvbicgKSB0aGlzLm9ucGxhY2UoKVxuICB9LFxuICBcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IERPTVdpZGdldFxuIiwibGV0IEZpbHRlcnMgPSB7XG4gIFNjYWxlKCBpbm1pbj0wLCBpbm1heD0xLCBvdXRtaW49LTEsIG91dG1heD0xICkge1xuICAgIGxldCBpbnJhbmdlICA9IGlubWF4IC0gaW5taW4sXG4gICAgICAgIG91dHJhbmdlID0gb3V0bWF4IC0gb3V0bWluLFxuICAgICAgICByYW5nZVJhdGlvID0gb3V0cmFuZ2UgLyBpbnJhbmdlXG5cbiAgICByZXR1cm4gaW5wdXQgPT4gb3V0bWluICsgaW5wdXQgKiByYW5nZVJhdGlvXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnNcbiIsIi8vIEV2ZXJ5dGhpbmcgd2UgbmVlZCB0byBpbmNsdWRlIGdvZXMgaGVyZSBhbmQgaXMgZmVkIHRvIGJyb3dzZXJpZnkgaW4gdGhlIGd1bHBmaWxlLmpzXG5cbmltcG9ydCBQYW5lbCBmcm9tICcuL3BhbmVsJ1xuaW1wb3J0IFNsaWRlciBmcm9tICcuL3NsaWRlcidcbmltcG9ydCBKb3lzdGljayBmcm9tICcuL2pveXN0aWNrJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuL2J1dHRvbidcbmltcG9ydCBNZW51IGZyb20gJy4vbWVudSdcbmltcG9ydCBDb21tdW5pY2F0aW9uIGZyb20gJy4vY29tbXVuaWNhdGlvbidcbmltcG9ydCBQRVAgZnJvbSAncGVwanMnXG5pbXBvcnQgS25vYiBmcm9tICcuL2tub2InXG5pbXBvcnQgTXVsdGlTbGlkZXIgZnJvbSAnLi9tdWx0aXNsaWRlcidcbmltcG9ydCBNdWx0aUJ1dHRvbiBmcm9tICcuL211bHRpQnV0dG9uJ1xuaW1wb3J0IEtleWJvYXJkIGZyb20gJy4va2V5Ym9hcmQnXG5pbXBvcnQgWFkgZnJvbSAnLi94eSdcblxuZXhwb3J0IHtcbiAgUGFuZWwsIFxuICBTbGlkZXIsIFxuICBKb3lzdGljaywgXG4gIEJ1dHRvbiwgXG4gIE1lbnUsIFxuICBDb21tdW5pY2F0aW9uLCBcbiAgS25vYiwgXG4gIE11bHRpU2xpZGVyLCBcbiAgTXVsdGlCdXR0b24sIFxuICBLZXlib2FyZCxcbiAgWFlcbn1cbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBqb3lzdGljayB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlbGVjdCBhbiBYWSBwb3NpdGlvbiBhbmQgdGhlbiBzbmFwcyBiYWNrLiBcbiAqIEBtb2R1bGUgSm95c3RpY2tcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IEpveXN0aWNrID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIEpveXN0aWNrLCB7XG4gIC8qKiBAbGVuZHMgSm95c3RpY2sucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBKb3lzdGljayBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6Wy41LC41XSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTpbLjUsLjVdLCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEpveXN0aWNrIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIFNsaWRlciB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBqb3lzdGljayA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggU2xpZGVyIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBqb3lzdGljayApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIGpveXN0aWNrLCBKb3lzdGljay5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBqb3lzdGljay5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIGpveXN0aWNrLmluaXQoKVxuXG4gICAgcmV0dXJuIGpveXN0aWNrXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIEpveXN0aWNrIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgSm95c3RpY2tcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBwZXJwX25vcm1fdmVjdG9yKHZhbHVlKSB7XG4gICAgbGV0IHgxID0gdmFsdWVbMF0tLjVcbiAgICBsZXQgeTEgPSB2YWx1ZVsxXS0uNVxuICAgIGxldCB4MiA9IDAuMFxuICAgIGxldCB5MiA9IC0oeDEveTEpKih4Mi14MSkreTFcbiAgICBsZXQgeDMgPSB4Mi14MVxuICAgIGxldCB5MyA9IHkyLXkxXG4gICAgbGV0IG0gPSBNYXRoLnNxcnQoeDMqeDMreTMqeTMpXG4gICAgeDMgPSB4My9tXG4gICAgeTMgPSB5My9tXG5cbiAgICByZXR1cm4gW3gzLHkzXVxuICB9LFxuXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgbGV0IHYgPSB0aGlzLnBlcnBfbm9ybV92ZWN0b3IodGhpcy5fX3ZhbHVlKVxuICAgIGxldCByID0gMTUuMFxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHgubW92ZVRvKHRoaXMucmVjdC53aWR0aCowLjUgKyByKnZbMF0qLjI1LHRoaXMucmVjdC5oZWlnaHQqLjUgKyByKnZbMV0qLjI1KTtcbiAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5yZWN0LndpZHRoICp0aGlzLl9fdmFsdWVbMF0rcip2WzBdLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWzFdK3IqdlsxXSk7XG4gICAgdGhpcy5jdHgubGluZVRvKHRoaXMucmVjdC53aWR0aCAqdGhpcy5fX3ZhbHVlWzBdLXIqdlswXSwgdGhpcy5yZWN0LmhlaWdodCAqIHRoaXMuX192YWx1ZVsxXS1yKnZbMV0pO1xuICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLnJlY3Qud2lkdGgqMC41IC0gcip2WzBdKi4yNSx0aGlzLnJlY3QuaGVpZ2h0Ki41IC0gcip2WzFdKi4yNSk7XG4gICAgdGhpcy5jdHguZmlsbCgpO1xuICAvLyAgdGhpcy5jdHguZmlsbFJlY3QoIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZVswXSAtMTIsIHRoaXMucmVjdC5oZWlnaHQgKiB0aGlzLl9fdmFsdWVbMV0gLTEyLCAyNCwgMjQgKVxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgIHRoaXMuY3R4LmFyYyh0aGlzLnJlY3Qud2lkdGggKnRoaXMuX192YWx1ZVswXSx0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWzFdLHIsMCwyKk1hdGguUEkpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcblxuXG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHguYXJjKHRoaXMucmVjdC53aWR0aCAqMC41LHRoaXMucmVjdC5oZWlnaHQgKiAwLjUsciouMjUsMCwyKk1hdGguUEkpO1xuICAgIHRoaXMuY3R4LmZpbGwoKTtcblxuXG4gICAgdGhpcy5jdHguc3Ryb2tlUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBzbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICAgIHRoaXMuX192YWx1ZSA9IFsuNSwuNV1cbiAgICAgICAgdGhpcy5vdXRwdXQoKVxuICAgICAgICB0aGlzLmRyYXcoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBKb3lzdGljaydzIHBvc2l0aW9uLCBhbmQgdHJpZ2dlcnMgb3V0cHV0LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlcm9mIEpveXN0aWNrXG4gICAqIEBwYXJhbSB7UG9pbnRlckV2ZW50fSBlIC0gVGhlIHBvaW50ZXIgZXZlbnQgdG8gYmUgcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcblxuICAgIHRoaXMuX192YWx1ZVswXSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIHRoaXMuX192YWx1ZVsxXSA9ICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgXG5cbiAgICAvLyBjbGFtcCBfX3ZhbHVlLCB3aGljaCBpcyBvbmx5IHVzZWQgaW50ZXJuYWxseVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPiAxICkgdGhpcy5fX3ZhbHVlWzBdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPiAxICkgdGhpcy5fX3ZhbHVlWzFdID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMF0gPCAwICkgdGhpcy5fX3ZhbHVlWzBdID0gMFxuICAgIGlmKCB0aGlzLl9fdmFsdWVbMV0gPCAwICkgdGhpcy5fX3ZhbHVlWzFdID0gMFxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5leHBvcnQgZGVmYXVsdCBKb3lzdGlja1xuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcbmltcG9ydCBVdGlsaXRpZXMgICAgZnJvbSAnLi91dGlsaXRpZXMuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgS2V5c1xuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5jb25zdCBLZXlzID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbmNvbnN0IGtleVR5cGVzRm9yTm90ZSA9IHtcbiAgYzogICAgICd3UmlnaHQnLFxuICAnYyMnOiAgJ2InLFxuICBkYjogICAgJ2InLFxuICBkOiAgICAgJ3dNaWRkbGUnLFxuICAnZCMnOiAgJ2InLFxuICBlYjogICAgJ2InLFxuICBlOiAgICAgJ3dMZWZ0JyxcbiAgZjogICAgICd3UmlnaHQnLFxuICAnZiMnOiAgJ2InLFxuICBnYjogICAgJ2InLFxuICBnOiAgICAgJ3dNaWRkbGVSJyxcbiAgJ2cjJzogICdiJyxcbiAgYWI6ICAgICdiJyxcbiAgYTogICAgICd3TWlkZGxlTCcsXG4gICdhIyc6ICAnYicsXG4gIGJiOiAgICAnYicsXG4gIGI6ICAgICAnd0xlZnQnIFxufSBcblxuY29uc3Qgbm90ZUludGVnZXJzID0gW1xuICAnYycsJ2RiJywnZCcsJ2ViJywnZScsJ2YnLCdnYicsJ2cnLCdhYicsJ2EnLCdiYicsJ2InXG5dXG5cbmNvbnN0IGtleUNvbG9ycyA9IFtcbiAgMSwwLDEsMCwxLDEsMCwxLDAsMSwwLDFcbl1cblxuXG5PYmplY3QuYXNzaWduKCBLZXlzLCB7XG4gIC8qKiBAbGVuZHMgS2V5cy5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEtleXMgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEtleXNcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIGFjdGl2ZTogICAgIGZhbHNlLFxuICAgIHN0YXJ0S2V5OiAgIDM2LFxuICAgIGVuZEtleTogICAgIDYwLFxuICAgIHdoaXRlQ29sb3I6ICcjZmZmJyxcbiAgICBibGFja0NvbG9yOiAnIzAwMCcsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBLZXlzIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgS2V5c1xuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgS2V5cyB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBrZXlzID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG4gICAgXG4gICAgLy8gYXBwbHkgV2lkZ2V0IGRlZmF1bHRzLCB0aGVuIG92ZXJ3cml0ZSAoaWYgYXBwbGljYWJsZSkgd2l0aCBLZXlzIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBrZXlzIClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggXG4gICAgICBrZXlzLCBcbiAgICAgIEtleXMuZGVmYXVsdHMsIFxuICAgICAgcHJvcHMsIFxuICAgICAgeyBcbiAgICAgICAgdmFsdWU6e30sIFxuICAgICAgICBfX3ZhbHVlOnt9LCBcbiAgICAgICAgYm91bmRzOltdLCBcbiAgICAgICAgYWN0aXZlOnt9LFxuICAgICAgICBfX3ByZXZWYWx1ZTpbXVxuICAgICAgfVxuICAgIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkga2V5cy5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIGtleXMuaW5pdCgpXG5cbiAgICBmb3IoIGxldCBpID0ga2V5cy5zdGFydEtleTsgaSA8IGtleXMuZW5kS2V5OyBpKysgKSB7XG4gICAgICBrZXlzLl9fdmFsdWVbIGkgXSA9IDBcbiAgICAgIGtleXMudmFsdWVbIGkgXSA9IDBcbiAgICAgIGtleXMuYm91bmRzWyBpIF0gPSBbXVxuICAgIH1cblxuICAgIGtleXMub25wbGFjZSA9ICgpID0+IGtleXMuX19kZWZpbmVCb3VuZHMoKVxuXG4gICAgcmV0dXJuIGtleXNcbiAgfSxcblxuICBfX2RlZmluZUJvdW5kcygpIHtcbiAgICBjb25zdCBrZXlSYW5nZSA9IHRoaXMuZW5kS2V5IC0gdGhpcy5zdGFydEtleVxuICAgIGNvbnN0IHJlY3QgPSB0aGlzLnJlY3RcbiAgICBjb25zdCBrZXlXaWR0aCA9IChyZWN0LndpZHRoIC8ga2V5UmFuZ2UpICogMS43MjVcbiAgICBjb25zdCBibGFja0hlaWdodCA9IC42NSAqIHJlY3QuaGVpZ2h0XG5cbiAgICBsZXQgY3VycmVudFggPSAwXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGtleVJhbmdlOyBpKysgKSB7XG4gICAgICBsZXQgYm91bmRzID0gdGhpcy5ib3VuZHNbIHRoaXMuc3RhcnRLZXkgKyBpIF1cbiAgICAgIGxldCBub3RlTnVtYmVyID0gKCB0aGlzLnN0YXJ0S2V5ICsgaSApICUgMTJcbiAgICAgIGxldCBub3RlTmFtZSAgID0gbm90ZUludGVnZXJzWyBub3RlTnVtYmVyIF1cbiAgICAgIGxldCBub3RlRHJhd1R5cGUgPSBrZXlUeXBlc0Zvck5vdGVbIG5vdGVOYW1lIF1cbiAgICAgIFxuICAgICAgc3dpdGNoKCBub3RlRHJhd1R5cGUgKSB7XG4gICAgICAgIGNhc2UgJ3dSaWdodCc6XG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNiwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjYsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTowIH0pXG5cbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC42XG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC42LCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNiwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OjAgfSlcblxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoICogLjRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgJ3dNaWRkbGUnOlxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC44LCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuOCwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuMiwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuMiwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuXG4gICAgICAgICAgY3VycmVudFggKz0ga2V5V2lkdGggKiAuOFxuICAgICAgICAgIGJyZWFrIFxuXG4gICAgICAgIGNhc2UgJ3dMZWZ0JzpcbiAgICAgICAgICBjdXJyZW50WCAtPSBrZXlXaWR0aCAqIC4yIFxuXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNCwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIFxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlICd3TWlkZGxlUic6XG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKi4yLCB5OjAgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqLjIsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFgsIHk6cmVjdC5oZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIDEuMSwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogMS4xLCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuNywgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICogLjcsIHk6MCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoICouMiwgeTowIH0pXG5cbiAgICAgICAgICBjdXJyZW50WCArPSBrZXlXaWR0aCAqIC43XG4gICAgICAgICAgYnJlYWsgXG5cbiAgICAgICAgY2FzZSAnd01pZGRsZUwnOlxuICAgICAgICAgIGN1cnJlbnRYIC09IGtleVdpZHRoICogLjFcblxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpyZWN0LmhlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCArIGtleVdpZHRoLCB5OnJlY3QuaGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGgsIHk6YmxhY2tIZWlnaHQgfSlcbiAgICAgICAgICBib3VuZHMucHVzaCh7IHg6Y3VycmVudFggKyBrZXlXaWR0aCAqIC44LCB5OmJsYWNrSGVpZ2h0IH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuOCwgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuMywgeTowIH0pXG4gICAgICAgICAgYm91bmRzLnB1c2goeyB4OmN1cnJlbnRYICsga2V5V2lkdGggKiAuMywgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIGJvdW5kcy5wdXNoKHsgeDpjdXJyZW50WCwgeTpibGFja0hlaWdodCB9KVxuICAgICAgICAgIFxuICAgICAgICAgIGN1cnJlbnRYICs9IGtleVdpZHRoICogLjhcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRHJhdyB0aGUgS2V5cyBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIEtleXNcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCkge1xuICAgIGNvbnN0IGN0eCAgPSB0aGlzLmN0eCAgXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5ibGFja0NvbG9yXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcbiAgICBcbiAgICBsZXQgY291bnQgID0gMFxuICAgIGZvciggbGV0IGJvdW5kcyBvZiB0aGlzLmJvdW5kcyApIHtcbiAgICAgIGlmKCBib3VuZHMgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlIFxuXG4gICAgICBsZXQgbm90ZU51bWJlciA9ICggdGhpcy5zdGFydEtleSArIGNvdW50ICkgJSAxMlxuICAgICAgbGV0IG5vdGVOYW1lICAgPSBub3RlSW50ZWdlcnNbIG5vdGVOdW1iZXIgXVxuICAgICAgbGV0IG5vdGVEcmF3VHlwZSA9IGtleVR5cGVzRm9yTm90ZVsgbm90ZU5hbWUgXVxuXG4gICAgICBjdHguYmVnaW5QYXRoKClcblxuICAgICAgY3R4Lm1vdmVUbyggYm91bmRzWzBdLngsIGJvdW5kc1swXS55IClcblxuICAgICAgZm9yKCBsZXQgaWR4ID0gMTsgaWR4IDwgYm91bmRzLmxlbmd0aDsgaWR4KysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oIGJvdW5kc1sgaWR4IF0ueCwgYm91bmRzWyBpZHggXS55IClcbiAgICAgIH1cblxuICAgICAgY3R4LmNsb3NlUGF0aCgpXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWVbIHRoaXMuc3RhcnRLZXkgKyBjb3VudCBdID09PSAxICkge1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gJyM5OTknXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGtleUNvbG9yc1sgbm90ZU51bWJlciBdID09PSAxID8gdGhpcy53aGl0ZUNvbG9yIDogdGhpcy5ibGFja0NvbG9yXG4gICAgICB9XG5cbiAgICAgIGN0eC5maWxsKClcbiAgICAgIGN0eC5zdHJva2UoKVxuXG4gICAgICBjb3VudCsrXG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgdGhpcy5wb2ludGVyZG93biApXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIGxldCBoaXQgPSB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUsICdkb3duJyApIC8vIGNoYW5nZSBrZXlzIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG4gICAgICBpZiggaGl0ICE9PSBudWxsICkge1xuICAgICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXSA9IGhpdCBcbiAgICAgICAgLy90aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5sYXN0QnV0dG9uID0gZGF0YS5idXR0b25OdW1cbiAgICAgIH1cblxuICAgICAgLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgdGhpcy5wb2ludGVybW92ZSApIC8vIG9ubHkgbGlzdGVuIGZvciB1cCBhbmQgbW92ZSBldmVudHMgYWZ0ZXIgcG9pbnRlcmRvd24gXG4gICAgICAvL3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBsZXQga2V5TnVtID0gdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF1cblxuICAgICAgaWYoIGtleU51bSAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgICAgZGVsZXRlIHRoaXMuYWN0aXZlWyBlLnBvaW50ZXJJZCBdXG5cbiAgICAgICAgdGhpcy5fX3ZhbHVlWyBrZXlOdW0gXSA9IDBcbiAgICAgICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgga2V5TnVtIClcbiAgICAgICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuXG4gICAgICAgIC8vd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICAvL3RoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBLZXlzJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgS2V5c1xuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUsIGRpciApIHtcbiAgICBsZXQgcHJldlZhbHVlID0gdGhpcy52YWx1ZSxcbiAgICAgICAgaGl0S2V5TnVtID0gbnVsbCxcbiAgICAgICAgc2hvdWxkRHJhdyA9IGZhbHNlXG5cbiAgICBmb3IoIGxldCBpID0gdGhpcy5zdGFydEtleTsgaSA8IHRoaXMuZW5kS2V5OyBpKysgKSB7XG4gICAgICBsZXQgaGl0ID0gVXRpbGl0aWVzLnBvbHlIaXRUZXN0KCBlLCB0aGlzLmJvdW5kc1sgaSBdLCB0aGlzLnJlY3QgKVxuXG4gICAgICBpZiggaGl0ID09PSB0cnVlICkge1xuICAgICAgICBoaXRLZXlOdW0gPSBpXG4gICAgICAgIHRoaXMuX192YWx1ZVsgaSBdID0gZGlyID09PSAnZG93bicgPyAxIDogMFxuICAgICAgICBsZXQgX19zaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoIGhpdEtleU51bSwgZGlyIClcblxuICAgICAgICBpZiggX19zaG91bGREcmF3ID09PSB0cnVlICkgc2hvdWxkRHJhdyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG5cbiAgICByZXR1cm4gaGl0S2V5TnVtXG4gIH0sXG5cbiAgb3V0cHV0KCBrZXlOdW0sIGRpciApIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9fdmFsdWVbIGtleU51bSBdLCBuZXdWYWx1ZUdlbmVyYXRlZCA9IGZhbHNlLCBwcmV2VmFsdWUgPSB0aGlzLl9fcHJldlZhbHVlWyBrZXlOdW0gXVxuXG4gICAgdmFsdWUgPSB0aGlzLnJ1bkZpbHRlcnMoIHZhbHVlLCB0aGlzIClcbiAgICBcbiAgICB0aGlzLnZhbHVlWyBrZXlOdW0gXSA9IHZhbHVlXG4gICAgXG4gICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICkgdGhpcy50cmFuc21pdCggWyB2YWx1ZSwga2V5TnVtIF0gKVxuXG4gICAgaWYoIHByZXZWYWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgaWYoIHZhbHVlICE9PSBwcmV2VmFsdWUgKSB7XG4gICAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYoIG5ld1ZhbHVlR2VuZXJhdGVkICkgeyBcbiAgICAgIGlmKCB0aGlzLm9udmFsdWVjaGFuZ2UgIT09IG51bGwgKSB0aGlzLm9udmFsdWVjaGFuZ2UoIHZhbHVlLCBrZXlOdW0gKSBcbiAgICAgIFxuICAgICAgdGhpcy5fX3ByZXZWYWx1ZVsga2V5TnVtIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIC8vIG5ld1ZhbHVlR2VuZXJhdGVkIGNhbiBiZSB1c2UgdG8gZGV0ZXJtaW5lIGlmIHdpZGdldCBzaG91bGQgZHJhd1xuICAgIHJldHVybiBuZXdWYWx1ZUdlbmVyYXRlZFxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtleXNcbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgS25vYlxuICogQGF1Z21lbnRzIENhbnZhc1dpZGdldFxuICovIFxuXG5sZXQgS25vYiA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBLbm9iLCB7XG4gIC8qKiBAbGVuZHMgS25vYi5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIEtub2IgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6LjUsIC8vIGFsd2F5cyAwLTEsIG5vdCBmb3IgZW5kLXVzZXJzXG4gICAgdmFsdWU6LjUsICAgLy8gZW5kLXVzZXIgdmFsdWUgdGhhdCBtYXkgYmUgZmlsdGVyZWRcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGtub2JCdWZmZXI6MjAsXG4gICAgdXNlc1JvdGF0aW9uOmZhbHNlLFxuICAgIGxhc3RQb3NpdGlvbjowLFxuICAgIGlzU3F1YXJlOnRydWUsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSBlaXRoZXIgJ2hvcml6b250YWwnICh0aGUgZGVmYXVsdCkgb3IgJ3ZlcnRpY2FsJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBLbm9iIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBLbm9iXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBzdHlsZTogICdob3Jpem9udGFsJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgS25vYiBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIEtub2JcbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIEtub2Igd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQga25vYiA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggS25vYiBkZWZhdWx0c1xuICAgIENhbnZhc1dpZGdldC5jcmVhdGUuY2FsbCgga25vYiApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIGtub2IsIEtub2IuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIC8vIHNldCB1bmRlcmx5aW5nIHZhbHVlIGlmIG5lY2Vzc2FyeS4uLiBUT0RPOiBob3cgc2hvdWxkIHRoaXMgYmUgc2V0IGdpdmVuIG1pbi9tYXg/XG4gICAgaWYoIHByb3BzLnZhbHVlICkga25vYi5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIGtub2IuaW5pdCgpXG5cbiAgICByZXR1cm4ga25vYlxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBLbm9iIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmNvbnRhaW5lci5iYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCAgID0gdGhpcy5saW5lV2lkdGhcblxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICBsZXQgeCA9IDAsXG4gICAgICAgIHkgPSAwLFxuICAgICAgICB3aWR0aCA9IHRoaXMucmVjdC53aWR0aCxcbiAgICAgICAgaGVpZ2h0PSB0aGlzLnJlY3QuaGVpZ2h0LFxuICAgICAgICByYWRpdXMgPSB3aWR0aCAvIDJcbiAgICBcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggeCwgeSwgd2lkdGgsIGhlaWdodCApXG4gICAgLy90aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG5cbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmQgLy8gZHJhdyBiYWNrZ3JvdW5kIG9mIHdpZGdldCBmaXJzdFxuXG4gICAgbGV0IGFuZ2xlMCA9IE1hdGguUEkgKiAuNixcbiAgICAgICAgYW5nbGUxID0gTWF0aC5QSSAqIC40XG5cbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgcmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyLCAgICAgICAgIGFuZ2xlMCwgYW5nbGUxLCBmYWxzZSApXG4gICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCAocmFkaXVzIC0gdGhpcy5rbm9iQnVmZmVyKSAqIC41ICwgYW5nbGUxLCBhbmdsZTAsIHRydWUgIClcdFx0XG4gICAgdGhpcy5jdHguY2xvc2VQYXRoKClcbiAgICBcbiAgICB0aGlzLmN0eC5maWxsKClcblxuICAgIGxldCBhbmdsZTJcbiAgICBpZighdGhpcy5pc0ludmVydGVkKSAgeyBcbiAgICAgIGFuZ2xlMiA9IE1hdGguUEkgKiAuNiArIHRoaXMuX192YWx1ZSAqIDEuOCAgKiBNYXRoLlBJXG4gICAgICBpZiggYW5nbGUyID4gMiAqIE1hdGguUEkpIGFuZ2xlMiAtPSAyICogTWF0aC5QSVxuICAgIH1lbHNle1xuICAgICAgYW5nbGUyID0gTWF0aC5QSSAqICgwLjQgLSAoMS44ICogdGhpcy5fX3ZhbHVlKSlcbiAgICB9XG5cbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuXG4gICAgaWYoIXRoaXMuaXNJbnZlcnRlZCkge1xuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsIGFuZ2xlMCwgYW5nbGUyLCBmYWxzZSApXG4gICAgICB0aGlzLmN0eC5hcmMoIHggKyByYWRpdXMsIHkgKyByYWRpdXMsIChyYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIpICogLjUsIGFuZ2xlMiwgYW5nbGUwLCB0cnVlIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdHguYXJjKCB4ICsgcmFkaXVzLCB5ICsgcmFkaXVzLCByYWRpdXMgLSB0aGlzLmtub2JCdWZmZXIsIGFuZ2xlMSwgYW5nbGUyICx0cnVlIClcbiAgICAgIHRoaXMuY3R4LmFyYyggeCArIHJhZGl1cywgeSArIHJhZGl1cywgKHJhZGl1cyAtIHRoaXMua25vYkJ1ZmZlcikgKiAuNSwgYW5nbGUyLCBhbmdsZTEsIGZhbHNlIClcbiAgICB9XG5cbiAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKVxuXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgdGhpcy5jdHguZmlsbCgpXG4gIFxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICAvLyBjcmVhdGUgZXZlbnQgaGFuZGxlcnMgYm91bmQgdG8gdGhlIGN1cnJlbnQgb2JqZWN0LCBvdGhlcndpc2UgXG4gICAgLy8gdGhlICd0aGlzJyBrZXl3b3JkIHdpbGwgcmVmZXIgdG8gdGhlIHdpbmRvdyBvYmplY3QgaW4gdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZXZlbnRzICkge1xuICAgICAgdGhpc1sga2V5IF0gPSB0aGlzLmV2ZW50c1sga2V5IF0uYmluZCggdGhpcyApIFxuICAgIH1cblxuICAgIC8vIG9ubHkgbGlzdGVuIGZvciBtb3VzZWRvd24gaW50aWFsbHk7IG1vdXNlbW92ZSBhbmQgbW91c2V1cCBhcmUgcmVnaXN0ZXJlZCBvbiBtb3VzZWRvd25cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgIHRoaXMucG9pbnRlcmRvd24gKVxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSBrbm9iIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBLbm9iJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgS25vYlxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG5cbiAgcHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIHtcbiAgICBsZXQgeE9mZnNldCA9IGUuY2xpZW50WCwgeU9mZnNldCA9IGUuY2xpZW50WVxuXG4gICAgbGV0IHJhZGl1cyA9IHRoaXMucmVjdC53aWR0aCAvIDI7XG4gICAgdGhpcy5sYXN0VmFsdWUgPSB0aGlzLnZhbHVlO1xuXG4gICAgaWYoICF0aGlzLnVzZXNSb3RhdGlvbiApIHtcbiAgICAgIGlmKCB0aGlzLmxhc3RQb3NpdGlvbiAhPT0gLTEgKSB7IFxuICAgICAgICAvL3RoaXMuX192YWx1ZSAtPSAoIHlPZmZzZXQgLSB0aGlzLmxhc3RQb3NpdGlvbiApIC8gKHJhZGl1cyAqIDIpO1xuICAgICAgICB0aGlzLl9fdmFsdWUgPSAxIC0geU9mZnNldCAvIHRoaXMucmVjdC5oZWlnaHRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHZhciB4ZGlmZiA9IHJhZGl1cyAtIHhPZmZzZXQ7XG4gICAgICB2YXIgeWRpZmYgPSByYWRpdXMgLSB5T2Zmc2V0O1xuICAgICAgdmFyIGFuZ2xlID0gTWF0aC5QSSArIE1hdGguYXRhbjIoeWRpZmYsIHhkaWZmKTtcbiAgICAgIHRoaXMuX192YWx1ZSA9ICAoKGFuZ2xlICsgKE1hdGguUEkgKiAxLjUpKSAlIChNYXRoLlBJICogMikpIC8gKE1hdGguUEkgKiAyKTtcblxuICAgICAgaWYodGhpcy5sYXN0Um90YXRpb25WYWx1ZSA+IC44ICYmIHRoaXMuX192YWx1ZSA8IC4yKSB7XG4gICAgICAgIHRoaXMuX192YWx1ZSA9IDE7XG4gICAgICB9ZWxzZSBpZih0aGlzLmxhc3RSb3RhdGlvblZhbHVlIDwgLjIgJiYgdGhpcy5fX3ZhbHVlID4gLjgpIHtcbiAgICAgICAgdGhpcy5fX3ZhbHVlID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX3ZhbHVlID4gMSkgdGhpcy5fX3ZhbHVlID0gMTtcbiAgICBpZiAodGhpcy5fX3ZhbHVlIDwgMCkgdGhpcy5fX3ZhbHVlID0gMDtcblxuICAgIHRoaXMubGFzdFJvdGF0aW9uVmFsdWUgPSB0aGlzLl9fdmFsdWU7XG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSB5T2Zmc2V0O1xuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG4gIC8vX19hZGRUb1BhbmVsKCBwYW5lbCApIHtcbiAgLy8gIHRoaXMuY29udGFpbmVyID0gcGFuZWxcblxuICAvLyAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAvLyAgLy8gY2FsbGVkIGlmIHdpZGdldCB1c2VzIERPTVdpZGdldCBhcyBwcm90b3R5cGU7IC5wbGFjZSBpbmhlcml0ZWQgZnJvbSBET01XaWRnZXRcbiAgICBcbiAgLy8gIHRoaXMucGxhY2UoIHRydWUgKSBcblxuICAvLyAgaWYoIHRoaXMubGFiZWwgKSB0aGlzLmFkZExhYmVsKClcblxuICAvLyAgdGhpcy5kcmF3KCkgICAgIFxuXG4gIC8vfVxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEtub2JcbiIsImltcG9ydCBET01XaWRnZXQgZnJvbSAnLi9kb21XaWRnZXQuanMnXG5cbi8qKlxuICogQSBIVE1MIHNlbGVjdCBlbGVtZW50LCBmb3IgcGlja2luZyBpdGVtcyBmcm9tIGEgZHJvcC1kb3duIG1lbnUuIFxuICogXG4gKiBAbW9kdWxlIE1lbnVcbiAqIEBhdWdtZW50cyBET01XaWRnZXRcbiAqLyBcbmxldCBNZW51ID0gT2JqZWN0LmNyZWF0ZSggRE9NV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIE1lbnUsIHtcbiAgLyoqIEBsZW5kcyBNZW51LnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgTWVudSBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAc3RhdGljXG4gICAqLyBcbiAgZGVmYXVsdHM6IHtcbiAgICBfX3ZhbHVlOjAsXG4gICAgdmFsdWU6MCxcbiAgICBiYWNrZ3JvdW5kOicjMzMzJyxcbiAgICBmaWxsOicjNzc3JyxcbiAgICBzdHJva2U6JyNhYWEnLFxuICAgIGJvcmRlcldpZHRoOjQsXG5cbiAgLyoqXG4gICAqIFRoZSBvcHRpb25zIGFycmF5IHN0b3JlcyB0aGUgZGlmZmVyZW50IHBvc3NpYmxlIHZhbHVlcyBmb3IgdGhlIE1lbnVcbiAgICogd2lkZ2V0LiBUaGVyZSBhcmUgdXNlZCB0byBjcmVhdGUgSFRNTCBvcHRpb24gZWxlbWVudHMgd2hpY2ggYXJlIHRoZW5cbiAgICogYXR0YWNoZWQgdG8gdGhlIHByaW1hcnkgc2VsZWN0IGVsZW1lbnQgdXNlZCBieSB0aGUgTWVudS5cbiAgICogQG1lbWJlcm9mIE1lbnVcbiAgICogQGluc3RhbmNlXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovIFxuICAgIG9wdGlvbnM6W10sXG4gICAgb252YWx1ZWNoYW5nZTpudWxsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBNZW51IGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgTWVudVxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgYSBNZW51IHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IG1lbnUgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBET01XaWRnZXQuY3JlYXRlLmNhbGwoIG1lbnUgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbWVudSwgTWVudS5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgbWVudS5jcmVhdGVPcHRpb25zKClcblxuICAgIG1lbnUuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgKCBlICk9PiB7XG4gICAgICBtZW51Ll9fdmFsdWUgPSBlLnRhcmdldC52YWx1ZVxuICAgICAgbWVudS5vdXRwdXQoKVxuXG4gICAgICBpZiggbWVudS5vbnZhbHVlY2hhbmdlICE9PSBudWxsICkge1xuICAgICAgICBtZW51Lm9udmFsdWVjaGFuZ2UoIG1lbnUudmFsdWUgIClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG1lbnVcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIHByaW1hcnkgRE9NIGVsZW1lbnQgKHNlbGVjdCkgdG8gYmUgcGxhY2VkIGluIGEgUGFuZWwuXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnIClcblxuICAgIHJldHVybiBzZWxlY3RcbiAgfSxcblxuICAvKipcbiAgICogR2VuZXJhdGUgb3B0aW9uIGVsZW1lbnRzIGZvciBtZW51LiBSZW1vdmVzIHByZXZpb3VzbHkgYXBwZW5kZWQgZWxlbWVudHMuXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGNyZWF0ZU9wdGlvbnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9ICcnXG5cbiAgICBmb3IoIGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zICkge1xuICAgICAgbGV0IG9wdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKVxuICAgICAgb3B0aW9uRWwuc2V0QXR0cmlidXRlKCAndmFsdWUnLCBvcHRpb24gKVxuICAgICAgb3B0aW9uRWwuaW5uZXJUZXh0ID0gb3B0aW9uXG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoIG9wdGlvbkVsIClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE92ZXJyaWRkZW4gdmlydHVhbCBtZXRob2QgdG8gYWRkIGVsZW1lbnQgdG8gcGFuZWwuXG4gICAqIEBwcml2YXRlXG4gICAqIEBtZW1iZXJvZiBNZW51IFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIF9fYWRkVG9QYW5lbCggcGFuZWwgKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBwYW5lbFxuXG4gICAgaWYoIHR5cGVvZiB0aGlzLmFkZEV2ZW50cyA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYWRkRXZlbnRzKClcblxuICAgIC8vIGNhbGxlZCBpZiB3aWRnZXQgdXNlcyBET01XaWRnZXQgYXMgcHJvdG90eXBlOyAucGxhY2UgaW5oZXJpdGVkIGZyb20gRE9NV2lkZ2V0XG4gICAgdGhpcy5wbGFjZSgpIFxuICB9XG5cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IE1lbnVcbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQnXG5cbi8qKlxuICogQSBNdWx0aUJ1dHRvbiB3aXRoIHRocmVlIGRpZmZlcmVudCBzdHlsZXM6ICdtb21lbnRhcnknIHRyaWdnZXJzIGEgZmxhc2ggYW5kIGluc3RhbmVvdXMgb3V0cHV0LCBcbiAqICdob2xkJyBvdXRwdXRzIHRoZSBtdWx0aUJ1dHRvbnMgbWF4aW11bSB2YWx1ZSB1bnRpbCBpdCBpcyByZWxlYXNlZCwgYW5kICd0b2dnbGUnIGFsdGVybmF0ZXMgXG4gKiBiZXR3ZWVuIG91dHB1dHRpbmcgbWF4aW11bSBhbmQgbWluaW11bSB2YWx1ZXMgb24gcHJlc3MuIFxuICogXG4gKiBAbW9kdWxlIE11bHRpQnV0dG9uXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBNdWx0aUJ1dHRvbiA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApXG5cbk9iamVjdC5hc3NpZ24oIE11bHRpQnV0dG9uLCB7XG5cbiAgLyoqIEBsZW5kcyBNdWx0aUJ1dHRvbi5wcm90b3R5cGUgKi9cblxuICAvKipcbiAgICogQSBzZXQgb2YgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5ncyBmb3IgYWxsIE11bHRpQnV0dG9uIGluc3RhbmNlcy5cbiAgICogRGVmYXVsdHMgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdXNlci1kZWZpbmVkIHByb3BlcnRpZXMgcGFzc2VkIHRvXG4gICAqIGNvbnN0cnV0b3IuXG4gICAqIEBtZW1iZXJvZiBNdWx0aUJ1dHRvblxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgcm93czoyLFxuICAgIGNvbHVtbnM6MixcbiAgICBsYXN0QnV0dG9uOm51bGwsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSAnbW9tZW50YXJ5JywgJ2hvbGQnLCBvciAndG9nZ2xlJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIGludGVyYWN0aW9uIG9mIHRoZSBNdWx0aUJ1dHRvbiBpbnN0YW5jZS5cbiAgICAgKiBAbWVtYmVyb2YgTXVsdGlCdXR0b25cbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIHN0eWxlOiAgJ3RvZ2dsZSdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IE11bHRpQnV0dG9uIGluc3RhbmNlLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlCdXR0b25cbiAgICogQGNvbnN0cnVjdHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wc10gLSBBIGRpY3Rpb25hcnkgb2YgcHJvcGVydGllcyB0byBpbml0aWFsaXplIGEgTXVsdGlCdXR0b24gaW5zdGFuY2Ugd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbXVsdGlCdXR0b24gPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIG11bHRpQnV0dG9uIClcblxuICAgIE9iamVjdC5hc3NpZ24oIG11bHRpQnV0dG9uLCBNdWx0aUJ1dHRvbi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgaWYoIHByb3BzLnZhbHVlICkge1xuICAgICAgbXVsdGlCdXR0b24uX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgfWVsc2V7XG4gICAgICBtdWx0aUJ1dHRvbi5fX3ZhbHVlID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbXVsdGlCdXR0b24uY291bnQ7IGkrKyApIG11bHRpQnV0dG9uLl9fdmFsdWVbIGkgXSA9IDBcbiAgICAgIG11bHRpQnV0dG9uLnZhbHVlID0gW11cbiAgICB9XG4gICAgXG4gICAgbXVsdGlCdXR0b24uYWN0aXZlID0ge31cbiAgICBtdWx0aUJ1dHRvbi5fX3ByZXZWYWx1ZSA9IFtdXG5cbiAgICBtdWx0aUJ1dHRvbi5pbml0KClcblxuICAgIHJldHVybiBtdWx0aUJ1dHRvblxuICB9LFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBNdWx0aUJ1dHRvbiBpbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eSBhbmQgbXVsdGlCdXR0b24gc3R5bGUuXG4gICAqIEBtZW1iZXJvZiBNdWx0aUJ1dHRvblxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLl9fdmFsdWUgPT09IDEgPyB0aGlzLmZpbGwgOiB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcblxuICAgIGxldCBidXR0b25XaWR0aCAgPSB0aGlzLnJlY3Qud2lkdGggIC8gdGhpcy5jb2x1bW5zLCAgXG4gICAgICAgIGJ1dHRvbkhlaWdodCA9IHRoaXMucmVjdC5oZWlnaHQgLyB0aGlzLnJvd3NcblxuICAgIGZvciggbGV0IHJvdyA9IDA7IHJvdyA8IHRoaXMucm93czsgcm93KysgKSB7XG4gICAgICBsZXQgeSA9IHJvdyAqIGJ1dHRvbkhlaWdodFxuICAgICAgZm9yKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgdGhpcy5jb2x1bW5zOyBjb2x1bW4rKyApIHtcbiAgICAgICAgbGV0IHggPSBjb2x1bW4gKiBidXR0b25XaWR0aCxcbiAgICAgICAgICAgIGJ1dHRvbk51bSA9IHJvdyAqIHRoaXMuY29sdW1ucyArIGNvbHVtblxuXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPT09IDEgPyB0aGlzLmZpbGwgOiB0aGlzLmJhY2tncm91bmRcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHgseSwgYnV0dG9uV2lkdGgsIGJ1dHRvbkhlaWdodCApXG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIHgseSwgYnV0dG9uV2lkdGgsIGJ1dHRvbkhlaWdodCApXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGFkZEV2ZW50cygpIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5ldmVudHMgKSB7XG4gICAgICB0aGlzWyBrZXkgXSA9IHRoaXMuZXZlbnRzWyBrZXkgXS5iaW5kKCB0aGlzICkgXG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBnZXREYXRhRnJvbUV2ZW50KCBlICkge1xuICAgIGxldCByb3dTaXplID0gMS90aGlzLnJvd3MsXG4gICAgICAgIHJvdyA9ICBNYXRoLmZsb29yKCAoIGUuY2xpZW50WSAvIHRoaXMucmVjdC5oZWlnaHQgKSAvIHJvd1NpemUgKSxcbiAgICAgICAgY29sdW1uU2l6ZSA9IDEvdGhpcy5jb2x1bW5zLFxuICAgICAgICBjb2x1bW4gPSAgTWF0aC5mbG9vciggKCBlLmNsaWVudFggLyB0aGlzLnJlY3Qud2lkdGggKSAvIGNvbHVtblNpemUgKSxcbiAgICAgICAgYnV0dG9uTnVtID0gcm93ICogdGhpcy5jb2x1bW5zICsgY29sdW1uXG5cbiAgICAgcmV0dXJuIHsgYnV0dG9uTnVtLCByb3csIGNvbHVtbiB9XG4gIH0sXG5cbiAgcHJvY2Vzc0J1dHRvbk9uKCBkYXRhLCBlICkge1xuICAgIGlmKCB0aGlzLnN0eWxlID09PSAndG9nZ2xlJyApIHtcbiAgICAgIHRoaXMuX192YWx1ZVsgYnV0dG9uTnVtIF0gPSB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID09PSAxID8gMCA6IDFcbiAgICB9ZWxzZSBpZiggdGhpcy5zdHlsZSA9PT0gJ21vbWVudGFyeScgKSB7XG4gICAgICB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID0gMVxuICAgICAgc2V0VGltZW91dCggKCk9PiB7IFxuICAgICAgICB0aGlzLl9fdmFsdWVbIGJ1dHRvbk51bSBdID0gMDtcbiAgICAgICAgLy9sZXQgaWR4ID0gdGhpcy5hY3RpdmUuZmluZEluZGV4KCB2ID0+IHYuYnV0dG9uTnVtID09PSBidXR0b25OdW0gKVxuICAgICAgICAvL3RoaXMuYWN0aXZlLnNwbGljZSggaWR4LCAxIClcbiAgICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0uc3BsaWNlKCB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5pbmRleE9mKCBidXR0b25OdW0gKSwgMSApXG4gICAgICAgIHRoaXMuZHJhdygpIFxuICAgICAgfSwgNTAgKVxuICAgIH1lbHNlIGlmKCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICB0aGlzLl9fdmFsdWVbIGRhdGEuYnV0dG9uTnVtIF0gPSAxXG4gICAgfVxuXG4gICAgdGhpcy5vdXRwdXQoIGRhdGEgKVxuXG4gICAgdGhpcy5kcmF3KClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIC8vIG9ubHkgaG9sZCBuZWVkcyB0byBsaXN0ZW4gZm9yIHBvaW50ZXJ1cCBldmVudHM7IHRvZ2dsZSBhbmQgbW9tZW50YXJ5IG9ubHkgY2FyZSBhYm91dCBwb2ludGVyZG93blxuICAgICAgbGV0IGRhdGEgPSB0aGlzLmdldERhdGFGcm9tRXZlbnQoIGUgKVxuXG4gICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXSA9IFsgZGF0YS5idXR0b25OdW0gXVxuICAgICAgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0ubGFzdEJ1dHRvbiA9IGRhdGEuYnV0dG9uTnVtXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIHRoaXMucG9pbnRlcnVwICkgXG5cbiAgICAgIHRoaXMucHJvY2Vzc0J1dHRvbk9uKCBkYXRhLCBlIClcbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBsZXQgZGF0YSA9IHRoaXMuZ2V0RGF0YUZyb21FdmVudCggZSApXG4gICAgICBcbiAgICAgIGxldCBjaGVja0ZvclByZXNzZWQgPSB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5pbmRleE9mKCBkYXRhLmJ1dHRvbk51bSApLFxuICAgICAgICAgIGxhc3RCdXR0b24gID0gdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF0ubGFzdEJ1dHRvblxuICAgICAgXG4gICAgICBpZiggY2hlY2tGb3JQcmVzc2VkID09PSAtMSAmJiBsYXN0QnV0dG9uICE9PSBkYXRhLmJ1dHRvbk51bSApIHtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAndG9nZ2xlJyB8fCB0aGlzLnN0eWxlID09PSAnaG9sZCcgKSB7XG4gICAgICAgICAgaWYoIHRoaXMuc3R5bGUgPT09ICdob2xkJyApIHtcbiAgICAgICAgICAgIHRoaXMuX192YWx1ZVsgbGFzdEJ1dHRvbiBdID0gMFxuICAgICAgICAgICAgdGhpcy5vdXRwdXQoIGRhdGEgKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXSA9IFsgZGF0YS5idXR0b25OdW0gXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5wdXNoKCBkYXRhLmJ1dHRvbk51bSApXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZVsgZS5wb2ludGVySWQgXS5sYXN0QnV0dG9uID0gZGF0YS5idXR0b25OdW1cblxuICAgICAgICB0aGlzLnByb2Nlc3NCdXR0b25PbiggZGF0YSwgZSApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCBPYmplY3Qua2V5cyggdGhpcy5hY3RpdmUgKS5sZW5ndGggKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlIClcblxuICAgICAgICBpZiggdGhpcy5zdHlsZSAhPT0gJ3RvZ2dsZScgKSB7XG4gICAgICAgICAgbGV0IGJ1dHRvbnNGb3JQb2ludGVyID0gdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF1cblxuICAgICAgICAgIGlmKCBidXR0b25zRm9yUG9pbnRlciAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZm9yKCBsZXQgYnV0dG9uIG9mIGJ1dHRvbnNGb3JQb2ludGVyICkge1xuICAgICAgICAgICAgICB0aGlzLl9fdmFsdWVbIGJ1dHRvbiBdID0gMFxuICAgICAgICAgICAgICBsZXQgcm93ID0gTWF0aC5mbG9vciggYnV0dG9uIC8gdGhpcy5yb3dzICksXG4gICAgICAgICAgICAgICAgICBjb2x1bW4gPSBidXR0b24gJSB0aGlzLmNvbHVtbnNcblxuICAgICAgICAgICAgICB0aGlzLm91dHB1dCh7IGJ1dHRvbk51bTpidXR0b24sIHJvdywgY29sdW1uIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5hY3RpdmVbIGUucG9pbnRlcklkIF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5kcmF3KClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgb3V0cHV0KCBidXR0b25EYXRhICkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX192YWx1ZVsgYnV0dG9uRGF0YS5idXR0b25OdW0gXSwgbmV3VmFsdWVHZW5lcmF0ZWQgPSBmYWxzZSwgcHJldlZhbHVlID0gdGhpcy5fX3ByZXZWYWx1ZVsgYnV0dG9uRGF0YS5idXR0b25OdW0gXVxuXG4gICAgdmFsdWUgPSB0aGlzLnJ1bkZpbHRlcnMoIHZhbHVlLCB0aGlzIClcbiAgICBcbiAgICB0aGlzLnZhbHVlWyBidXR0b25EYXRhLmJ1dHRvbk51bSBdID0gdmFsdWVcbiAgICBcbiAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKSB0aGlzLnRyYW5zbWl0KCBbIHZhbHVlLCBidXR0b25EYXRhLnJvdywgYnV0dG9uRGF0YS5jb2x1bW4gXSApXG5cbiAgICBpZiggcHJldlZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBpZiggdmFsdWUgIT09IHByZXZWYWx1ZSApIHtcbiAgICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiggbmV3VmFsdWVHZW5lcmF0ZWQgKSB7IFxuICAgICAgaWYoIHRoaXMub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHRoaXMub252YWx1ZWNoYW5nZSggdmFsdWUsIGJ1dHRvbkRhdGEucm93LCBidXR0b25EYXRhLmNvbHVtbiApXG4gICAgICBcbiAgICAgIHRoaXMuX19wcmV2VmFsdWVbIGJ1dHRvbkRhdGEuYnV0dG9uTnVtIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIC8vIG5ld1ZhbHVlR2VuZXJhdGVkIGNhbiBiZSB1c2UgdG8gZGV0ZXJtaW5lIGlmIHdpZGdldCBzaG91bGQgZHJhd1xuICAgIHJldHVybiBuZXdWYWx1ZUdlbmVyYXRlZFxuICB9LFxufSlcblxuZXhwb3J0IGRlZmF1bHQgTXVsdGlCdXR0b25cbiIsImltcG9ydCBDYW52YXNXaWRnZXQgZnJvbSAnLi9jYW52YXNXaWRnZXQuanMnXG5cbi8qKlxuICogQSBob3Jpem9udGFsIG9yIHZlcnRpY2FsIGZhZGVyLiBcbiAqIEBtb2R1bGUgTXVsdGlTbGlkZXJcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IE11bHRpU2xpZGVyID0gT2JqZWN0LmNyZWF0ZSggQ2FudmFzV2lkZ2V0ICkgXG5cbk9iamVjdC5hc3NpZ24oIE11bHRpU2xpZGVyLCB7XG4gIC8qKiBAbGVuZHMgTXVsdGlTbGlkZXIucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBNdWx0aVNsaWRlciBpbnN0YW5jZXMuXG4gICAqIERlZmF1bHRzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHVzZXItZGVmaW5lZCBwcm9wZXJ0aWVzIHBhc3NlZCB0b1xuICAgKiBjb25zdHJ1dG9yLlxuICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICogQHN0YXRpY1xuICAgKi8gIFxuICBkZWZhdWx0czoge1xuICAgIF9fdmFsdWU6Wy4xNSwuMzUsLjUsLjc1XSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTpbLjUsLjUsLjUsLjVdLCAgIC8vIGVuZC11c2VyIHZhbHVlIHRoYXQgbWF5IGJlIGZpbHRlcmVkXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICAvKipcbiAgICAgKiBUaGUgY291bnQgcHJvcGVydHkgZGV0ZXJtaW5lcyB0aGUgbnVtYmVyIG9mIHNsaWRlcnMgaW4gdGhlIG11bHRpc2xpZGVyLCBkZWZhdWx0IDQuXG4gICAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQHR5cGUge0ludGVnZXJ9XG4gICAgICovXG4gICAgY291bnQ6NCxcbiAgICBsaW5lV2lkdGg6MSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3R5bGUgcHJvcGVydHkgY2FuIGJlIGVpdGhlciAnaG9yaXpvbnRhbCcgKHRoZSBkZWZhdWx0KSBvciAndmVydGljYWwnLiBUaGlzXG4gICAgICogZGV0ZXJtaW5lcyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIE11bHRpU2xpZGVyIGluc3RhbmNlLlxuICAgICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6J3ZlcnRpY2FsJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgTXVsdGlTbGlkZXIgaW5zdGFuY2UuXG4gICAqIEBtZW1iZXJvZiBNdWx0aVNsaWRlclxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgTXVsdGlTbGlkZXIgd2l0aC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlKCBwcm9wcyApIHtcbiAgICBsZXQgbXVsdGlTbGlkZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcbiAgICBcbiAgICAvLyBhcHBseSBXaWRnZXQgZGVmYXVsdHMsIHRoZW4gb3ZlcndyaXRlIChpZiBhcHBsaWNhYmxlKSB3aXRoIE11bHRpU2xpZGVyIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBtdWx0aVNsaWRlciApXG5cbiAgICAvLyAuLi5hbmQgdGhlbiBmaW5hbGx5IG92ZXJyaWRlIHdpdGggdXNlciBkZWZhdWx0c1xuICAgIE9iamVjdC5hc3NpZ24oIG11bHRpU2xpZGVyLCBNdWx0aVNsaWRlci5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBtdWx0aVNsaWRlci5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIG11bHRpU2xpZGVyLmluaXQoKVxuICAgIFxuICAgIGlmKCBwcm9wcy52YWx1ZSA9PT0gdW5kZWZpbmVkICYmIG11bHRpU2xpZGVyLmNvdW50ICE9PSA0ICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBtdWx0aVNsaWRlci5jb3VudDsgaSsrICkge1xuICAgICAgICBtdWx0aVNsaWRlci5fX3ZhbHVlWyBpIF0gPSBpIC8gbXVsdGlTbGlkZXIuY291bnRcbiAgICAgIH1cbiAgICB9ZWxzZSBpZiggdHlwZW9mIHByb3BzLnZhbHVlID09PSAnbnVtYmVyJyApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbXVsdGlTbGlkZXIuY291bnQ7IGkrKyApIG11bHRpU2xpZGVyLl9fdmFsdWVbIGkgXSA9IHByb3BzLnZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIG11bHRpU2xpZGVyXG4gIH0sXG4gIFxuXG4gIC8qKlxuICAgKiBEcmF3IHRoZSBNdWx0aVNsaWRlciBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIE11bHRpU2xpZGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLDAsIHRoaXMucmVjdC53aWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG5cbiAgICAvLyBkcmF3IGZpbGwgKG11bHRpU2xpZGVyIHZhbHVlIHJlcHJlc2VudGF0aW9uKVxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgbGV0IHNsaWRlcldpZHRoID0gdGhpcy5zdHlsZSA9PT0gJ3ZlcnRpY2FsJyA/IHRoaXMucmVjdC53aWR0aCAvIHRoaXMuY291bnQgOiB0aGlzLnJlY3QuaGVpZ2h0IC8gdGhpcy5jb3VudFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvdW50OyBpKysgKSB7XG4gICAgICBcbiAgICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgICAgIGxldCB5cG9zID0gTWF0aC5mbG9vciggaSAqIHNsaWRlcldpZHRoIClcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIDAsIHlwb3MsIHRoaXMucmVjdC53aWR0aCAqIHRoaXMuX192YWx1ZVsgaSBdLCBNYXRoLmNlaWwoIHNsaWRlcldpZHRoICkgKVxuICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCAwLCB5cG9zLCB0aGlzLnJlY3Qud2lkdGgsIHNsaWRlcldpZHRoIClcbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgeHBvcyA9IE1hdGguZmxvb3IoIGkgKiBzbGlkZXJXaWR0aCApXG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCB4cG9zLCB0aGlzLnJlY3QuaGVpZ2h0IC0gdGhpcy5fX3ZhbHVlWyBpIF0gKiB0aGlzLnJlY3QuaGVpZ2h0LCBNYXRoLmNlaWwoc2xpZGVyV2lkdGgpLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlWyBpIF0gKVxuICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KCB4cG9zLCAwLCBzbGlkZXJXaWR0aCwgdGhpcy5yZWN0LmhlaWdodCApXG4gICAgICB9XG4gICAgfVxuXG4gICBcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSAvLyBjaGFuZ2UgbXVsdGlTbGlkZXIgdmFsdWUgb24gY2xpY2sgLyB0b3VjaGRvd25cblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgICB9XG4gICAgfSxcblxuICAgIHBvaW50ZXJtb3ZlKCBlICkge1xuICAgICAgaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlIClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuICBcbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIHZhbHVlIGJldHdlZW4gMC0xIGdpdmVuIHRoZSBjdXJyZW50IHBvaW50ZXIgcG9zaXRpb24gaW4gcmVsYXRpb25cbiAgICogdG8gdGhlIE11bHRpU2xpZGVyJ3MgcG9zaXRpb24sIGFuZCB0cmlnZ2VycyBvdXRwdXQuXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgTXVsdGlTbGlkZXJcbiAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGUgLSBUaGUgcG9pbnRlciBldmVudCB0byBiZSBwcm9jZXNzZWQuXG4gICAqL1xuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCBwcmV2VmFsdWUgPSB0aGlzLnZhbHVlLFxuICAgICAgICBzbGlkZXJOdW1cblxuICAgIGlmKCB0aGlzLnN0eWxlID09PSAnaG9yaXpvbnRhbCcgKSB7XG4gICAgICBzbGlkZXJOdW0gPSBNYXRoLmZsb29yKCAoIGUuY2xpZW50WSAvIHRoaXMucmVjdC5oZWlnaHQgKSAvICggMS90aGlzLmNvdW50ICkgKVxuICAgICAgdGhpcy5fX3ZhbHVlWyBzbGlkZXJOdW0gXSA9ICggZS5jbGllbnRYIC0gdGhpcy5yZWN0LmxlZnQgKSAvIHRoaXMucmVjdC53aWR0aFxuICAgIH1lbHNle1xuICAgICAgc2xpZGVyTnVtID0gTWF0aC5mbG9vciggKCBlLmNsaWVudFggLyB0aGlzLnJlY3Qud2lkdGggKSAvICggMS90aGlzLmNvdW50ICkgKVxuICAgICAgdGhpcy5fX3ZhbHVlWyBzbGlkZXJOdW0gXSA9IDEgLSAoIGUuY2xpZW50WSAtIHRoaXMucmVjdC50b3AgICkgLyB0aGlzLnJlY3QuaGVpZ2h0IFxuICAgIH1cblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICApIHtcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWVbIGkgXSA+IDEgKSB0aGlzLl9fdmFsdWVbIGkgXSA9IDFcbiAgICAgIGlmKCB0aGlzLl9fdmFsdWVbIGkgXSA8IDAgKSB0aGlzLl9fdmFsdWVbIGkgXSA9IDBcbiAgICB9XG5cbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMub3V0cHV0KClcbiAgICBcbiAgICBpZiggc2hvdWxkRHJhdyApIHRoaXMuZHJhdygpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gTXVsdGlTbGlkZXJcbiIsImxldCBQYW5lbCA9IHtcbiAgZGVmYXVsdHM6IHtcbiAgICBmdWxsc2NyZWVuOmZhbHNlLFxuICAgIGJhY2tncm91bmQ6JyMzMzMnXG4gIH0sXG4gIFxuICAvLyBjbGFzcyB2YXJpYWJsZSBmb3IgcmVmZXJlbmNlIHRvIGFsbCBwYW5lbHNcbiAgcGFuZWxzOltdLFxuXG4gIGNyZWF0ZSggcHJvcHMgPSBudWxsICkge1xuICAgIGxldCBwYW5lbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGRlZmF1bHQ6IGZ1bGwgd2luZG93IGludGVyZmFjZVxuICAgIGlmKCBwcm9wcyA9PT0gbnVsbCApIHtcbiAgICAgICAgXG4gICAgICBPYmplY3QuYXNzaWduKCBwYW5lbCwgUGFuZWwuZGVmYXVsdHMsIHtcbiAgICAgICAgeDowLFxuICAgICAgICB5OjAsXG4gICAgICAgIHdpZHRoOjEsXG4gICAgICAgIGhlaWdodDoxLFxuICAgICAgICBfX3g6IDAsXG4gICAgICAgIF9feTogMCxcbiAgICAgICAgX193aWR0aDogbnVsbCxcbiAgICAgICAgX19oZWlnaHQ6bnVsbCxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9KVxuICAgICAgXG4gICAgICBwYW5lbC5kaXYgPSBwYW5lbC5fX2NyZWF0ZUhUTUxFbGVtZW50KClcbiAgICAgIHBhbmVsLmxheW91dCgpXG5cbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ2JvZHknIClcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoIHBhbmVsLmRpdiApXG4gICAgfVxuICAgIFxuICAgIFBhbmVsLnBhbmVscy5wdXNoKCBwYW5lbCApXG5cbiAgICByZXR1cm4gcGFuZWxcbiAgfSxcbiAgXG4gIF9fY3JlYXRlSFRNTEVsZW1lbnQoKSB7XG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnIClcbiAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgID0gJ2Jsb2NrJ1xuICAgIGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJhY2tncm91bmRcbiAgICBcbiAgICByZXR1cm4gZGl2XG4gIH0sXG5cbiAgbGF5b3V0KCkge1xuICAgIGlmKCB0aGlzLmZ1bGxzY3JlZW4gKSB7XG4gICAgICB0aGlzLl9fd2lkdGggID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgIHRoaXMuX19oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgIHRoaXMuX194ICAgICAgPSB0aGlzLnggKiB0aGlzLl9fd2lkdGhcbiAgICAgIHRoaXMuX195ICAgICAgPSB0aGlzLnkgKiB0aGlzLl9faGVpZ2h0XG5cbiAgICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoICA9IHRoaXMuX193aWR0aCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLmhlaWdodCA9IHRoaXMuX19oZWlnaHQgKyAncHgnXG4gICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ICAgPSB0aGlzLl9feCArICdweCdcbiAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCAgICA9IHRoaXMuX195ICsgJ3B4J1xuICAgIH1cbiAgfSxcblxuICBnZXRXaWR0aCgpICB7IHJldHVybiB0aGlzLl9fd2lkdGggIH0sXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuX19oZWlnaHQgfSxcblxuICBhZGQoIC4uLndpZGdldHMgKSB7XG4gICAgZm9yKCBsZXQgd2lkZ2V0IG9mIHdpZGdldHMgKSB7XG5cbiAgICAgIC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB3aWRnZXQgaGFzIG5vdCBiZWVuIGFscmVhZHkgYWRkZWRcbiAgICAgIGlmKCB0aGlzLmNoaWxkcmVuLmluZGV4T2YoIHdpZGdldCApID09PSAtMSApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB3aWRnZXQuX19hZGRUb1BhbmVsID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKCB3aWRnZXQuZWxlbWVudCApXG4gICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKCB3aWRnZXQgKVxuXG4gICAgICAgICAgd2lkZ2V0Ll9fYWRkVG9QYW5lbCggdGhpcyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRocm93IEVycm9yKCAnV2lkZ2V0IGNhbm5vdCBiZSBhZGRlZCB0byBwYW5lbDsgaXQgZG9lcyBub3QgY29udGFpbiB0aGUgbWV0aG9kIC5fX2FkZFRvUGFuZWwnIClcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRocm93IEVycm9yKCAnV2lkZ2V0IGlzIGFscmVhZHkgYWRkZWQgdG8gcGFuZWwuJyApXG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IFBhbmVsIFxuIiwiaW1wb3J0IENhbnZhc1dpZGdldCBmcm9tICcuL2NhbnZhc1dpZGdldC5qcydcblxuLyoqXG4gKiBBIGhvcml6b250YWwgb3IgdmVydGljYWwgZmFkZXIuIFxuICogQG1vZHVsZSBTbGlkZXJcbiAqIEBhdWdtZW50cyBDYW52YXNXaWRnZXRcbiAqLyBcblxubGV0IFNsaWRlciA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBTbGlkZXIsIHtcbiAgLyoqIEBsZW5kcyBTbGlkZXIucHJvdG90eXBlICovXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCBTbGlkZXIgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIGRlZmF1bHRzOiB7XG4gICAgX192YWx1ZTouNSwgLy8gYWx3YXlzIDAtMSwgbm90IGZvciBlbmQtdXNlcnNcbiAgICB2YWx1ZTouNSwgICAvLyBlbmQtdXNlciB2YWx1ZSB0aGF0IG1heSBiZSBmaWx0ZXJlZFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgLyoqXG4gICAgICogVGhlIHN0eWxlIHByb3BlcnR5IGNhbiBiZSBlaXRoZXIgJ2hvcml6b250YWwnICh0aGUgZGVmYXVsdCkgb3IgJ3ZlcnRpY2FsJy4gVGhpc1xuICAgICAqIGRldGVybWluZXMgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBTbGlkZXIgaW5zdGFuY2UuXG4gICAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgc3R5bGU6ICAnaG9yaXpvbnRhbCdcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFNsaWRlciBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAY29uc3RydWN0c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzXSAtIEEgZGljdGlvbmFyeSBvZiBwcm9wZXJ0aWVzIHRvIGluaXRpYWxpemUgU2xpZGVyIHdpdGguXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgbGV0IHNsaWRlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggU2xpZGVyIGRlZmF1bHRzXG4gICAgQ2FudmFzV2lkZ2V0LmNyZWF0ZS5jYWxsKCBzbGlkZXIgKVxuXG4gICAgLy8gLi4uYW5kIHRoZW4gZmluYWxseSBvdmVycmlkZSB3aXRoIHVzZXIgZGVmYXVsdHNcbiAgICBPYmplY3QuYXNzaWduKCBzbGlkZXIsIFNsaWRlci5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICBpZiggcHJvcHMudmFsdWUgKSBzbGlkZXIuX192YWx1ZSA9IHByb3BzLnZhbHVlXG4gICAgXG4gICAgLy8gaW5oZXJpdHMgZnJvbSBXaWRnZXRcbiAgICBzbGlkZXIuaW5pdCgpXG5cbiAgICByZXR1cm4gc2xpZGVyXG4gIH0sXG5cbiAgLyoqXG4gICAqIERyYXcgdGhlIFNsaWRlciBvbnRvIGl0cyBjYW52YXMgY29udGV4dCB1c2luZyB0aGUgY3VycmVudCAuX192YWx1ZSBwcm9wZXJ0eS5cbiAgICogQG1lbWJlcm9mIFNsaWRlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlICAgPSB0aGlzLmJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICB0aGlzLmN0eC5maWxsUmVjdCggMCwwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsIChzbGlkZXIgdmFsdWUgcmVwcmVzZW50YXRpb24pXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnIClcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCAwLCB0aGlzLnJlY3Qud2lkdGggKiB0aGlzLl9fdmFsdWUsIHRoaXMucmVjdC5oZWlnaHQgKVxuICAgIGVsc2VcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCB0aGlzLnJlY3QuaGVpZ2h0IC0gdGhpcy5fX3ZhbHVlICogdGhpcy5yZWN0LmhlaWdodCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0ICogdGhpcy5fX3ZhbHVlIClcblxuICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoIDAsMCwgdGhpcy5yZWN0LndpZHRoLCB0aGlzLnJlY3QuaGVpZ2h0IClcbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgfSxcblxuICBldmVudHM6IHtcbiAgICBwb2ludGVyZG93biggZSApIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICAgICAgdGhpcy5wb2ludGVySWQgPSBlLnBvaW50ZXJJZFxuXG4gICAgICB0aGlzLnByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSAvLyBjaGFuZ2Ugc2xpZGVyIHZhbHVlIG9uIGNsaWNrIC8gdG91Y2hkb3duXG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgLy8gb25seSBsaXN0ZW4gZm9yIHVwIGFuZCBtb3ZlIGV2ZW50cyBhZnRlciBwb2ludGVyZG93biBcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgIH0sXG5cbiAgICBwb2ludGVydXAoIGUgKSB7XG4gICAgICBpZiggdGhpcy5hY3RpdmUgJiYgZS5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkICkge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCB0aGlzLnBvaW50ZXJtb3ZlICkgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgICB0aGlzLnBvaW50ZXJ1cCApIFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBwb2ludGVybW92ZSggZSApIHtcbiAgICAgIGlmKCB0aGlzLmFjdGl2ZSAmJiBlLnBvaW50ZXJJZCA9PT0gdGhpcy5wb2ludGVySWQgKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSB2YWx1ZSBiZXR3ZWVuIDAtMSBnaXZlbiB0aGUgY3VycmVudCBwb2ludGVyIHBvc2l0aW9uIGluIHJlbGF0aW9uXG4gICAqIHRvIHRoZSBTbGlkZXIncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBTbGlkZXJcbiAgICogQHBhcmFtIHtQb2ludGVyRXZlbnR9IGUgLSBUaGUgcG9pbnRlciBldmVudCB0byBiZSBwcm9jZXNzZWQuXG4gICAqL1xuICBwcm9jZXNzUG9pbnRlclBvc2l0aW9uKCBlICkge1xuICAgIGxldCBwcmV2VmFsdWUgPSB0aGlzLnZhbHVlXG5cbiAgICBpZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgICAgdGhpcy5fX3ZhbHVlID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5yZWN0LndpZHRoXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9fdmFsdWUgPSAxIC0gKCBlLmNsaWVudFkgLSB0aGlzLnJlY3QudG9wICApIC8gdGhpcy5yZWN0LmhlaWdodCBcbiAgICB9XG5cbiAgICAvLyBjbGFtcCBfX3ZhbHVlLCB3aGljaCBpcyBvbmx5IHVzZWQgaW50ZXJuYWxseVxuICAgIGlmKCB0aGlzLl9fdmFsdWUgPiAxICkgdGhpcy5fX3ZhbHVlID0gMVxuICAgIGlmKCB0aGlzLl9fdmFsdWUgPCAwICkgdGhpcy5fX3ZhbHVlID0gMFxuXG4gICAgbGV0IHNob3VsZERyYXcgPSB0aGlzLm91dHB1dCgpXG4gICAgXG4gICAgaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsaWRlclxuIiwibGV0IFV0aWxpdGllcyA9IHtcblxuICBnZXRNb2RlKCkge1xuICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyAndG91Y2gnIDogJ21vdXNlJ1xuICB9LFxuICBcbiAgY29tcGFyZUFycmF5cyggYTEsIGEyICkge1xuICAgIHJldHVybiBhMS5sZW5ndGggPT09IGEyLmxlbmd0aCAmJiBhMS5ldmVyeSgodixpKT0+IHYgPT09IGEyW2ldKVxuICB9LFxuXG5cbiAgLy8gcG9ydGVkL2FkYXB0ZWQgZnJvbSBvcmlnbmFsIEludGVyZmFjZS5qcyBCdXR0b25WIGNvZGUgYnkgSm9uYXRoYW4gU2ltb3phclxuICBwb2x5SGl0VGVzdCggZSwgYm91bmRzLCByZWN0ICkge1xuICAgIGNvbnN0IHcgPSByZWN0LndpZHRoLFxuICAgICAgICAgIGggPSByZWN0LmhlaWdodCxcbiAgICAgICAgICBwID0gYm91bmRzXG5cbiAgICBsZXQgc2lkZXMgPSAwLFxuICAgICAgICBoaXQgPSBmYWxzZVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBwLmxlbmd0aCAtIDE7IGkrKyApIHtcbiAgICAgIGlmKCBwWyBpKzEgXS54ID4gcFsgaSBdLnggKSB7XG4gICAgICAgIGlmKCAoIHBbIGkgXS54ICA8PSBlLnggKSAmJiAoIGUueCA8ICBwW2krMV0ueCApICkge1xuICAgICAgICAgIGxldCB5dmFsID0gKCBwW2krMV0ueSAtIHBbaV0ueSApLyAoIHBbaSsxXS54IC0gcFtpXS54ICkgKiBoL3cgKiAoIGUueCAtIHBbaV0ueCApICsgcFtpXS55XG5cbiAgICAgICAgICBpZiggeXZhbCAtIGUueSA8IDAgKSBzaWRlcysrXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiggcFtpKzFdLnggPCBwW2ldLnggKSB7XG4gICAgICAgIGlmKCAoIHBbaV0ueCA+PSBlLnggKSAmJiAoIGUueCA+IHBbaSsxXS54ICkgKSB7XG4gICAgICAgICAgbGV0IHl2YWwgPSAoIHBbaSsxXS55IC0gcFtpXS55KSAvICggcFtpKzFdLnggLSBwW2ldLngpICogaC93ICogKCBlLnggLSBwW2ldLnggKSArIHBbaV0ueVxuXG4gICAgICAgICAgaWYoIHl2YWwgLSBlLnkgPCAwICkgc2lkZXMrK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHNpZGVzICUgMiA9PT0gMSApIGhpdCA9IHRydWVcbiBcbiAgICByZXR1cm4gaGl0XG4gIH0sXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVXRpbGl0aWVzXG4iLCJpbXBvcnQgRmlsdGVycyBmcm9tICcuL2ZpbHRlcnMnXG5pbXBvcnQgQ29tbXVuaWNhdGlvbiBmcm9tICcuL2NvbW11bmljYXRpb24uanMnXG5pbXBvcnQgVXRpbGl0aWVzIGZyb20gJy4vdXRpbGl0aWVzJ1xuXG4vKipcbiAqIFdpZGdldCBpcyB0aGUgYmFzZSBjbGFzcyB0aGF0IGFsbCBvdGhlciBVSSBlbGVtZW50cyBpbmhlcml0cyBmcm9tLiBJdCBwcmltYXJpbHlcbiAqIGluY2x1ZGVzIG1ldGhvZHMgZm9yIGZpbHRlcmluZyAvIHNjYWxpbmcgb3V0cHV0LlxuICogQG1vZHVsZSBXaWRnZXRcbiAqL1xuXG5cbmxldCBXaWRnZXQgPSB7XG4gIC8qKiBAbGVuZHMgV2lkZ2V0LnByb3RvdHlwZSAqL1xuICBcbiAgLyoqXG4gICAqIHN0b3JlIGFsbCBpbnN0YW50aWF0ZWQgd2lkZ2V0cy5cbiAgICogQHR5cGUge0FycmF5LjxXaWRnZXQ+fVxuICAgKiBAc3RhdGljXG4gICAqLyAgXG4gIHdpZGdldHM6IFtdLFxuICBsYXN0VmFsdWU6IG51bGwsXG4gIG9udmFsdWVjaGFuZ2U6IG51bGwsXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGRlZmF1bHQgcHJvcGVydHkgc2V0dGluZ3MgZm9yIGFsbCB3aWRnZXRzXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBtaW46MCwgbWF4OjEsXG4gICAgc2NhbGVPdXRwdXQ6dHJ1ZSwgLy8gYXBwbHkgc2NhbGUgZmlsdGVyIGJ5IGRlZmF1bHQgZm9yIG1pbiAvIG1heCByYW5nZXNcbiAgICB0YXJnZXQ6bnVsbCxcbiAgICBfX3ByZXZWYWx1ZTpudWxsXG4gIH0sXG4gIFxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFdpZGdldCBpbnN0YW5jZVxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGNyZWF0ZSgpIHtcbiAgICBPYmplY3QuYXNzaWduKCB0aGlzLCBXaWRnZXQuZGVmYXVsdHMgKVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBTdG9yZXMgZmlsdGVycyBmb3IgdHJhbnNmb3JtaW5nIHdpZGdldCBvdXRwdXQuXG4gICAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZmlsdGVycyA9IFtdXG5cbiAgICB0aGlzLl9fcHJlZmlsdGVycyA9IFtdXG4gICAgdGhpcy5fX3Bvc3RmaWx0ZXJzID0gW11cblxuICAgIFdpZGdldC53aWRnZXRzLnB1c2goIHRoaXMgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICAvKipcbiAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIGZvciB3aWRnZXRzLiBDaGVja3MgdG8gc2VlIGlmIHdpZGdldCBjb250YWluc1xuICAgKiBhICd0YXJnZXQnIHByb3BlcnR5OyBpZiBzbywgbWFrZXMgc3VyZSB0aGF0IGNvbW11bmljYXRpb24gd2l0aCB0aGF0XG4gICAqIHRhcmdldCBpcyBpbml0aWFsaXplZC5cbiAgICogQG1lbWJlcm9mIFdpZGdldFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG5cbiAgaW5pdCgpIHtcbiAgICBpZiggdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQgPT09ICdvc2MnIHx8IHRoaXMudGFyZ2V0ID09PSAnbWlkaScgKSB7XG4gICAgICBpZiggIUNvbW11bmljYXRpb24uaW5pdGlhbGl6ZWQgKSBDb21tdW5pY2F0aW9uLmluaXQoKVxuICAgIH1cblxuICAgIC8vIGlmIG1pbi9tYXggYXJlIG5vdCAwLTEgYW5kIHNjYWxpbmcgaXMgbm90IGRpc2FibGVkXG4gICAgaWYoIHRoaXMuc2NhbGVPdXRwdXQgJiYgKHRoaXMubWluICE9PSAwIHx8IHRoaXMubWF4ICE9PSAxICkpIHsgICAgICBcbiAgICAgIHRoaXMuX19wcmVmaWx0ZXJzLnB1c2goIFxuICAgICAgICBGaWx0ZXJzLlNjYWxlKCAwLDEsdGhpcy5taW4sdGhpcy5tYXggKSBcbiAgICAgIClcbiAgICB9XG4gIH0sXG5cbiAgcnVuRmlsdGVycyggdmFsdWUsIHdpZGdldCApIHtcbiAgICBmb3IoIGxldCBmaWx0ZXIgb2Ygd2lkZ2V0Ll9fcHJlZmlsdGVycyApICB2YWx1ZSA9IGZpbHRlciggdmFsdWUgKVxuICAgIGZvciggbGV0IGZpbHRlciBvZiB3aWRnZXQuZmlsdGVycyApICAgICAgIHZhbHVlID0gZmlsdGVyKCB2YWx1ZSApXG4gICAgZm9yKCBsZXQgZmlsdGVyIG9mIHdpZGdldC5fX3Bvc3RmaWx0ZXJzICkgdmFsdWUgPSBmaWx0ZXIoIHZhbHVlIClcbiAgIFxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIG91dHB1dCBvZiB3aWRnZXQgYnkgcnVubmluZyAuX192YWx1ZSBwcm9wZXJ0eSB0aHJvdWdoIGZpbHRlciBjaGFpbi5cbiAgICogVGhlIHJlc3VsdCBpcyBzdG9yZWQgaW4gdGhlIC52YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgd2lkZ2V0LCB3aGljaCBpcyB0aGVuXG4gICAqIHJldHVybmVkLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgb3V0cHV0KCkge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX192YWx1ZSwgbmV3VmFsdWVHZW5lcmF0ZWQgPSBmYWxzZSwgbGFzdFZhbHVlID0gdGhpcy52YWx1ZSwgaXNBcnJheVxuXG4gICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkoIHZhbHVlIClcblxuICAgIGlmKCBpc0FycmF5ICkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoIHYgPT4gV2lkZ2V0LnJ1bkZpbHRlcnMoIHYsIHRoaXMgKSApXG4gICAgfWVsc2V7XG4gICAgICB2YWx1ZSA9IHRoaXMucnVuRmlsdGVycyggdmFsdWUsIHRoaXMgKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICBcbiAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKSB0aGlzLnRyYW5zbWl0KCB0aGlzLnZhbHVlIClcblxuICAgIGlmKCB0aGlzLl9fcHJldlZhbHVlICE9PSBudWxsICkge1xuICAgICAgaWYoIGlzQXJyYXkgKSB7XG4gICAgICAgIGlmKCAhVXRpbGl0aWVzLmNvbXBhcmVBcnJheXMoIHRoaXMuX192YWx1ZSwgdGhpcy5fX3ByZXZWYWx1ZSApICkge1xuICAgICAgICAgIG5ld1ZhbHVlR2VuZXJhdGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIHRoaXMuX192YWx1ZSAhPT0gdGhpcy5fX3ByZXZWYWx1ZSApIHtcbiAgICAgICAgbmV3VmFsdWVHZW5lcmF0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBuZXdWYWx1ZUdlbmVyYXRlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiggbmV3VmFsdWVHZW5lcmF0ZWQgKSB7IFxuICAgICAgaWYoIHRoaXMub252YWx1ZWNoYW5nZSAhPT0gbnVsbCApIHRoaXMub252YWx1ZWNoYW5nZSggdGhpcy52YWx1ZSwgbGFzdFZhbHVlIClcblxuICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuX192YWx1ZSApICkge1xuICAgICAgICB0aGlzLl9fcHJldlZhbHVlID0gdGhpcy5fX3ZhbHVlLnNsaWNlKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19wcmV2VmFsdWUgPSB0aGlzLl9fdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBuZXdWYWx1ZUdlbmVyYXRlZCBjYW4gYmUgdXNlIHRvIGRldGVybWluZSBpZiB3aWRnZXQgc2hvdWxkIGRyYXdcbiAgICByZXR1cm4gbmV3VmFsdWVHZW5lcmF0ZWRcbiAgfSxcblxuICAvKipcbiAgICogSWYgdGhlIHdpZGdldCBoYXMgYSByZW1vdGUgdGFyZ2V0IChub3QgYSB0YXJnZXQgaW5zaWRlIHRoZSBpbnRlcmZhY2Ugd2ViIHBhZ2UpXG4gICAqIHRoaXMgd2lsbCB0cmFuc21pdCB0aGUgd2lkZ2V0cyB2YWx1ZSB0byB0aGUgcmVtb3RlIGRlc3RpbmF0aW9uLlxuICAgKiBAbWVtYmVyb2YgV2lkZ2V0XG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgdHJhbnNtaXQoIG91dHB1dCApIHtcbiAgICBpZiggdGhpcy50YXJnZXQgPT09ICdvc2MnICkge1xuICAgICAgQ29tbXVuaWNhdGlvbi5PU0Muc2VuZCggdGhpcy5hZGRyZXNzLCBvdXRwdXQgKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdGhpcy50YXJnZXRbIHRoaXMua2V5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLnRhcmdldFsgdGhpcy5rZXkgXSA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICB0aGlzLnRhcmdldFsgdGhpcy5rZXkgXSggb3V0cHV0IClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy50YXJnZXRbIHRoaXMua2V5IF0gPSBvdXRwdXQgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxuIiwibGV0IFdpZGdldExhYmVsID0ge1xuXG4gIGRlZmF1bHRzOiB7XG4gICAgc2l6ZToyNCxcbiAgICBmYWNlOidzYW5zLXNlcmlmJyxcbiAgICBmaWxsOid3aGl0ZScsXG4gICAgYWxpZ246J2NlbnRlcicsXG4gICAgYmFja2dyb3VuZDpudWxsLFxuICAgIHdpZHRoOjFcbiAgfSxcblxuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCBsYWJlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggbGFiZWwsIHRoaXMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCB0eXBlb2YgbGFiZWwuY3R4ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvciggJ1dpZGdldExhYmVscyBtdXN0IGJlIGNvbnN0cnVjdGVkIHdpdGggYSBjYW52YXMgY29udGV4dCAoY3R4KSBhcmd1bWVudCcgKVxuICAgIFxuICAgIGxhYmVsLmZvbnQgPSBgJHtsYWJlbC5zaXplfXB4ICR7bGFiZWwuZmFjZX1gXG5cbiAgICByZXR1cm4gbGFiZWxcbiAgfSxcblxuICBkcmF3KCkge1xuICAgIGxldCBjbnZzID0gdGhpcy5jdHguY2FudmFzLFxuICAgICAgICBjd2lkdGggPSBjbnZzLndpZHRoLFxuICAgICAgICBjaGVpZ2h0PSBjbnZzLmhlaWdodCxcbiAgICAgICAgeCAgICAgID0gdGhpcy54ICogY3dpZHRoLFxuICAgICAgICB5ICAgICAgPSB0aGlzLnkgKiBjaGVpZ2h0LFxuICAgICAgICB3aWR0aCAgPSB0aGlzLndpZHRoICogY3dpZHRoXG5cbiAgICBpZiggdGhpcy5iYWNrZ3JvdW5kICE9PSBudWxsICkge1xuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kXG4gICAgICB0aGlzLmN0eC5maWxsUmVjdCggeCx5LHdpZHRoLHRoaXMuc2l6ZSArIDEwIClcbiAgICB9XG4gICAgXG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5maWxsXG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gdGhpcy5hbGlnblxuICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLmZvbnRcbiAgICB0aGlzLmN0eC5maWxsVGV4dCggdGhpcy50ZXh0LCB4LHksd2lkdGggKSAgICBcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFdpZGdldExhYmVsXG4iLCJpbXBvcnQgQ2FudmFzV2lkZ2V0IGZyb20gJy4vY2FudmFzV2lkZ2V0LmpzJ1xuaW1wb3J0IFZlYzIgZnJvbSAndmljdG9yJ1xuXG4vKipcbiAqIEEgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBmYWRlci4gXG4gKiBAbW9kdWxlIFhZXG4gKiBAYXVnbWVudHMgQ2FudmFzV2lkZ2V0XG4gKi8gXG5cbmxldCBYWSA9IE9iamVjdC5jcmVhdGUoIENhbnZhc1dpZGdldCApIFxuXG5PYmplY3QuYXNzaWduKCBYWSwge1xuICAvKiogQGxlbmRzIFhZLnByb3RvdHlwZSAqL1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzIGZvciBhbGwgWFkgaW5zdGFuY2VzLlxuICAgKiBEZWZhdWx0cyBjYW4gYmUgb3ZlcnJpZGRlbiBieSB1c2VyLWRlZmluZWQgcHJvcGVydGllcyBwYXNzZWQgdG9cbiAgICogY29uc3RydXRvci5cbiAgICogQG1lbWJlcm9mIFhZXG4gICAqIEBzdGF0aWNcbiAgICovICBcbiAgZGVmYXVsdHM6IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIFRoZSBjb3VudCBwcm9wZXJ0eSBkZXRlcm1pbmVzIHRoZSBudW1iZXIgb2Ygc2xpZGVycyBpbiB0aGUgbXVsdGlzbGlkZXIsIGRlZmF1bHQgNC5cbiAgICAgKiBAbWVtYmVyb2YgWFlcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAdHlwZSB7SW50ZWdlcn1cbiAgICAgKi9cbiAgICBjb3VudDo0LFxuICAgIGxpbmVXaWR0aDoxLFxuICAgIHVzZVBoeXNpY3M6dHJ1ZSxcbiAgICB0b3VjaFNpemU6NTAsXG4gICAgZmlsbDoncmdiYSggMjU1LDI1NSwyNTUsIC4yICknLFxuICAgIHN0cm9rZTonIzk5OScsXG4gICAgYmFja2dyb3VuZDonIzAwMCcsXG4gICAgZnJpY3Rpb246LjAsXG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBYWSBpbnN0YW5jZS5cbiAgICogQG1lbWJlcm9mIFhZXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHNdIC0gQSBkaWN0aW9uYXJ5IG9mIHByb3BlcnRpZXMgdG8gaW5pdGlhbGl6ZSBYWSB3aXRoLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGUoIHByb3BzICkge1xuICAgIGxldCB4eSA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuICAgIFxuICAgIC8vIGFwcGx5IFdpZGdldCBkZWZhdWx0cywgdGhlbiBvdmVyd3JpdGUgKGlmIGFwcGxpY2FibGUpIHdpdGggWFkgZGVmYXVsdHNcbiAgICBDYW52YXNXaWRnZXQuY3JlYXRlLmNhbGwoIHh5IClcblxuICAgIC8vIC4uLmFuZCB0aGVuIGZpbmFsbHkgb3ZlcnJpZGUgd2l0aCB1c2VyIGRlZmF1bHRzXG4gICAgT2JqZWN0LmFzc2lnbiggeHksIFhZLmRlZmF1bHRzLCBwcm9wcywge1xuICAgICAgdmFsdWU6W10sXG4gICAgICBfX3ZhbHVlOltdLFxuICAgICAgdG91Y2hlczpbXSxcbiAgICB9KVxuXG4gICAgLy8gc2V0IHVuZGVybHlpbmcgdmFsdWUgaWYgbmVjZXNzYXJ5Li4uIFRPRE86IGhvdyBzaG91bGQgdGhpcyBiZSBzZXQgZ2l2ZW4gbWluL21heD9cbiAgICAvLyBpZiggcHJvcHMudmFsdWUgKSB4eS5fX3ZhbHVlID0gcHJvcHMudmFsdWVcbiAgICBcbiAgICAvLyBpbmhlcml0cyBmcm9tIFdpZGdldFxuICAgIHh5LmluaXQoKVxuICAgIFxuICAgIHh5Lm9ucGxhY2UgPSAoKSA9PiB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHh5LmNvdW50OyBpKysgKSB7XG4gICAgICAgIHh5LnRvdWNoZXMucHVzaCh7XG4gICAgICAgICAgcG9zOiBuZXcgVmVjMiggaSAqICggeHkucmVjdC53aWR0aCAvIHh5LmNvdW50ICksIGkgKiAoIHh5LnJlY3QuaGVpZ2h0IC8geHkuY291bnQgKSApLFxuICAgICAgICAgIHZlbDogbmV3IFZlYzIoIDAsMCApLFxuICAgICAgICAgIGFjYzogbmV3IFZlYzIoIC4wNSwuMDUgKSxcbiAgICAgICAgICBuYW1lOiB4eS5uYW1lcyA9PT0gdW5kZWZpbmVkID8gaSA6IHh5Lm5hbWVzWyBpIF1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYoIHh5LnVzZVBoeXNpY3MgPT09IHRydWUgKVxuICAgICAgICB4eS5zdGFydEFuaW1hdGlvbkxvb3AoKVxuICAgIH1cblxuICAgIHJldHVybiB4eVxuICB9LFxuXG4gIHN0YXJ0QW5pbWF0aW9uTG9vcCgpIHtcbiAgICB0aGlzLmRyYXcoIHRydWUgKVxuXG4gICAgbGV0IGxvb3AgPSAoKT0+IHsgXG4gICAgICB0aGlzLmRyYXcoKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggbG9vcCApXG4gICAgfVxuXG4gICAgbG9vcCgpXG4gIH0sXG5cbiAgYW5pbWF0ZSgpIHtcbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRydWUgXG4gICAgbGV0IF9fZnJpY3Rpb24gPSBuZXcgVmVjMiggLTEgKiB0aGlzLmZyaWN0aW9uLCAtMSAqIHRoaXMuZnJpY3Rpb24gKVxuICAgIGZvciggbGV0IHRvdWNoIG9mIHRoaXMudG91Y2hlcyApIHtcbiAgICAgIGlmKCB0b3VjaC52ZWwueCAhPT0gMCAmJiB0b3VjaC52ZWwueSAhPT0gMCApIHtcbiAgICAgICAgLy90b3VjaC52ZWwuYWRkKCB0b3VjaC5hY2MgKVxuICAgICAgICBsZXQgZnJpY3Rpb24gPSB0b3VjaC52ZWwuY2xvbmUoKVxuICAgICAgICBmcmljdGlvbi54ICo9IC0xICogdGhpcy5mcmljdGlvblxuICAgICAgICBmcmljdGlvbi55ICo9IC0xICogdGhpcy5mcmljdGlvblxuICAgICAgICB0b3VjaC52ZWwuYWRkKCBmcmljdGlvbiApXG5cbiAgICAgICAgaWYoICh0b3VjaC5wb3MueCAtIHRoaXMudG91Y2hTaXplKSArIHRvdWNoLnZlbC54IDwgMCApIHtcbiAgICAgICAgICB0b3VjaC5wb3MueCA9IHRoaXMudG91Y2hTaXplXG4gICAgICAgICAgdG91Y2gudmVsLnggKj0gLTFcbiAgICAgICAgfSBlbHNlIGlmICggdG91Y2gucG9zLnggKyB0aGlzLnRvdWNoU2l6ZSArIHRvdWNoLnZlbC54ID4gdGhpcy5yZWN0LndpZHRoICkge1xuICAgICAgICAgIHRvdWNoLnBvcy54ID0gdGhpcy5yZWN0LndpZHRoIC0gdGhpcy50b3VjaFNpemVcbiAgICAgICAgICB0b3VjaC52ZWwueCAqPSAtMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvdWNoLnBvcy54ICs9IHRvdWNoLnZlbC54IFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICh0b3VjaC5wb3MueSAtIHRoaXMudG91Y2hTaXplKSArIHRvdWNoLnZlbC55IDwgMCApIHsgXG4gICAgICAgICAgdG91Y2gucG9zLnkgPSB0aGlzLnRvdWNoU2l6ZVxuICAgICAgICAgIHRvdWNoLnZlbC55ICo9IC0xXG4gICAgICAgIH0gZWxzZSBpZiAoIHRvdWNoLnBvcy55ICsgdGhpcy50b3VjaFNpemUgKyB0b3VjaC52ZWwueSA+IHRoaXMucmVjdC5oZWlnaHQgKSB7XG4gICAgICAgICAgdG91Y2gucG9zLnkgPSB0aGlzLnJlY3QuaGVpZ2h0IC0gdGhpcy50b3VjaFNpemVcbiAgICAgICAgICB0b3VjaC52ZWwueSAqPSAtMVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0b3VjaC5wb3MueSArPSB0b3VjaC52ZWwueVxuICAgICAgICB9XG5cbiAgICAgICAgc2hvdWxkRHJhdyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2hvdWxkRHJhd1xuICB9LFxuICBcbiAgLyoqXG4gICAqIERyYXcgdGhlIFhZIG9udG8gaXRzIGNhbnZhcyBjb250ZXh0IHVzaW5nIHRoZSBjdXJyZW50IC5fX3ZhbHVlIHByb3BlcnR5LlxuICAgKiBAbWVtYmVyb2YgWFlcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBkcmF3KCBvdmVycmlkZT1mYWxzZSApIHtcbiAgICBsZXQgc2hvdWxkRHJhdyA9IHRoaXMuYW5pbWF0ZSgpXG5cbiAgICBpZiggc2hvdWxkRHJhdyA9PT0gZmFsc2UgJiYgb3ZlcnJpZGUgPT09IGZhbHNlICkgcmV0dXJuXG5cbiAgICAvLyBkcmF3IGJhY2tncm91bmRcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgICA9IHRoaXMuYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KCAwLCAwLCB0aGlzLnJlY3Qud2lkdGgsIHRoaXMucmVjdC5oZWlnaHQgKVxuXG4gICAgLy8gZHJhdyBmaWxsICh4eSB2YWx1ZSByZXByZXNlbnRhdGlvbilcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICkge1xuICAgICAgbGV0IGNoaWxkID0gdGhpcy50b3VjaGVzWyBpIF1cbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFxuXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKVxuXG4gICAgICB0aGlzLmN0eC5hcmMoIGNoaWxkLnBvcy54LCBjaGlsZC5wb3MueSwgdGhpcy50b3VjaFNpemUsIDAsIE1hdGguUEkgKiAyLCB0cnVlIClcblxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKClcblxuICAgICAgdGhpcy5jdHguZmlsbCgpXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKVxuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoIHRoaXMueCArIGNoaWxkLngsIHRoaXMueSArIGNoaWxkLnksIHRoaXMuY2hpbGRXaWR0aCwgdGhpcy5jaGlsZEhlaWdodCk7XG4gICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gJ2NlbnRlcidcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3Ryb2tlXG4gICAgICB0aGlzLmN0eC5mb250ID0gJ25vcm1hbCAyMHB4IEhlbHZldGljYSdcbiAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCBjaGlsZC5uYW1lLCBjaGlsZC5wb3MueCwgY2hpbGQucG9zLnkgKVxuICAgIH1cbiAgfSxcblxuICBhZGRFdmVudHMoKSB7XG4gICAgLy8gY3JlYXRlIGV2ZW50IGhhbmRsZXJzIGJvdW5kIHRvIHRoZSBjdXJyZW50IG9iamVjdCwgb3RoZXJ3aXNlIFxuICAgIC8vIHRoZSAndGhpcycga2V5d29yZCB3aWxsIHJlZmVyIHRvIHRoZSB3aW5kb3cgb2JqZWN0IGluIHRoZSBldmVudCBoYW5kbGVyc1xuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmV2ZW50cyApIHtcbiAgICAgIHRoaXNbIGtleSBdID0gdGhpcy5ldmVudHNbIGtleSBdLmJpbmQoIHRoaXMgKSBcbiAgICB9XG5cbiAgICAvLyBvbmx5IGxpc3RlbiBmb3IgbW91c2Vkb3duIGludGlhbGx5OyBtb3VzZW1vdmUgYW5kIG1vdXNldXAgYXJlIHJlZ2lzdGVyZWQgb24gbW91c2Vkb3duXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICB0aGlzLnBvaW50ZXJkb3duIClcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICB0aGlzLnBvaW50ZXJ1cCApXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSAvLyBvbmx5IGxpc3RlbiBmb3IgdXAgYW5kIG1vdmUgZXZlbnRzIGFmdGVyIHBvaW50ZXJkb3duIFxuICB9LFxuXG4gIGV2ZW50czoge1xuICAgIHBvaW50ZXJkb3duKCBlICkge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgICB0aGlzLnBvaW50ZXJJZCA9IGUucG9pbnRlcklkXG5cbiAgICAgIHRoaXMucHJvY2Vzc1BvaW50ZXJQb3NpdGlvbiggZSApIC8vIGNoYW5nZSB4eSB2YWx1ZSBvbiBjbGljayAvIHRvdWNoZG93blxuXG4gICAgICBcbiAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCAgIHRoaXMucG9pbnRlcnVwICkgXG4gICAgfSxcblxuICAgIHBvaW50ZXJ1cCggZSApIHtcbiAgICAgIC8vaWYoIHRoaXMuYWN0aXZlICYmIGUucG9pbnRlcklkID09PSB0aGlzLnBvaW50ZXJJZCApIHtcbiAgICAgICAgLy90aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIC8vd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdwb2ludGVybW92ZScsIHRoaXMucG9pbnRlcm1vdmUgKSBcbiAgICAgICAgLy93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsICAgdGhpcy5wb2ludGVydXAgKSBcbiAgICAgIC8vfVxuICAgICAgbGV0IHRvdWNoID0gdGhpcy50b3VjaGVzLmZpbmQoIHQgPT4gdC5wb2ludGVySWQgPT09IGUucG9pbnRlcklkIClcblxuICAgICAgaWYoIHRvdWNoICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coICdmb3VuZCcsIHRvdWNoLm5hbWUsIGUucG9pbnRlcklkIClcbiAgICAgICAgdG91Y2gudmVsLnggPSAoIGUuY2xpZW50WCAtIHRvdWNoLmxhc3RYICkgKiAuNVxuICAgICAgICB0b3VjaC52ZWwueSA9ICggZS5jbGllbnRZIC0gdG91Y2gubGFzdFkgKSAqIC41XG4gICAgICAgIC8vY29uc29sZS5sb2coIHRvdWNoLnZlbC54LCBlLmNsaWVudFgsIHRvdWNoLmxhc3RYLCB0b3VjaC5wb3MueCAgKVxuICAgICAgICB0b3VjaC5wb2ludGVySWQgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS5sb2coJ3VuZGVmaW5lZCB0b3VjaCcsIGUucG9pbnRlcklkIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9pbnRlcm1vdmUoIGUgKSB7XG4gICAgICBsZXQgdG91Y2ggPSB0aGlzLnRvdWNoZXMuZmluZCggdCA9PiB0LnBvaW50ZXJJZCA9PT0gZS5wb2ludGVySWQgKVxuXG4gICAgICBpZiggdG91Y2ggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdG91Y2gubGFzdFggPSB0b3VjaC5wb3MueFxuICAgICAgICB0b3VjaC5sYXN0WSA9IHRvdWNoLnBvcy55XG5cbiAgICAgICAgdG91Y2gucG9zLnggPSBlLmNsaWVudFhcbiAgICAgICAgdG91Y2gucG9zLnkgPSBlLmNsaWVudFlcbiAgICAgIH1cblxuICAgIH0sXG4gIH0sXG4gIFxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgdmFsdWUgYmV0d2VlbiAwLTEgZ2l2ZW4gdGhlIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBpbiByZWxhdGlvblxuICAgKiB0byB0aGUgWFkncyBwb3NpdGlvbiwgYW5kIHRyaWdnZXJzIG91dHB1dC5cbiAgICogQGluc3RhbmNlXG4gICAqIEBtZW1iZXJvZiBYWVxuICAgKiBAcGFyYW0ge1BvaW50ZXJFdmVudH0gZSAtIFRoZSBwb2ludGVyIGV2ZW50IHRvIGJlIHByb2Nlc3NlZC5cbiAgICovXG4gIHByb2Nlc3NQb2ludGVyUG9zaXRpb24oIGUgKSB7XG4gICAgbGV0IGNsb3Nlc3REaWZmID0gSW5maW5pdHksXG4gICAgICAgIHRvdWNoRm91bmQgPSBudWxsLFxuICAgICAgICB0b3VjaE51bSA9IG51bGxcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdG91Y2ggPSB0aGlzLnRvdWNoZXNbIGkgXSxcbiAgICAgICAgICB4ZGlmZiA9IE1hdGguYWJzKCB0b3VjaC5wb3MueCAtIGUuY2xpZW50WCApLFxuICAgICAgICAgIHlkaWZmID0gTWF0aC5hYnMoIHRvdWNoLnBvcy55IC0gZS5jbGllbnRZIClcblxuICAgICAgaWYoIHhkaWZmICsgeWRpZmYgPCBjbG9zZXN0RGlmZiApIHtcbiAgICAgICAgY2xvc2VzdERpZmYgPSB4ZGlmZiArIHlkaWZmXG4gICAgICAgIHRvdWNoRm91bmQgPSB0b3VjaFxuICAgICAgICB0b3VjaE51bSA9IGlcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ3RvdWNoIGZvdW5kJywgdG91Y2hOdW0sIGNsb3Nlc3REaWZmLCBlLnBvaW50ZXJJZCApXG4gICAgICB9XG4gICAgfVxuXG4gICAgdG91Y2hGb3VuZC5pc0FjdGl2ZSA9IHRydWVcbiAgICB0b3VjaEZvdW5kLnZlbC54ID0gMFxuICAgIHRvdWNoRm91bmQudmVsLnkgPSAwXG4gICAgdG91Y2hGb3VuZC5wb3MueCA9IHRvdWNoRm91bmQubGFzdFggPSBlLmNsaWVudFhcbiAgICB0b3VjaEZvdW5kLnBvcy55ID0gdG91Y2hGb3VuZC5sYXN0WSA9IGUuY2xpZW50WVxuICAgIHRvdWNoRm91bmQucG9pbnRlcklkID0gZS5wb2ludGVySWRcblxuICAgIC8vdG91Y2hGb3VuZC5pZGVudGlmaWVyID0gX3RvdWNoLmlkZW50aWZpZXJcbiAgICAvL3RvdWNoRm91bmQuY2hpbGRJRCA9IHRvdWNoTnVtXG4gICAgLy9pZiggdGhpcy5zdHlsZSA9PT0gJ2hvcml6b250YWwnICkge1xuICAgIC8vICBzbGlkZXJOdW0gPSBNYXRoLmZsb29yKCAoIGUuY2xpZW50WSAvIHRoaXMucmVjdC5oZWlnaHQgKSAvICggMS90aGlzLmNvdW50ICkgKVxuICAgIC8vICB0aGlzLl9fdmFsdWVbIHNsaWRlck51bSBdID0gKCBlLmNsaWVudFggLSB0aGlzLnJlY3QubGVmdCApIC8gdGhpcy5yZWN0LndpZHRoXG4gICAgLy99ZWxzZXtcbiAgICAvLyAgc2xpZGVyTnVtID0gTWF0aC5mbG9vciggKCBlLmNsaWVudFggLyB0aGlzLnJlY3Qud2lkdGggKSAvICggMS90aGlzLmNvdW50ICkgKVxuICAgIC8vICB0aGlzLl9fdmFsdWVbIHNsaWRlck51bSBdID0gMSAtICggZS5jbGllbnRZIC0gdGhpcy5yZWN0LnRvcCAgKSAvIHRoaXMucmVjdC5oZWlnaHQgXG4gICAgLy99XG5cbiAgICAvL2ZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb3VudDsgaSsrICApIHtcbiAgICAvLyAgaWYoIHRoaXMuX192YWx1ZVsgaSBdID4gMSApIHRoaXMuX192YWx1ZVsgaSBdID0gMVxuICAgIC8vICBpZiggdGhpcy5fX3ZhbHVlWyBpIF0gPCAwICkgdGhpcy5fX3ZhbHVlWyBpIF0gPSAwXG4gICAgLy99XG5cbiAgICAvL2xldCBzaG91bGREcmF3ID0gdGhpcy5vdXRwdXQoKVxuICAgIFxuICAgIC8vaWYoIHNob3VsZERyYXcgKSB0aGlzLmRyYXcoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFhZXG4iLCIvKiFcbiAqIFBFUCB2MC40LjEgfCBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L1BFUFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgfCBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgZ2xvYmFsLlBvaW50ZXJFdmVudHNQb2x5ZmlsbCA9IGZhY3RvcnkoKVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgY29uc3RydWN0b3IgZm9yIG5ldyBQb2ludGVyRXZlbnRzLlxuICAgKlxuICAgKiBOZXcgUG9pbnRlciBFdmVudHMgbXVzdCBiZSBnaXZlbiBhIHR5cGUsIGFuZCBhbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mXG4gICAqIGluaXRpYWxpemF0aW9uIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIER1ZSB0byBjZXJ0YWluIHBsYXRmb3JtIHJlcXVpcmVtZW50cywgZXZlbnRzIHJldHVybmVkIGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gICAqIGlkZW50aWZ5IGFzIE1vdXNlRXZlbnRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IGluVHlwZSBUaGUgdHlwZSBvZiB0aGUgZXZlbnQgdG8gY3JlYXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2luRGljdF0gQW4gb3B0aW9uYWwgZGljdGlvbmFyeSBvZiBpbml0aWFsIGV2ZW50IHByb3BlcnRpZXMuXG4gICAqIEByZXR1cm4ge0V2ZW50fSBBIG5ldyBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgaW5pdGlhbGl6ZWQgd2l0aCBwcm9wZXJ0aWVzIGZyb20gYGluRGljdGAuXG4gICAqL1xuICB2YXIgTU9VU0VfUFJPUFMgPSBbXG4gICAgJ2J1YmJsZXMnLFxuICAgICdjYW5jZWxhYmxlJyxcbiAgICAndmlldycsXG4gICAgJ2RldGFpbCcsXG4gICAgJ3NjcmVlblgnLFxuICAgICdzY3JlZW5ZJyxcbiAgICAnY2xpZW50WCcsXG4gICAgJ2NsaWVudFknLFxuICAgICdjdHJsS2V5JyxcbiAgICAnYWx0S2V5JyxcbiAgICAnc2hpZnRLZXknLFxuICAgICdtZXRhS2V5JyxcbiAgICAnYnV0dG9uJyxcbiAgICAncmVsYXRlZFRhcmdldCcsXG4gICAgJ3BhZ2VYJyxcbiAgICAncGFnZVknXG4gIF07XG5cbiAgdmFyIE1PVVNFX0RFRkFVTFRTID0gW1xuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIDAsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDBcbiAgXTtcblxuICBmdW5jdGlvbiBQb2ludGVyRXZlbnQoaW5UeXBlLCBpbkRpY3QpIHtcbiAgICBpbkRpY3QgPSBpbkRpY3QgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZS5pbml0RXZlbnQoaW5UeXBlLCBpbkRpY3QuYnViYmxlcyB8fCBmYWxzZSwgaW5EaWN0LmNhbmNlbGFibGUgfHwgZmFsc2UpO1xuXG4gICAgLy8gZGVmaW5lIGluaGVyaXRlZCBNb3VzZUV2ZW50IHByb3BlcnRpZXNcbiAgICAvLyBza2lwIGJ1YmJsZXMgYW5kIGNhbmNlbGFibGUgc2luY2UgdGhleSdyZSBzZXQgYWJvdmUgaW4gaW5pdEV2ZW50KClcbiAgICBmb3IgKHZhciBpID0gMiwgcDsgaSA8IE1PVVNFX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwID0gTU9VU0VfUFJPUFNbaV07XG4gICAgICBlW3BdID0gaW5EaWN0W3BdIHx8IE1PVVNFX0RFRkFVTFRTW2ldO1xuICAgIH1cbiAgICBlLmJ1dHRvbnMgPSBpbkRpY3QuYnV0dG9ucyB8fCAwO1xuXG4gICAgLy8gU3BlYyByZXF1aXJlcyB0aGF0IHBvaW50ZXJzIHdpdGhvdXQgcHJlc3N1cmUgc3BlY2lmaWVkIHVzZSAwLjUgZm9yIGRvd25cbiAgICAvLyBzdGF0ZSBhbmQgMCBmb3IgdXAgc3RhdGUuXG4gICAgdmFyIHByZXNzdXJlID0gMDtcbiAgICBpZiAoaW5EaWN0LnByZXNzdXJlKSB7XG4gICAgICBwcmVzc3VyZSA9IGluRGljdC5wcmVzc3VyZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJlc3N1cmUgPSBlLmJ1dHRvbnMgPyAwLjUgOiAwO1xuICAgIH1cblxuICAgIC8vIGFkZCB4L3kgcHJvcGVydGllcyBhbGlhc2VkIHRvIGNsaWVudFgvWVxuICAgIGUueCA9IGUuY2xpZW50WDtcbiAgICBlLnkgPSBlLmNsaWVudFk7XG5cbiAgICAvLyBkZWZpbmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIFBvaW50ZXJFdmVudCBpbnRlcmZhY2VcbiAgICBlLnBvaW50ZXJJZCA9IGluRGljdC5wb2ludGVySWQgfHwgMDtcbiAgICBlLndpZHRoID0gaW5EaWN0LndpZHRoIHx8IDA7XG4gICAgZS5oZWlnaHQgPSBpbkRpY3QuaGVpZ2h0IHx8IDA7XG4gICAgZS5wcmVzc3VyZSA9IHByZXNzdXJlO1xuICAgIGUudGlsdFggPSBpbkRpY3QudGlsdFggfHwgMDtcbiAgICBlLnRpbHRZID0gaW5EaWN0LnRpbHRZIHx8IDA7XG4gICAgZS5wb2ludGVyVHlwZSA9IGluRGljdC5wb2ludGVyVHlwZSB8fCAnJztcbiAgICBlLmh3VGltZXN0YW1wID0gaW5EaWN0Lmh3VGltZXN0YW1wIHx8IDA7XG4gICAgZS5pc1ByaW1hcnkgPSBpbkRpY3QuaXNQcmltYXJ5IHx8IGZhbHNlO1xuICAgIHJldHVybiBlO1xuICB9XG5cbiAgdmFyIF9Qb2ludGVyRXZlbnQgPSBQb2ludGVyRXZlbnQ7XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIGltcGxlbWVudHMgYSBtYXAgb2YgcG9pbnRlciBzdGF0ZXNcbiAgICovXG4gIHZhciBVU0VfTUFQID0gd2luZG93Lk1hcCAmJiB3aW5kb3cuTWFwLnByb3RvdHlwZS5mb3JFYWNoO1xuICB2YXIgUG9pbnRlck1hcCA9IFVTRV9NQVAgPyBNYXAgOiBTcGFyc2VBcnJheU1hcDtcblxuICBmdW5jdGlvbiBTcGFyc2VBcnJheU1hcCgpIHtcbiAgICB0aGlzLmFycmF5ID0gW107XG4gICAgdGhpcy5zaXplID0gMDtcbiAgfVxuXG4gIFNwYXJzZUFycmF5TWFwLnByb3RvdHlwZSA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKGspO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmhhcyhrKSkge1xuICAgICAgICB0aGlzLnNpemUrKztcbiAgICAgIH1cbiAgICAgIHRoaXMuYXJyYXlba10gPSB2O1xuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheVtrXSAhPT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrKSB7XG4gICAgICBpZiAodGhpcy5oYXMoaykpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuYXJyYXlba107XG4gICAgICAgIHRoaXMuc2l6ZS0tO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdGhpcy5hcnJheVtrXTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYXJyYXkubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgfSxcblxuICAgIC8vIHJldHVybiB2YWx1ZSwga2V5LCBtYXBcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIHRoaXMuYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdiwgaywgdGhpcyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wb2ludGVybWFwID0gUG9pbnRlck1hcDtcblxuICB2YXIgQ0xPTkVfUFJPUFMgPSBbXG5cbiAgICAvLyBNb3VzZUV2ZW50XG4gICAgJ2J1YmJsZXMnLFxuICAgICdjYW5jZWxhYmxlJyxcbiAgICAndmlldycsXG4gICAgJ2RldGFpbCcsXG4gICAgJ3NjcmVlblgnLFxuICAgICdzY3JlZW5ZJyxcbiAgICAnY2xpZW50WCcsXG4gICAgJ2NsaWVudFknLFxuICAgICdjdHJsS2V5JyxcbiAgICAnYWx0S2V5JyxcbiAgICAnc2hpZnRLZXknLFxuICAgICdtZXRhS2V5JyxcbiAgICAnYnV0dG9uJyxcbiAgICAncmVsYXRlZFRhcmdldCcsXG5cbiAgICAvLyBET00gTGV2ZWwgM1xuICAgICdidXR0b25zJyxcblxuICAgIC8vIFBvaW50ZXJFdmVudFxuICAgICdwb2ludGVySWQnLFxuICAgICd3aWR0aCcsXG4gICAgJ2hlaWdodCcsXG4gICAgJ3ByZXNzdXJlJyxcbiAgICAndGlsdFgnLFxuICAgICd0aWx0WScsXG4gICAgJ3BvaW50ZXJUeXBlJyxcbiAgICAnaHdUaW1lc3RhbXAnLFxuICAgICdpc1ByaW1hcnknLFxuXG4gICAgLy8gZXZlbnQgaW5zdGFuY2VcbiAgICAndHlwZScsXG4gICAgJ3RhcmdldCcsXG4gICAgJ2N1cnJlbnRUYXJnZXQnLFxuICAgICd3aGljaCcsXG4gICAgJ3BhZ2VYJyxcbiAgICAncGFnZVknLFxuICAgICd0aW1lU3RhbXAnXG4gIF07XG5cbiAgdmFyIENMT05FX0RFRkFVTFRTID0gW1xuXG4gICAgLy8gTW91c2VFdmVudFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIGZhbHNlLFxuICAgIDAsXG4gICAgbnVsbCxcblxuICAgIC8vIERPTSBMZXZlbCAzXG4gICAgMCxcblxuICAgIC8vIFBvaW50ZXJFdmVudFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgICcnLFxuICAgIDAsXG4gICAgZmFsc2UsXG5cbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICcnLFxuICAgIG51bGwsXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwXG4gIF07XG5cbiAgdmFyIEJPVU5EQVJZX0VWRU5UUyA9IHtcbiAgICAncG9pbnRlcm92ZXInOiAxLFxuICAgICdwb2ludGVyb3V0JzogMSxcbiAgICAncG9pbnRlcmVudGVyJzogMSxcbiAgICAncG9pbnRlcmxlYXZlJzogMVxuICB9O1xuXG4gIHZhciBIQVNfU1ZHX0lOU1RBTkNFID0gKHR5cGVvZiBTVkdFbGVtZW50SW5zdGFuY2UgIT09ICd1bmRlZmluZWQnKTtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgaXMgZm9yIG5vcm1hbGl6aW5nIGV2ZW50cy4gTW91c2UgYW5kIFRvdWNoIGV2ZW50cyB3aWxsIGJlXG4gICAqIGNvbGxlY3RlZCBoZXJlLCBhbmQgZmlyZSBQb2ludGVyRXZlbnRzIHRoYXQgaGF2ZSB0aGUgc2FtZSBzZW1hbnRpY3MsIG5vXG4gICAqIG1hdHRlciB0aGUgc291cmNlLlxuICAgKiBFdmVudHMgZmlyZWQ6XG4gICAqICAgLSBwb2ludGVyZG93bjogYSBwb2ludGluZyBpcyBhZGRlZFxuICAgKiAgIC0gcG9pbnRlcnVwOiBhIHBvaW50ZXIgaXMgcmVtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm1vdmU6IGEgcG9pbnRlciBpcyBtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm92ZXI6IGEgcG9pbnRlciBjcm9zc2VzIGludG8gYW4gZWxlbWVudFxuICAgKiAgIC0gcG9pbnRlcm91dDogYSBwb2ludGVyIGxlYXZlcyBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyY2FuY2VsOiBhIHBvaW50ZXIgd2lsbCBubyBsb25nZXIgZ2VuZXJhdGUgZXZlbnRzXG4gICAqL1xuICB2YXIgZGlzcGF0Y2hlciA9IHtcbiAgICBwb2ludGVybWFwOiBuZXcgX3BvaW50ZXJtYXAoKSxcbiAgICBldmVudE1hcDogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICBjYXB0dXJlSW5mbzogT2JqZWN0LmNyZWF0ZShudWxsKSxcblxuICAgIC8vIFNjb3BlIG9iamVjdHMgZm9yIG5hdGl2ZSBldmVudHMuXG4gICAgLy8gVGhpcyBleGlzdHMgZm9yIGVhc2Ugb2YgdGVzdGluZy5cbiAgICBldmVudFNvdXJjZXM6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgZXZlbnRTb3VyY2VMaXN0OiBbXSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgZXZlbnQgc291cmNlIHRoYXQgd2lsbCBnZW5lcmF0ZSBwb2ludGVyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIGBpblNvdXJjZWAgbXVzdCBjb250YWluIGFuIGFycmF5IG9mIGV2ZW50IG5hbWVzIG5hbWVkIGBldmVudHNgLCBhbmRcbiAgICAgKiBmdW5jdGlvbnMgd2l0aCB0aGUgbmFtZXMgc3BlY2lmaWVkIGluIHRoZSBgZXZlbnRzYCBhcnJheS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIG5hbWUgZm9yIHRoZSBldmVudCBzb3VyY2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIEEgbmV3IHNvdXJjZSBvZiBwbGF0Zm9ybSBldmVudHMuXG4gICAgICovXG4gICAgcmVnaXN0ZXJTb3VyY2U6IGZ1bmN0aW9uKG5hbWUsIHNvdXJjZSkge1xuICAgICAgdmFyIHMgPSBzb3VyY2U7XG4gICAgICB2YXIgbmV3RXZlbnRzID0gcy5ldmVudHM7XG4gICAgICBpZiAobmV3RXZlbnRzKSB7XG4gICAgICAgIG5ld0V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoc1tlXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hcFtlXSA9IHNbZV0uYmluZChzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlc1tuYW1lXSA9IHM7XG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VMaXN0LnB1c2gocyk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGwgPSB0aGlzLmV2ZW50U291cmNlTGlzdC5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMCwgZXM7IChpIDwgbCkgJiYgKGVzID0gdGhpcy5ldmVudFNvdXJjZUxpc3RbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBjYWxsIGV2ZW50c291cmNlIHJlZ2lzdGVyXG4gICAgICAgIGVzLnJlZ2lzdGVyLmNhbGwoZXMsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGwgPSB0aGlzLmV2ZW50U291cmNlTGlzdC5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMCwgZXM7IChpIDwgbCkgJiYgKGVzID0gdGhpcy5ldmVudFNvdXJjZUxpc3RbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBjYWxsIGV2ZW50c291cmNlIHJlZ2lzdGVyXG4gICAgICAgIGVzLnVucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb250YWluczogLypzY29wZS5leHRlcm5hbC5jb250YWlucyB8fCAqL2Z1bmN0aW9uKGNvbnRhaW5lciwgY29udGFpbmVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGNvbnRhaW5lZCk7XG4gICAgICB9IGNhdGNoIChleCkge1xuXG4gICAgICAgIC8vIG1vc3QgbGlrZWx5OiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDg0MjdcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBFVkVOVFNcbiAgICBkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJkb3duJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3BvaW50ZXJtb3ZlJywgaW5FdmVudCk7XG4gICAgfSxcbiAgICB1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVydXAnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGVudGVyOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyZW50ZXInLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIGxlYXZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpbkV2ZW50LmJ1YmJsZXMgPSBmYWxzZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVybGVhdmUnLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcm92ZXInLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC5idWJibGVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KCdwb2ludGVyb3V0JywgaW5FdmVudCk7XG4gICAgfSxcbiAgICBjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuYnViYmxlcyA9IHRydWU7XG4gICAgICB0aGlzLmZpcmVFdmVudCgncG9pbnRlcmNhbmNlbCcsIGluRXZlbnQpO1xuICAgIH0sXG4gICAgbGVhdmVPdXQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB0aGlzLm91dChldmVudCk7XG4gICAgICBpZiAoIXRoaXMuY29udGFpbnMoZXZlbnQudGFyZ2V0LCBldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmxlYXZlKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVudGVyT3ZlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHRoaXMub3ZlcihldmVudCk7XG4gICAgICBpZiAoIXRoaXMuY29udGFpbnMoZXZlbnQudGFyZ2V0LCBldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgICB0aGlzLmVudGVyKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElTVEVORVIgTE9HSUNcbiAgICBldmVudEhhbmRsZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcblxuICAgICAgLy8gVGhpcyBpcyB1c2VkIHRvIHByZXZlbnQgbXVsdGlwbGUgZGlzcGF0Y2ggb2YgcG9pbnRlcmV2ZW50cyBmcm9tXG4gICAgICAvLyBwbGF0Zm9ybSBldmVudHMuIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHR3byBlbGVtZW50cyBpbiBkaWZmZXJlbnQgc2NvcGVzXG4gICAgICAvLyBhcmUgc2V0IHVwIHRvIGNyZWF0ZSBwb2ludGVyIGV2ZW50cywgd2hpY2ggaXMgcmVsZXZhbnQgdG8gU2hhZG93IERPTS5cbiAgICAgIGlmIChpbkV2ZW50Ll9oYW5kbGVkQnlQRSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IGluRXZlbnQudHlwZTtcbiAgICAgIHZhciBmbiA9IHRoaXMuZXZlbnRNYXAgJiYgdGhpcy5ldmVudE1hcFt0eXBlXTtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBmbihpbkV2ZW50KTtcbiAgICAgIH1cbiAgICAgIGluRXZlbnQuX2hhbmRsZWRCeVBFID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gc2V0IHVwIGV2ZW50IGxpc3RlbmVyc1xuICAgIGxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudHMpIHtcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5hZGRFdmVudCh0YXJnZXQsIGUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcbiAgICB1bmxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudHMpIHtcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudCh0YXJnZXQsIGUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSxcbiAgICBhZGRFdmVudDogLypzY29wZS5leHRlcm5hbC5hZGRFdmVudCB8fCAqL2Z1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuYm91bmRIYW5kbGVyKTtcbiAgICB9LFxuICAgIHJlbW92ZUV2ZW50OiAvKnNjb3BlLmV4dGVybmFsLnJlbW92ZUV2ZW50IHx8ICovZnVuY3Rpb24odGFyZ2V0LCBldmVudE5hbWUpIHtcbiAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5ib3VuZEhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvLyBFVkVOVCBDUkVBVElPTiBBTkQgVFJBQ0tJTkdcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEV2ZW50IG9mIHR5cGUgYGluVHlwZWAsIGJhc2VkIG9uIHRoZSBpbmZvcm1hdGlvbiBpblxuICAgICAqIGBpbkV2ZW50YC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpblR5cGUgQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0eXBlIG9mIGV2ZW50IHRvIGNyZWF0ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGluRXZlbnQgQSBwbGF0Zm9ybSBldmVudCB3aXRoIGEgdGFyZ2V0XG4gICAgICogQHJldHVybiB7RXZlbnR9IEEgUG9pbnRlckV2ZW50IG9mIHR5cGUgYGluVHlwZWBcbiAgICAgKi9cbiAgICBtYWtlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5FdmVudCkge1xuXG4gICAgICAvLyByZWxhdGVkVGFyZ2V0IG11c3QgYmUgbnVsbCBpZiBwb2ludGVyIGlzIGNhcHR1cmVkXG4gICAgICBpZiAodGhpcy5jYXB0dXJlSW5mb1tpbkV2ZW50LnBvaW50ZXJJZF0pIHtcbiAgICAgICAgaW5FdmVudC5yZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBlID0gbmV3IF9Qb2ludGVyRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIGlmIChpbkV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQgPSBpbkV2ZW50LnByZXZlbnREZWZhdWx0O1xuICAgICAgfVxuICAgICAgZS5fdGFyZ2V0ID0gZS5fdGFyZ2V0IHx8IGluRXZlbnQudGFyZ2V0O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8vIG1ha2UgYW5kIGRpc3BhdGNoIGFuIGV2ZW50IGluIG9uZSBjYWxsXG4gICAgZmlyZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5tYWtlRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc25hcHNob3Qgb2YgaW5FdmVudCwgd2l0aCB3cml0YWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBbiBldmVudCB0aGF0IGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gY29weS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIHNoYWxsb3cgY29waWVzIG9mIGBpbkV2ZW50YCdzXG4gICAgICogICAgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICBjbG9uZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnRDb3B5ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHZhciBwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBDTE9ORV9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwID0gQ0xPTkVfUFJPUFNbaV07XG4gICAgICAgIGV2ZW50Q29weVtwXSA9IGluRXZlbnRbcF0gfHwgQ0xPTkVfREVGQVVMVFNbaV07XG5cbiAgICAgICAgLy8gV29yayBhcm91bmQgU1ZHSW5zdGFuY2VFbGVtZW50IHNoYWRvdyB0cmVlXG4gICAgICAgIC8vIFJldHVybiB0aGUgPHVzZT4gZWxlbWVudCB0aGF0IGlzIHJlcHJlc2VudGVkIGJ5IHRoZSBpbnN0YW5jZSBmb3IgU2FmYXJpLCBDaHJvbWUsIElFLlxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBiZWhhdmlvciBpbXBsZW1lbnRlZCBieSBGaXJlZm94LlxuICAgICAgICBpZiAoSEFTX1NWR19JTlNUQU5DRSAmJiAocCA9PT0gJ3RhcmdldCcgfHwgcCA9PT0gJ3JlbGF0ZWRUYXJnZXQnKSkge1xuICAgICAgICAgIGlmIChldmVudENvcHlbcF0gaW5zdGFuY2VvZiBTVkdFbGVtZW50SW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGV2ZW50Q29weVtwXSA9IGV2ZW50Q29weVtwXS5jb3JyZXNwb25kaW5nVXNlRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8ga2VlcCB0aGUgc2VtYW50aWNzIG9mIHByZXZlbnREZWZhdWx0XG4gICAgICBpZiAoaW5FdmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudENvcHkucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRDb3B5O1xuICAgIH0sXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IHRoaXMuY2FwdHVyZUluZm9baW5FdmVudC5wb2ludGVySWRdO1xuICAgICAgaWYgKCFjYXB0dXJlKSB7XG4gICAgICAgIHJldHVybiBpbkV2ZW50Ll90YXJnZXQ7XG4gICAgICB9XG4gICAgICBpZiAoaW5FdmVudC5fdGFyZ2V0ID09PSBjYXB0dXJlIHx8ICEoaW5FdmVudC50eXBlIGluIEJPVU5EQVJZX0VWRU5UUykpIHtcbiAgICAgICAgcmV0dXJuIGNhcHR1cmU7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRDYXB0dXJlOiBmdW5jdGlvbihpblBvaW50ZXJJZCwgaW5UYXJnZXQpIHtcbiAgICAgIGlmICh0aGlzLmNhcHR1cmVJbmZvW2luUG9pbnRlcklkXSkge1xuICAgICAgICB0aGlzLnJlbGVhc2VDYXB0dXJlKGluUG9pbnRlcklkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdID0gaW5UYXJnZXQ7XG4gICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZS5pbml0RXZlbnQoJ2dvdHBvaW50ZXJjYXB0dXJlJywgdHJ1ZSwgZmFsc2UpO1xuICAgICAgZS5wb2ludGVySWQgPSBpblBvaW50ZXJJZDtcbiAgICAgIHRoaXMuaW1wbGljaXRSZWxlYXNlID0gdGhpcy5yZWxlYXNlQ2FwdHVyZS5iaW5kKHRoaXMsIGluUG9pbnRlcklkKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJjYW5jZWwnLCB0aGlzLmltcGxpY2l0UmVsZWFzZSk7XG4gICAgICBlLl90YXJnZXQgPSBpblRhcmdldDtcbiAgICAgIHRoaXMuYXN5bmNEaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgcmVsZWFzZUNhcHR1cmU6IGZ1bmN0aW9uKGluUG9pbnRlcklkKSB7XG4gICAgICB2YXIgdCA9IHRoaXMuY2FwdHVyZUluZm9baW5Qb2ludGVySWRdO1xuICAgICAgaWYgKHQpIHtcbiAgICAgICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZS5pbml0RXZlbnQoJ2xvc3Rwb2ludGVyY2FwdHVyZScsIHRydWUsIGZhbHNlKTtcbiAgICAgICAgZS5wb2ludGVySWQgPSBpblBvaW50ZXJJZDtcbiAgICAgICAgdGhpcy5jYXB0dXJlSW5mb1tpblBvaW50ZXJJZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmNhbmNlbCcsIHRoaXMuaW1wbGljaXRSZWxlYXNlKTtcbiAgICAgICAgZS5fdGFyZ2V0ID0gdDtcbiAgICAgICAgdGhpcy5hc3luY0Rpc3BhdGNoRXZlbnQoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEaXNwYXRjaGVzIHRoZSBldmVudCB0byBpdHMgdGFyZ2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBUaGUgZXZlbnQgdG8gYmUgZGlzcGF0Y2hlZC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIGFuIGV2ZW50IGhhbmRsZXIgcmV0dXJucyB0cnVlLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgZGlzcGF0Y2hFdmVudDogLypzY29wZS5leHRlcm5hbC5kaXNwYXRjaEV2ZW50IHx8ICovZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHQgPSB0aGlzLmdldFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGlmICh0KSB7XG4gICAgICAgIHJldHVybiB0LmRpc3BhdGNoRXZlbnQoaW5FdmVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhc3luY0Rpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRpc3BhdGNoRXZlbnQuYmluZCh0aGlzLCBpbkV2ZW50KSk7XG4gICAgfVxuICB9O1xuICBkaXNwYXRjaGVyLmJvdW5kSGFuZGxlciA9IGRpc3BhdGNoZXIuZXZlbnRIYW5kbGVyLmJpbmQoZGlzcGF0Y2hlcik7XG5cbiAgdmFyIF9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICB2YXIgdGFyZ2V0aW5nID0ge1xuICAgIHNoYWRvdzogZnVuY3Rpb24oaW5FbCkge1xuICAgICAgaWYgKGluRWwpIHtcbiAgICAgICAgcmV0dXJuIGluRWwuc2hhZG93Um9vdCB8fCBpbkVsLndlYmtpdFNoYWRvd1Jvb3Q7XG4gICAgICB9XG4gICAgfSxcbiAgICBjYW5UYXJnZXQ6IGZ1bmN0aW9uKHNoYWRvdykge1xuICAgICAgcmV0dXJuIHNoYWRvdyAmJiBCb29sZWFuKHNoYWRvdy5lbGVtZW50RnJvbVBvaW50KTtcbiAgICB9LFxuICAgIHRhcmdldGluZ1NoYWRvdzogZnVuY3Rpb24oaW5FbCkge1xuICAgICAgdmFyIHMgPSB0aGlzLnNoYWRvdyhpbkVsKTtcbiAgICAgIGlmICh0aGlzLmNhblRhcmdldChzKSkge1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cbiAgICB9LFxuICAgIG9sZGVyU2hhZG93OiBmdW5jdGlvbihzaGFkb3cpIHtcbiAgICAgIHZhciBvcyA9IHNoYWRvdy5vbGRlclNoYWRvd1Jvb3Q7XG4gICAgICBpZiAoIW9zKSB7XG4gICAgICAgIHZhciBzZSA9IHNoYWRvdy5xdWVyeVNlbGVjdG9yKCdzaGFkb3cnKTtcbiAgICAgICAgaWYgKHNlKSB7XG4gICAgICAgICAgb3MgPSBzZS5vbGRlclNoYWRvd1Jvb3Q7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvcztcbiAgICB9LFxuICAgIGFsbFNoYWRvd3M6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciBzaGFkb3dzID0gW107XG4gICAgICB2YXIgcyA9IHRoaXMuc2hhZG93KGVsZW1lbnQpO1xuICAgICAgd2hpbGUgKHMpIHtcbiAgICAgICAgc2hhZG93cy5wdXNoKHMpO1xuICAgICAgICBzID0gdGhpcy5vbGRlclNoYWRvdyhzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzaGFkb3dzO1xuICAgIH0sXG4gICAgc2VhcmNoUm9vdDogZnVuY3Rpb24oaW5Sb290LCB4LCB5KSB7XG4gICAgICBpZiAoaW5Sb290KSB7XG4gICAgICAgIHZhciB0ID0gaW5Sb290LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgIHZhciBzdCwgc3I7XG5cbiAgICAgICAgLy8gaXMgZWxlbWVudCBhIHNoYWRvdyBob3N0P1xuICAgICAgICBzciA9IHRoaXMudGFyZ2V0aW5nU2hhZG93KHQpO1xuICAgICAgICB3aGlsZSAoc3IpIHtcblxuICAgICAgICAgIC8vIGZpbmQgdGhlIHRoZSBlbGVtZW50IGluc2lkZSB0aGUgc2hhZG93IHJvb3RcbiAgICAgICAgICBzdCA9IHNyLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgICAgaWYgKCFzdCkge1xuXG4gICAgICAgICAgICAvLyBjaGVjayBmb3Igb2xkZXIgc2hhZG93c1xuICAgICAgICAgICAgc3IgPSB0aGlzLm9sZGVyU2hhZG93KHNyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBzaGFkb3dlZCBlbGVtZW50IG1heSBjb250YWluIGEgc2hhZG93IHJvb3RcbiAgICAgICAgICAgIHZhciBzc3IgPSB0aGlzLnRhcmdldGluZ1NoYWRvdyhzdCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hSb290KHNzciwgeCwgeSkgfHwgc3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbGlnaHQgZG9tIGVsZW1lbnQgaXMgdGhlIHRhcmdldFxuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG93bmVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgcyA9IGVsZW1lbnQ7XG5cbiAgICAgIC8vIHdhbGsgdXAgdW50aWwgeW91IGhpdCB0aGUgc2hhZG93IHJvb3Qgb3IgZG9jdW1lbnRcbiAgICAgIHdoaWxlIChzLnBhcmVudE5vZGUpIHtcbiAgICAgICAgcyA9IHMucGFyZW50Tm9kZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhlIG93bmVyIGVsZW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBEb2N1bWVudCBvciBTaGFkb3dSb290XG4gICAgICBpZiAocy5ub2RlVHlwZSAhPT0gTm9kZS5ET0NVTUVOVF9OT0RFICYmIHMubm9kZVR5cGUgIT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xuICAgICAgICBzID0gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9LFxuICAgIGZpbmRUYXJnZXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB4ID0gaW5FdmVudC5jbGllbnRYO1xuICAgICAgdmFyIHkgPSBpbkV2ZW50LmNsaWVudFk7XG5cbiAgICAgIC8vIGlmIHRoZSBsaXN0ZW5lciBpcyBpbiB0aGUgc2hhZG93IHJvb3QsIGl0IGlzIG11Y2ggZmFzdGVyIHRvIHN0YXJ0IHRoZXJlXG4gICAgICB2YXIgcyA9IHRoaXMub3duZXIoaW5FdmVudC50YXJnZXQpO1xuXG4gICAgICAvLyBpZiB4LCB5IGlzIG5vdCBpbiB0aGlzIHJvb3QsIGZhbGwgYmFjayB0byBkb2N1bWVudCBzZWFyY2hcbiAgICAgIGlmICghcy5lbGVtZW50RnJvbVBvaW50KHgsIHkpKSB7XG4gICAgICAgIHMgPSBkb2N1bWVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnNlYXJjaFJvb3QocywgeCwgeSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIG1vZHVsZSB1c2VzIE11dGF0aW9uIE9ic2VydmVycyB0byBkeW5hbWljYWxseSBhZGp1c3Qgd2hpY2ggbm9kZXMgd2lsbFxuICAgKiBnZW5lcmF0ZSBQb2ludGVyIEV2ZW50cy5cbiAgICpcbiAgICogQWxsIG5vZGVzIHRoYXQgd2lzaCB0byBnZW5lcmF0ZSBQb2ludGVyIEV2ZW50cyBtdXN0IGhhdmUgdGhlIGF0dHJpYnV0ZVxuICAgKiBgdG91Y2gtYWN0aW9uYCBzZXQgdG8gYG5vbmVgLlxuICAgKi9cbiAgdmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpO1xuICB2YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLm1hcCk7XG4gIHZhciB0b0FycmF5ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwuYmluZChBcnJheS5wcm90b3R5cGUuc2xpY2UpO1xuICB2YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLmZpbHRlcik7XG4gIHZhciBNTyA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICB2YXIgU0VMRUNUT1IgPSAnW3RvdWNoLWFjdGlvbl0nO1xuICB2YXIgT0JTRVJWRVJfSU5JVCA9IHtcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogWyd0b3VjaC1hY3Rpb24nXVxuICB9O1xuXG4gIGZ1bmN0aW9uIEluc3RhbGxlcihhZGQsIHJlbW92ZSwgY2hhbmdlZCwgYmluZGVyKSB7XG4gICAgdGhpcy5hZGRDYWxsYmFjayA9IGFkZC5iaW5kKGJpbmRlcik7XG4gICAgdGhpcy5yZW1vdmVDYWxsYmFjayA9IHJlbW92ZS5iaW5kKGJpbmRlcik7XG4gICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2sgPSBjaGFuZ2VkLmJpbmQoYmluZGVyKTtcbiAgICBpZiAoTU8pIHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTU8odGhpcy5tdXRhdGlvbldhdGNoZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgSW5zdGFsbGVyLnByb3RvdHlwZSA9IHtcbiAgICB3YXRjaFN1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuXG4gICAgICAvLyBPbmx5IHdhdGNoIHNjb3BlcyB0aGF0IGNhbiB0YXJnZXQgZmluZCwgYXMgdGhlc2UgYXJlIHRvcC1sZXZlbC5cbiAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW4gc2VlIGR1cGxpY2F0ZSBhZGRpdGlvbnMgYW5kIHJlbW92YWxzIHRoYXQgYWRkIG5vaXNlLlxuICAgICAgLy9cbiAgICAgIC8vIFRPRE8oZGZyZWVkbWFuKTogRm9yIHNvbWUgaW5zdGFuY2VzIHdpdGggU2hhZG93RE9NUG9seWZpbGwsIHdlIGNhbiBzZWVcbiAgICAgIC8vIGEgcmVtb3ZhbCB3aXRob3V0IGFuIGluc2VydGlvbiB3aGVuIGEgbm9kZSBpcyByZWRpc3RyaWJ1dGVkIGFtb25nXG4gICAgICAvLyBzaGFkb3dzLiBTaW5jZSBpdCBhbGwgZW5kcyB1cCBjb3JyZWN0IGluIHRoZSBkb2N1bWVudCwgd2F0Y2hpbmcgb25seVxuICAgICAgLy8gdGhlIGRvY3VtZW50IHdpbGwgeWllbGQgdGhlIGNvcnJlY3QgbXV0YXRpb25zIHRvIHdhdGNoLlxuICAgICAgaWYgKHRoaXMub2JzZXJ2ZXIgJiYgdGFyZ2V0aW5nLmNhblRhcmdldCh0YXJnZXQpKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIE9CU0VSVkVSX0lOSVQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5hYmxlT25TdWJ0cmVlOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRoaXMud2F0Y2hTdWJ0cmVlKHRhcmdldCk7XG4gICAgICBpZiAodGFyZ2V0ID09PSBkb2N1bWVudCAmJiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgIHRoaXMuaW5zdGFsbE9uTG9hZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsTmV3U3VidHJlZSh0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW5zdGFsbE5ld1N1YnRyZWU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZm9yRWFjaCh0aGlzLmZpbmRFbGVtZW50cyh0YXJnZXQpLCB0aGlzLmFkZEVsZW1lbnQsIHRoaXMpO1xuICAgIH0sXG4gICAgZmluZEVsZW1lbnRzOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoU0VMRUNUT1IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0sXG4gICAgcmVtb3ZlRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ2FsbGJhY2soZWwpO1xuICAgIH0sXG4gICAgYWRkRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHRoaXMuYWRkQ2FsbGJhY2soZWwpO1xuICAgIH0sXG4gICAgZWxlbWVudENoYW5nZWQ6IGZ1bmN0aW9uKGVsLCBvbGRWYWx1ZSkge1xuICAgICAgdGhpcy5jaGFuZ2VkQ2FsbGJhY2soZWwsIG9sZFZhbHVlKTtcbiAgICB9LFxuICAgIGNvbmNhdExpc3RzOiBmdW5jdGlvbihhY2N1bSwgbGlzdCkge1xuICAgICAgcmV0dXJuIGFjY3VtLmNvbmNhdCh0b0FycmF5KGxpc3QpKTtcbiAgICB9LFxuXG4gICAgLy8gcmVnaXN0ZXIgYWxsIHRvdWNoLWFjdGlvbiA9IG5vbmUgbm9kZXMgb24gZG9jdW1lbnQgbG9hZFxuICAgIGluc3RhbGxPbkxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHRoaXMuaW5zdGFsbE5ld1N1YnRyZWUoZG9jdW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgaXNFbGVtZW50OiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gbi5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7XG4gICAgfSxcbiAgICBmbGF0dGVuTXV0YXRpb25UcmVlOiBmdW5jdGlvbihpbk5vZGVzKSB7XG5cbiAgICAgIC8vIGZpbmQgY2hpbGRyZW4gd2l0aCB0b3VjaC1hY3Rpb25cbiAgICAgIHZhciB0cmVlID0gbWFwKGluTm9kZXMsIHRoaXMuZmluZEVsZW1lbnRzLCB0aGlzKTtcblxuICAgICAgLy8gbWFrZSBzdXJlIHRoZSBhZGRlZCBub2RlcyBhcmUgYWNjb3VudGVkIGZvclxuICAgICAgdHJlZS5wdXNoKGZpbHRlcihpbk5vZGVzLCB0aGlzLmlzRWxlbWVudCkpO1xuXG4gICAgICAvLyBmbGF0dGVuIHRoZSBsaXN0XG4gICAgICByZXR1cm4gdHJlZS5yZWR1Y2UodGhpcy5jb25jYXRMaXN0cywgW10pO1xuICAgIH0sXG4gICAgbXV0YXRpb25XYXRjaGVyOiBmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgIG11dGF0aW9ucy5mb3JFYWNoKHRoaXMubXV0YXRpb25IYW5kbGVyLCB0aGlzKTtcbiAgICB9LFxuICAgIG11dGF0aW9uSGFuZGxlcjogZnVuY3Rpb24obSkge1xuICAgICAgaWYgKG0udHlwZSA9PT0gJ2NoaWxkTGlzdCcpIHtcbiAgICAgICAgdmFyIGFkZGVkID0gdGhpcy5mbGF0dGVuTXV0YXRpb25UcmVlKG0uYWRkZWROb2Rlcyk7XG4gICAgICAgIGFkZGVkLmZvckVhY2godGhpcy5hZGRFbGVtZW50LCB0aGlzKTtcbiAgICAgICAgdmFyIHJlbW92ZWQgPSB0aGlzLmZsYXR0ZW5NdXRhdGlvblRyZWUobS5yZW1vdmVkTm9kZXMpO1xuICAgICAgICByZW1vdmVkLmZvckVhY2godGhpcy5yZW1vdmVFbGVtZW50LCB0aGlzKTtcbiAgICAgIH0gZWxzZSBpZiAobS50eXBlID09PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Q2hhbmdlZChtLnRhcmdldCwgbS5vbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbnN0YWxsZXIgPSBJbnN0YWxsZXI7XG5cbiAgZnVuY3Rpb24gc2hhZG93U2VsZWN0b3Iodikge1xuICAgIHJldHVybiAnYm9keSAvc2hhZG93LWRlZXAvICcgKyBzZWxlY3Rvcih2KTtcbiAgfVxuICBmdW5jdGlvbiBzZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdbdG91Y2gtYWN0aW9uPVwiJyArIHYgKyAnXCJdJztcbiAgfVxuICBmdW5jdGlvbiBydWxlKHYpIHtcbiAgICByZXR1cm4gJ3sgLW1zLXRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb246ICcgKyB2ICsgJzsgdG91Y2gtYWN0aW9uLWRlbGF5OiBub25lOyB9JztcbiAgfVxuICB2YXIgYXR0cmliMmNzcyA9IFtcbiAgICAnbm9uZScsXG4gICAgJ2F1dG8nLFxuICAgICdwYW4teCcsXG4gICAgJ3Bhbi15JyxcbiAgICB7XG4gICAgICBydWxlOiAncGFuLXggcGFuLXknLFxuICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICdwYW4teCBwYW4teScsXG4gICAgICAgICdwYW4teSBwYW4teCdcbiAgICAgIF1cbiAgICB9XG4gIF07XG4gIHZhciBzdHlsZXMgPSAnJztcblxuICAvLyBvbmx5IGluc3RhbGwgc3R5bGVzaGVldCBpZiB0aGUgYnJvd3NlciBoYXMgdG91Y2ggYWN0aW9uIHN1cHBvcnRcbiAgdmFyIGhhc05hdGl2ZVBFID0gd2luZG93LlBvaW50ZXJFdmVudCB8fCB3aW5kb3cuTVNQb2ludGVyRXZlbnQ7XG5cbiAgLy8gb25seSBhZGQgc2hhZG93IHNlbGVjdG9ycyBpZiBzaGFkb3dkb20gaXMgc3VwcG9ydGVkXG4gIHZhciBoYXNTaGFkb3dSb290ID0gIXdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbCAmJiBkb2N1bWVudC5oZWFkLmNyZWF0ZVNoYWRvd1Jvb3Q7XG5cbiAgZnVuY3Rpb24gYXBwbHlBdHRyaWJ1dGVTdHlsZXMoKSB7XG4gICAgaWYgKGhhc05hdGl2ZVBFKSB7XG4gICAgICBhdHRyaWIyY3NzLmZvckVhY2goZnVuY3Rpb24ocikge1xuICAgICAgICBpZiAoU3RyaW5nKHIpID09PSByKSB7XG4gICAgICAgICAgc3R5bGVzICs9IHNlbGVjdG9yKHIpICsgcnVsZShyKSArICdcXG4nO1xuICAgICAgICAgIGlmIChoYXNTaGFkb3dSb290KSB7XG4gICAgICAgICAgICBzdHlsZXMgKz0gc2hhZG93U2VsZWN0b3IocikgKyBydWxlKHIpICsgJ1xcbic7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlcyArPSByLnNlbGVjdG9ycy5tYXAoc2VsZWN0b3IpICsgcnVsZShyLnJ1bGUpICsgJ1xcbic7XG4gICAgICAgICAgaWYgKGhhc1NoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIHN0eWxlcyArPSByLnNlbGVjdG9ycy5tYXAoc2hhZG93U2VsZWN0b3IpICsgcnVsZShyLnJ1bGUpICsgJ1xcbic7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIGVsLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChlbCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1vdXNlX19wb2ludGVybWFwID0gX2Rpc3BhdGNoZXIucG9pbnRlcm1hcDtcblxuICAvLyByYWRpdXMgYXJvdW5kIHRvdWNoZW5kIHRoYXQgc3dhbGxvd3MgbW91c2UgZXZlbnRzXG4gIHZhciBERURVUF9ESVNUID0gMjU7XG5cbiAgLy8gbGVmdCwgbWlkZGxlLCByaWdodCwgYmFjaywgZm9yd2FyZFxuICB2YXIgQlVUVE9OX1RPX0JVVFRPTlMgPSBbMSwgNCwgMiwgOCwgMTZdO1xuXG4gIHZhciBIQVNfQlVUVE9OUyA9IGZhbHNlO1xuICB0cnkge1xuICAgIEhBU19CVVRUT05TID0gbmV3IE1vdXNlRXZlbnQoJ3Rlc3QnLCB7IGJ1dHRvbnM6IDEgfSkuYnV0dG9ucyA9PT0gMTtcbiAgfSBjYXRjaCAoZSkge31cblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgbW91c2UgZXZlbnRzXG4gIHZhciBtb3VzZUV2ZW50cyA9IHtcbiAgICBQT0lOVEVSX0lEOiAxLFxuICAgIFBPSU5URVJfVFlQRTogJ21vdXNlJyxcbiAgICBldmVudHM6IFtcbiAgICAgICdtb3VzZWRvd24nLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAnbW91c2VvdmVyJyxcbiAgICAgICdtb3VzZW91dCdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICBsYXN0VG91Y2hlczogW10sXG5cbiAgICAvLyBjb2xsaWRlIHdpdGggdGhlIGdsb2JhbCBtb3VzZSBsaXN0ZW5lclxuICAgIGlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2g6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSB0aGlzLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFg7XG4gICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbHRzLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBsdHNbaV0pOyBpKyspIHtcblxuICAgICAgICAvLyBzaW11bGF0ZWQgbW91c2UgZXZlbnRzIHdpbGwgYmUgc3dhbGxvd2VkIG5lYXIgYSBwcmltYXJ5IHRvdWNoZW5kXG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHggLSB0LngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1QgJiYgZHkgPD0gREVEVVBfRElTVCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcmVwYXJlRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcblxuICAgICAgLy8gZm9yd2FyZCBtb3VzZSBwcmV2ZW50RGVmYXVsdFxuICAgICAgdmFyIHBkID0gZS5wcmV2ZW50RGVmYXVsdDtcbiAgICAgIGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaW5FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBwZCgpO1xuICAgICAgfTtcbiAgICAgIGUucG9pbnRlcklkID0gdGhpcy5QT0lOVEVSX0lEO1xuICAgICAgZS5pc1ByaW1hcnkgPSB0cnVlO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBwcmVwYXJlQnV0dG9uc0Zvck1vdmU6IGZ1bmN0aW9uKGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBwID0gbW91c2VfX3BvaW50ZXJtYXAuZ2V0KHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgICBlLmJ1dHRvbnMgPSBwID8gcC5idXR0b25zIDogMDtcbiAgICAgIGluRXZlbnQuYnV0dG9ucyA9IGUuYnV0dG9ucztcbiAgICB9LFxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgIGUuYnV0dG9ucyA9IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcbiAgICAgICAgICBpZiAocCkgeyBlLmJ1dHRvbnMgfD0gcC5idXR0b25zOyB9XG4gICAgICAgICAgaW5FdmVudC5idXR0b25zID0gZS5idXR0b25zO1xuICAgICAgICB9XG4gICAgICAgIG1vdXNlX19wb2ludGVybWFwLnNldCh0aGlzLlBPSU5URVJfSUQsIGluRXZlbnQpO1xuICAgICAgICBpZiAoIXApIHtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2V1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIHAgPSBtb3VzZV9fcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgIHZhciB1cCA9IEJVVFRPTl9UT19CVVRUT05TW2UuYnV0dG9uXTtcblxuICAgICAgICAgIC8vIFByb2R1Y2VzIHdyb25nIHN0YXRlIG9mIGJ1dHRvbnMgaW4gQnJvd3NlcnMgd2l0aG91dCBgYnV0dG9uc2Agc3VwcG9ydFxuICAgICAgICAgIC8vIHdoZW4gYSBtb3VzZSBidXR0b24gdGhhdCB3YXMgcHJlc3NlZCBvdXRzaWRlIHRoZSBkb2N1bWVudCBpcyByZWxlYXNlZFxuICAgICAgICAgIC8vIGluc2lkZSBhbmQgb3RoZXIgYnV0dG9ucyBhcmUgc3RpbGwgcHJlc3NlZCBkb3duLlxuICAgICAgICAgIGUuYnV0dG9ucyA9IHAgPyBwLmJ1dHRvbnMgJiB+dXAgOiAwO1xuICAgICAgICAgIGluRXZlbnQuYnV0dG9ucyA9IGUuYnV0dG9ucztcbiAgICAgICAgfVxuICAgICAgICBtb3VzZV9fcG9pbnRlcm1hcC5zZXQodGhpcy5QT0lOVEVSX0lELCBpbkV2ZW50KTtcblxuICAgICAgICAvLyBTdXBwb3J0OiBGaXJlZm94IDw9NDQgb25seVxuICAgICAgICAvLyBGRiBVYnVudHUgaW5jbHVkZXMgdGhlIGxpZnRlZCBidXR0b24gaW4gdGhlIGBidXR0b25zYCBwcm9wZXJ0eSBvblxuICAgICAgICAvLyBtb3VzZXVwLlxuICAgICAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjIzMzY2XG4gICAgICAgIGlmIChlLmJ1dHRvbnMgPT09IDAgfHwgZS5idXR0b25zID09PSBCVVRUT05fVE9fQlVUVE9OU1tlLmJ1dHRvbl0pIHtcbiAgICAgICAgICB0aGlzLmNsZWFudXBNb3VzZSgpO1xuICAgICAgICAgIF9kaXNwYXRjaGVyLnVwKGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLm1vdmUoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNlb3ZlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VzZW91dDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2goaW5FdmVudCkpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykgeyB0aGlzLnByZXBhcmVCdXR0b25zRm9yTW92ZShlLCBpbkV2ZW50KTsgfVxuICAgICAgICBfZGlzcGF0Y2hlci5sZWF2ZU91dChlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgIHRoaXMuY2xlYW51cE1vdXNlKCk7XG4gICAgfSxcbiAgICBjbGVhbnVwTW91c2U6IGZ1bmN0aW9uKCkge1xuICAgICAgbW91c2VfX3BvaW50ZXJtYXAuZGVsZXRlKHRoaXMuUE9JTlRFUl9JRCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtb3VzZSA9IG1vdXNlRXZlbnRzO1xuXG4gIHZhciBjYXB0dXJlSW5mbyA9IF9kaXNwYXRjaGVyLmNhcHR1cmVJbmZvO1xuICB2YXIgZmluZFRhcmdldCA9IHRhcmdldGluZy5maW5kVGFyZ2V0LmJpbmQodGFyZ2V0aW5nKTtcbiAgdmFyIGFsbFNoYWRvd3MgPSB0YXJnZXRpbmcuYWxsU2hhZG93cy5iaW5kKHRhcmdldGluZyk7XG4gIHZhciB0b3VjaF9fcG9pbnRlcm1hcCA9IF9kaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG5cbiAgLy8gVGhpcyBzaG91bGQgYmUgbG9uZyBlbm91Z2ggdG8gaWdub3JlIGNvbXBhdCBtb3VzZSBldmVudHMgbWFkZSBieSB0b3VjaFxuICB2YXIgREVEVVBfVElNRU9VVCA9IDI1MDA7XG4gIHZhciBDTElDS19DT1VOVF9USU1FT1VUID0gMjAwO1xuICB2YXIgQVRUUklCID0gJ3RvdWNoLWFjdGlvbic7XG4gIHZhciBJTlNUQUxMRVI7XG5cbiAgLy8gVGhlIHByZXNlbmNlIG9mIHRvdWNoIGV2ZW50IGhhbmRsZXJzIGJsb2NrcyBzY3JvbGxpbmcsIGFuZCBzbyB3ZSBtdXN0IGJlIGNhcmVmdWwgdG9cbiAgLy8gYXZvaWQgYWRkaW5nIGhhbmRsZXJzIHVubmVjZXNzYXJpbHkuICBDaHJvbWUgcGxhbnMgdG8gYWRkIGEgdG91Y2gtYWN0aW9uLWRlbGF5IHByb3BlcnR5XG4gIC8vIChjcmJ1Zy5jb20vMzI5NTU5KSB0byBhZGRyZXNzIHRoaXMsIGFuZCBvbmNlIHdlIGhhdmUgdGhhdCB3ZSBjYW4gb3B0LWluIHRvIGEgc2ltcGxlclxuICAvLyBoYW5kbGVyIHJlZ2lzdHJhdGlvbiBtZWNoYW5pc20uICBSYXRoZXIgdGhhbiB0cnkgdG8gcHJlZGljdCBob3cgZXhhY3RseSB0byBvcHQtaW4gdG9cbiAgLy8gdGhhdCB3ZSdsbCBqdXN0IGxlYXZlIHRoaXMgZGlzYWJsZWQgdW50aWwgdGhlcmUgaXMgYSBidWlsZCBvZiBDaHJvbWUgdG8gdGVzdC5cbiAgdmFyIEhBU19UT1VDSF9BQ1RJT05fREVMQVkgPSBmYWxzZTtcblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgdG91Y2ggZXZlbnRzXG4gIHZhciB0b3VjaEV2ZW50cyA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgJ3RvdWNoZW5kJyxcbiAgICAgICd0b3VjaGNhbmNlbCdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmIChIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZKSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIElOU1RBTExFUi5lbmFibGVPblN1YnRyZWUodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKEhBU19UT1VDSF9BQ1RJT05fREVMQVkpIHtcbiAgICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIC8vIFRPRE8oZGZyZWVkbWFuKTogaXMgaXQgd29ydGggaXQgdG8gZGlzY29ubmVjdCB0aGUgTU8/XG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50QWRkZWQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICB2YXIgYSA9IGVsLmdldEF0dHJpYnV0ZShBVFRSSUIpO1xuICAgICAgdmFyIHN0ID0gdGhpcy50b3VjaEFjdGlvblRvU2Nyb2xsVHlwZShhKTtcbiAgICAgIGlmIChzdCkge1xuICAgICAgICBlbC5fc2Nyb2xsVHlwZSA9IHN0O1xuICAgICAgICBfZGlzcGF0Y2hlci5saXN0ZW4oZWwsIHRoaXMuZXZlbnRzKTtcblxuICAgICAgICAvLyBzZXQgdG91Y2gtYWN0aW9uIG9uIHNoYWRvd3MgYXMgd2VsbFxuICAgICAgICBhbGxTaGFkb3dzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICBzLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgICAgX2Rpc3BhdGNoZXIubGlzdGVuKHMsIHRoaXMuZXZlbnRzKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50UmVtb3ZlZDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLl9zY3JvbGxUeXBlID0gdW5kZWZpbmVkO1xuICAgICAgX2Rpc3BhdGNoZXIudW5saXN0ZW4oZWwsIHRoaXMuZXZlbnRzKTtcblxuICAgICAgLy8gcmVtb3ZlIHRvdWNoLWFjdGlvbiBmcm9tIHNoYWRvd1xuICAgICAgYWxsU2hhZG93cyhlbCkuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgIHMuX3Njcm9sbFR5cGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHMsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG4gICAgZWxlbWVudENoYW5nZWQ6IGZ1bmN0aW9uKGVsLCBvbGRWYWx1ZSkge1xuICAgICAgdmFyIGEgPSBlbC5nZXRBdHRyaWJ1dGUoQVRUUklCKTtcbiAgICAgIHZhciBzdCA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUoYSk7XG4gICAgICB2YXIgb2xkU3QgPSB0aGlzLnRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlKG9sZFZhbHVlKTtcblxuICAgICAgLy8gc2ltcGx5IHVwZGF0ZSBzY3JvbGxUeXBlIGlmIGxpc3RlbmVycyBhcmUgYWxyZWFkeSBlc3RhYmxpc2hlZFxuICAgICAgaWYgKHN0ICYmIG9sZFN0KSB7XG4gICAgICAgIGVsLl9zY3JvbGxUeXBlID0gc3Q7XG4gICAgICAgIGFsbFNoYWRvd3MoZWwpLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgIHMuX3Njcm9sbFR5cGUgPSBzdDtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKG9sZFN0KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlbW92ZWQoZWwpO1xuICAgICAgfSBlbHNlIGlmIChzdCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRBZGRlZChlbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzY3JvbGxUeXBlczoge1xuICAgICAgRU1JVFRFUjogJ25vbmUnLFxuICAgICAgWFNDUk9MTEVSOiAncGFuLXgnLFxuICAgICAgWVNDUk9MTEVSOiAncGFuLXknLFxuICAgICAgU0NST0xMRVI6IC9eKD86cGFuLXggcGFuLXkpfCg/OnBhbi15IHBhbi14KXxhdXRvJC9cbiAgICB9LFxuICAgIHRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlOiBmdW5jdGlvbih0b3VjaEFjdGlvbikge1xuICAgICAgdmFyIHQgPSB0b3VjaEFjdGlvbjtcbiAgICAgIHZhciBzdCA9IHRoaXMuc2Nyb2xsVHlwZXM7XG4gICAgICBpZiAodCA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHJldHVybiAnbm9uZSc7XG4gICAgICB9IGVsc2UgaWYgKHQgPT09IHN0LlhTQ1JPTExFUikge1xuICAgICAgICByZXR1cm4gJ1gnO1xuICAgICAgfSBlbHNlIGlmICh0ID09PSBzdC5ZU0NST0xMRVIpIHtcbiAgICAgICAgcmV0dXJuICdZJztcbiAgICAgIH0gZWxzZSBpZiAoc3QuU0NST0xMRVIuZXhlYyh0KSkge1xuICAgICAgICByZXR1cm4gJ1hZJztcbiAgICAgIH1cbiAgICB9LFxuICAgIFBPSU5URVJfVFlQRTogJ3RvdWNoJyxcbiAgICBmaXJzdFRvdWNoOiBudWxsLFxuICAgIGlzUHJpbWFyeVRvdWNoOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdFRvdWNoID09PSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgfSxcbiAgICBzZXRQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcblxuICAgICAgLy8gc2V0IHByaW1hcnkgdG91Y2ggaWYgdGhlcmUgbm8gcG9pbnRlcnMsIG9yIHRoZSBvbmx5IHBvaW50ZXIgaXMgdGhlIG1vdXNlXG4gICAgICBpZiAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA9PT0gMCB8fCAodG91Y2hfX3BvaW50ZXJtYXAuc2l6ZSA9PT0gMSAmJiB0b3VjaF9fcG9pbnRlcm1hcC5oYXMoMSkpKSB7XG4gICAgICAgIHRoaXMuZmlyc3RUb3VjaCA9IGluVG91Y2guaWRlbnRpZmllcjtcbiAgICAgICAgdGhpcy5maXJzdFhZID0geyBYOiBpblRvdWNoLmNsaWVudFgsIFk6IGluVG91Y2guY2xpZW50WSB9O1xuICAgICAgICB0aGlzLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbmNlbFJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlUHJpbWFyeVBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgaWYgKGluUG9pbnRlci5pc1ByaW1hcnkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNldENsaWNrQ291bnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWNrQ291bnQ6IDAsXG4gICAgcmVzZXRJZDogbnVsbCxcbiAgICByZXNldENsaWNrQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucmVzZXRJZCA9IG51bGw7XG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLnJlc2V0SWQgPSBzZXRUaW1lb3V0KGZuLCBDTElDS19DT1VOVF9USU1FT1VUKTtcbiAgICB9LFxuICAgIGNhbmNlbFJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZXNldElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0SWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHlwZVRvQnV0dG9uczogZnVuY3Rpb24odHlwZSkge1xuICAgICAgdmFyIHJldCA9IDA7XG4gICAgICBpZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHJldCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgdG91Y2hUb1BvaW50ZXI6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIHZhciBjdGUgPSB0aGlzLmN1cnJlbnRUb3VjaEV2ZW50O1xuICAgICAgdmFyIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluVG91Y2gpO1xuXG4gICAgICAvLyBXZSByZXNlcnZlIHBvaW50ZXJJZCAxIGZvciBNb3VzZS5cbiAgICAgIC8vIFRvdWNoIGlkZW50aWZpZXJzIGNhbiBzdGFydCBhdCAwLlxuICAgICAgLy8gQWRkIDIgdG8gdGhlIHRvdWNoIGlkZW50aWZpZXIgZm9yIGNvbXBhdGliaWxpdHkuXG4gICAgICB2YXIgaWQgPSBlLnBvaW50ZXJJZCA9IGluVG91Y2guaWRlbnRpZmllciArIDI7XG4gICAgICBlLnRhcmdldCA9IGNhcHR1cmVJbmZvW2lkXSB8fCBmaW5kVGFyZ2V0KGUpO1xuICAgICAgZS5idWJibGVzID0gdHJ1ZTtcbiAgICAgIGUuY2FuY2VsYWJsZSA9IHRydWU7XG4gICAgICBlLmRldGFpbCA9IHRoaXMuY2xpY2tDb3VudDtcbiAgICAgIGUuYnV0dG9uID0gMDtcbiAgICAgIGUuYnV0dG9ucyA9IHRoaXMudHlwZVRvQnV0dG9ucyhjdGUudHlwZSk7XG4gICAgICBlLndpZHRoID0gaW5Ub3VjaC5yYWRpdXNYIHx8IGluVG91Y2gud2Via2l0UmFkaXVzWCB8fCAwO1xuICAgICAgZS5oZWlnaHQgPSBpblRvdWNoLnJhZGl1c1kgfHwgaW5Ub3VjaC53ZWJraXRSYWRpdXNZIHx8IDA7XG4gICAgICBlLnByZXNzdXJlID0gaW5Ub3VjaC5mb3JjZSB8fCBpblRvdWNoLndlYmtpdEZvcmNlIHx8IDAuNTtcbiAgICAgIGUuaXNQcmltYXJ5ID0gdGhpcy5pc1ByaW1hcnlUb3VjaChpblRvdWNoKTtcbiAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRTtcblxuICAgICAgLy8gZm9yd2FyZCB0b3VjaCBwcmV2ZW50RGVmYXVsdHNcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgY3RlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBwcm9jZXNzVG91Y2hlczogZnVuY3Rpb24oaW5FdmVudCwgaW5GdW5jdGlvbikge1xuICAgICAgdmFyIHRsID0gaW5FdmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgICAgIHRoaXMuY3VycmVudFRvdWNoRXZlbnQgPSBpbkV2ZW50O1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHQ7IGkgPCB0bC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0ID0gdGxbaV07XG4gICAgICAgIGluRnVuY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnRvdWNoVG9Qb2ludGVyKHQpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRm9yIHNpbmdsZSBheGlzIHNjcm9sbGVycywgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBlbGVtZW50IHNob3VsZCBlbWl0XG4gICAgLy8gcG9pbnRlciBldmVudHMgb3IgYmVoYXZlIGFzIGEgc2Nyb2xsZXJcbiAgICBzaG91bGRTY3JvbGw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmZpcnN0WFkpIHtcbiAgICAgICAgdmFyIHJldDtcbiAgICAgICAgdmFyIHNjcm9sbEF4aXMgPSBpbkV2ZW50LmN1cnJlbnRUYXJnZXQuX3Njcm9sbFR5cGU7XG4gICAgICAgIGlmIChzY3JvbGxBeGlzID09PSAnbm9uZScpIHtcblxuICAgICAgICAgIC8vIHRoaXMgZWxlbWVudCBpcyBhIHRvdWNoLWFjdGlvbjogbm9uZSwgc2hvdWxkIG5ldmVyIHNjcm9sbFxuICAgICAgICAgIHJldCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbEF4aXMgPT09ICdYWScpIHtcblxuICAgICAgICAgIC8vIHRoaXMgZWxlbWVudCBzaG91bGQgYWx3YXlzIHNjcm9sbFxuICAgICAgICAgIHJldCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG4gICAgICAgICAgLy8gY2hlY2sgdGhlIGludGVuZGVkIHNjcm9sbCBheGlzLCBhbmQgb3RoZXIgYXhpc1xuICAgICAgICAgIHZhciBhID0gc2Nyb2xsQXhpcztcbiAgICAgICAgICB2YXIgb2EgPSBzY3JvbGxBeGlzID09PSAnWScgPyAnWCcgOiAnWSc7XG4gICAgICAgICAgdmFyIGRhID0gTWF0aC5hYnModFsnY2xpZW50JyArIGFdIC0gdGhpcy5maXJzdFhZW2FdKTtcbiAgICAgICAgICB2YXIgZG9hID0gTWF0aC5hYnModFsnY2xpZW50JyArIG9hXSAtIHRoaXMuZmlyc3RYWVtvYV0pO1xuXG4gICAgICAgICAgLy8gaWYgZGVsdGEgaW4gdGhlIHNjcm9sbCBheGlzID4gZGVsdGEgb3RoZXIgYXhpcywgc2Nyb2xsIGluc3RlYWQgb2ZcbiAgICAgICAgICAvLyBtYWtpbmcgZXZlbnRzXG4gICAgICAgICAgcmV0ID0gZGEgPj0gZG9hO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyc3RYWSA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBmaW5kVG91Y2g6IGZ1bmN0aW9uKGluVEwsIGluSWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaW5UTC5sZW5ndGgsIHQ7IGkgPCBsICYmICh0ID0gaW5UTFtpXSk7IGkrKykge1xuICAgICAgICBpZiAodC5pZGVudGlmaWVyID09PSBpbklkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSW4gc29tZSBpbnN0YW5jZXMsIGEgdG91Y2hzdGFydCBjYW4gaGFwcGVuIHdpdGhvdXQgYSB0b3VjaGVuZC4gVGhpc1xuICAgIC8vIGxlYXZlcyB0aGUgcG9pbnRlcm1hcCBpbiBhIGJyb2tlbiBzdGF0ZS5cbiAgICAvLyBUaGVyZWZvcmUsIG9uIGV2ZXJ5IHRvdWNoc3RhcnQsIHdlIHJlbW92ZSB0aGUgdG91Y2hlcyB0aGF0IGRpZCBub3QgZmlyZSBhXG4gICAgLy8gdG91Y2hlbmQgZXZlbnQuXG4gICAgLy8gVG8ga2VlcCBzdGF0ZSBnbG9iYWxseSBjb25zaXN0ZW50LCB3ZSBmaXJlIGFcbiAgICAvLyBwb2ludGVyY2FuY2VsIGZvciB0aGlzIFwiYWJhbmRvbmVkXCIgdG91Y2hcbiAgICB2YWN1dW1Ub3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LnRvdWNoZXM7XG5cbiAgICAgIC8vIHBvaW50ZXJtYXAuc2l6ZSBzaG91bGQgYmUgPCB0bC5sZW5ndGggaGVyZSwgYXMgdGhlIHRvdWNoc3RhcnQgaGFzIG5vdFxuICAgICAgLy8gYmVlbiBwcm9jZXNzZWQgeWV0LlxuICAgICAgaWYgKHRvdWNoX19wb2ludGVybWFwLnNpemUgPj0gdGwubGVuZ3RoKSB7XG4gICAgICAgIHZhciBkID0gW107XG4gICAgICAgIHRvdWNoX19wb2ludGVybWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuXG4gICAgICAgICAgLy8gTmV2ZXIgcmVtb3ZlIHBvaW50ZXJJZCA9PSAxLCB3aGljaCBpcyBtb3VzZS5cbiAgICAgICAgICAvLyBUb3VjaCBpZGVudGlmaWVycyBhcmUgMiBzbWFsbGVyIHRoYW4gdGhlaXIgcG9pbnRlcklkLCB3aGljaCBpcyB0aGVcbiAgICAgICAgICAvLyBpbmRleCBpbiBwb2ludGVybWFwLlxuICAgICAgICAgIGlmIChrZXkgIT09IDEgJiYgIXRoaXMuZmluZFRvdWNoKHRsLCBrZXkgLSAyKSkge1xuICAgICAgICAgICAgdmFyIHAgPSB2YWx1ZS5vdXQ7XG4gICAgICAgICAgICBkLnB1c2gocCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgZC5mb3JFYWNoKHRoaXMuY2FuY2VsT3V0LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMudmFjdXVtVG91Y2hlcyhpbkV2ZW50KTtcbiAgICAgIHRoaXMuc2V0UHJpbWFyeVRvdWNoKGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgICAgdGhpcy5kZWR1cFN5bnRoTW91c2UoaW5FdmVudCk7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCsrO1xuICAgICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMub3ZlckRvd24pO1xuICAgICAgfVxuICAgIH0sXG4gICAgb3ZlckRvd246IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuc2V0KGluUG9pbnRlci5wb2ludGVySWQsIHtcbiAgICAgICAgdGFyZ2V0OiBpblBvaW50ZXIudGFyZ2V0LFxuICAgICAgICBvdXQ6IGluUG9pbnRlcixcbiAgICAgICAgb3V0VGFyZ2V0OiBpblBvaW50ZXIudGFyZ2V0XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaGVyLm92ZXIoaW5Qb2ludGVyKTtcbiAgICAgIF9kaXNwYXRjaGVyLmVudGVyKGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5kb3duKGluUG9pbnRlcik7XG4gICAgfSxcbiAgICB0b3VjaG1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2Nyb2xsKGluRXZlbnQpKSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudG91Y2hjYW5jZWwoaW5FdmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5tb3ZlT3Zlck91dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmVPdmVyT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHZhciBldmVudCA9IGluUG9pbnRlcjtcbiAgICAgIHZhciBwb2ludGVyID0gdG91Y2hfX3BvaW50ZXJtYXAuZ2V0KGV2ZW50LnBvaW50ZXJJZCk7XG5cbiAgICAgIC8vIGEgZmluZ2VyIGRyaWZ0ZWQgb2ZmIHRoZSBzY3JlZW4sIGlnbm9yZSBpdFxuICAgICAgaWYgKCFwb2ludGVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBvdXRFdmVudCA9IHBvaW50ZXIub3V0O1xuICAgICAgdmFyIG91dFRhcmdldCA9IHBvaW50ZXIub3V0VGFyZ2V0O1xuICAgICAgX2Rpc3BhdGNoZXIubW92ZShldmVudCk7XG4gICAgICBpZiAob3V0RXZlbnQgJiYgb3V0VGFyZ2V0ICE9PSBldmVudC50YXJnZXQpIHtcbiAgICAgICAgb3V0RXZlbnQucmVsYXRlZFRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgZXZlbnQucmVsYXRlZFRhcmdldCA9IG91dFRhcmdldDtcblxuICAgICAgICAvLyByZWNvdmVyIGZyb20gcmV0YXJnZXRpbmcgYnkgc2hhZG93XG4gICAgICAgIG91dEV2ZW50LnRhcmdldCA9IG91dFRhcmdldDtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLmxlYXZlT3V0KG91dEV2ZW50KTtcbiAgICAgICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgLy8gY2xlYW4gdXAgY2FzZSB3aGVuIGZpbmdlciBsZWF2ZXMgdGhlIHNjcmVlblxuICAgICAgICAgIGV2ZW50LnRhcmdldCA9IG91dFRhcmdldDtcbiAgICAgICAgICBldmVudC5yZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLmNhbmNlbE91dChldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBvaW50ZXIub3V0ID0gZXZlbnQ7XG4gICAgICBwb2ludGVyLm91dFRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICB9LFxuICAgIHRvdWNoZW5kOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLmRlZHVwU3ludGhNb3VzZShpbkV2ZW50KTtcbiAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy51cE91dCk7XG4gICAgfSxcbiAgICB1cE91dDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBpZiAoIXRoaXMuc2Nyb2xsaW5nKSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLnVwKGluUG9pbnRlcik7XG4gICAgICAgIF9kaXNwYXRjaGVyLm91dChpblBvaW50ZXIpO1xuICAgICAgICBfZGlzcGF0Y2hlci5sZWF2ZShpblBvaW50ZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGVhblVwUG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgdG91Y2hjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5jYW5jZWxPdXQpO1xuICAgIH0sXG4gICAgY2FuY2VsT3V0OiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIF9kaXNwYXRjaGVyLmNhbmNlbChpblBvaW50ZXIpO1xuICAgICAgX2Rpc3BhdGNoZXIub3V0KGluUG9pbnRlcik7XG4gICAgICBfZGlzcGF0Y2hlci5sZWF2ZShpblBvaW50ZXIpO1xuICAgICAgdGhpcy5jbGVhblVwUG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgY2xlYW5VcFBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgdG91Y2hfX3BvaW50ZXJtYXAuZGVsZXRlKGluUG9pbnRlci5wb2ludGVySWQpO1xuICAgICAgdGhpcy5yZW1vdmVQcmltYXJ5UG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG5cbiAgICAvLyBwcmV2ZW50IHN5bnRoIG1vdXNlIGV2ZW50cyBmcm9tIGNyZWF0aW5nIHBvaW50ZXIgZXZlbnRzXG4gICAgZGVkdXBTeW50aE1vdXNlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgbHRzID0gbW91c2UubGFzdFRvdWNoZXM7XG4gICAgICB2YXIgdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cbiAgICAgIC8vIG9ubHkgdGhlIHByaW1hcnkgZmluZ2VyIHdpbGwgc3ludGggbW91c2UgZXZlbnRzXG4gICAgICBpZiAodGhpcy5pc1ByaW1hcnlUb3VjaCh0KSkge1xuXG4gICAgICAgIC8vIHJlbWVtYmVyIHgveSBvZiBsYXN0IHRvdWNoXG4gICAgICAgIHZhciBsdCA9IHsgeDogdC5jbGllbnRYLCB5OiB0LmNsaWVudFkgfTtcbiAgICAgICAgbHRzLnB1c2gobHQpO1xuICAgICAgICB2YXIgZm4gPSAoZnVuY3Rpb24obHRzLCBsdCkge1xuICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobHQpO1xuICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgIGx0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKG51bGwsIGx0cywgbHQpO1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCBERURVUF9USU1FT1VUKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaWYgKCFIQVNfVE9VQ0hfQUNUSU9OX0RFTEFZKSB7XG4gICAgSU5TVEFMTEVSID0gbmV3IGluc3RhbGxlcih0b3VjaEV2ZW50cy5lbGVtZW50QWRkZWQsIHRvdWNoRXZlbnRzLmVsZW1lbnRSZW1vdmVkLFxuICAgICAgdG91Y2hFdmVudHMuZWxlbWVudENoYW5nZWQsIHRvdWNoRXZlbnRzKTtcbiAgfVxuXG4gIHZhciB0b3VjaCA9IHRvdWNoRXZlbnRzO1xuXG4gIHZhciBtc19fcG9pbnRlcm1hcCA9IF9kaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG4gIHZhciBIQVNfQklUTUFQX1RZUEUgPSB3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiZcbiAgICB0eXBlb2Ygd2luZG93Lk1TUG9pbnRlckV2ZW50Lk1TUE9JTlRFUl9UWVBFX01PVVNFID09PSAnbnVtYmVyJztcbiAgdmFyIG1zRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ01TUG9pbnRlckRvd24nLFxuICAgICAgJ01TUG9pbnRlck1vdmUnLFxuICAgICAgJ01TUG9pbnRlclVwJyxcbiAgICAgICdNU1BvaW50ZXJPdXQnLFxuICAgICAgJ01TUG9pbnRlck92ZXInLFxuICAgICAgJ01TUG9pbnRlckNhbmNlbCcsXG4gICAgICAnTVNHb3RQb2ludGVyQ2FwdHVyZScsXG4gICAgICAnTVNMb3N0UG9pbnRlckNhcHR1cmUnXG4gICAgXSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBfZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIF9kaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgUE9JTlRFUl9UWVBFUzogW1xuICAgICAgJycsXG4gICAgICAndW5hdmFpbGFibGUnLFxuICAgICAgJ3RvdWNoJyxcbiAgICAgICdwZW4nLFxuICAgICAgJ21vdXNlJ1xuICAgIF0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGluRXZlbnQ7XG4gICAgICBpZiAoSEFTX0JJVE1BUF9UWVBFKSB7XG4gICAgICAgIGUgPSBfZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEVTW2luRXZlbnQucG9pbnRlclR5cGVdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBjbGVhbnVwOiBmdW5jdGlvbihpZCkge1xuICAgICAgbXNfX3BvaW50ZXJtYXAuZGVsZXRlKGlkKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlckRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIG1zX19wb2ludGVybWFwLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgaW5FdmVudCk7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgX2Rpc3BhdGNoZXIuZG93bihlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyVXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci51cChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJPdXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5sZWF2ZU91dChlKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlck92ZXI6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5lbnRlck92ZXIoZSk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJDYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBfZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmNsZWFudXAoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH0sXG4gICAgTVNMb3N0UG9pbnRlckNhcHR1cmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gX2Rpc3BhdGNoZXIubWFrZUV2ZW50KCdsb3N0cG9pbnRlcmNhcHR1cmUnLCBpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICBNU0dvdFBvaW50ZXJDYXB0dXJlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IF9kaXNwYXRjaGVyLm1ha2VFdmVudCgnZ290cG9pbnRlcmNhcHR1cmUnLCBpbkV2ZW50KTtcbiAgICAgIF9kaXNwYXRjaGVyLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtcyA9IG1zRXZlbnRzO1xuXG4gIGZ1bmN0aW9uIHBsYXRmb3JtX2V2ZW50c19fYXBwbHlQb2x5ZmlsbCgpIHtcblxuICAgIC8vIG9ubHkgYWN0aXZhdGUgaWYgdGhpcyBwbGF0Zm9ybSBkb2VzIG5vdCBoYXZlIHBvaW50ZXIgZXZlbnRzXG4gICAgaWYgKCF3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG4gICAgICB3aW5kb3cuUG9pbnRlckV2ZW50ID0gX1BvaW50ZXJFdmVudDtcblxuICAgICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCkge1xuICAgICAgICB2YXIgdHAgPSB3aW5kb3cubmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHM7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cubmF2aWdhdG9yLCAnbWF4VG91Y2hQb2ludHMnLCB7XG4gICAgICAgICAgdmFsdWU6IHRwLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtcycsIG1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtb3VzZScsIG1vdXNlKTtcbiAgICAgICAgaWYgKHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIF9kaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCd0b3VjaCcsIHRvdWNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfZGlzcGF0Y2hlci5yZWdpc3Rlcihkb2N1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG4gPSB3aW5kb3cubmF2aWdhdG9yO1xuICB2YXIgcywgcjtcbiAgZnVuY3Rpb24gYXNzZXJ0RG93bihpZCkge1xuICAgIGlmICghX2Rpc3BhdGNoZXIucG9pbnRlcm1hcC5oYXMoaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWRQb2ludGVySWQnKTtcbiAgICB9XG4gIH1cbiAgaWYgKG4ubXNQb2ludGVyRW5hYmxlZCkge1xuICAgIHMgPSBmdW5jdGlvbihwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIHRoaXMubXNTZXRQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gICAgciA9IGZ1bmN0aW9uKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgdGhpcy5tc1JlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcyA9IGZ1bmN0aW9uIHNldFBvaW50ZXJDYXB0dXJlKHBvaW50ZXJJZCkge1xuICAgICAgYXNzZXJ0RG93bihwb2ludGVySWQpO1xuICAgICAgX2Rpc3BhdGNoZXIuc2V0Q2FwdHVyZShwb2ludGVySWQsIHRoaXMpO1xuICAgIH07XG4gICAgciA9IGZ1bmN0aW9uIHJlbGVhc2VQb2ludGVyQ2FwdHVyZShwb2ludGVySWQpIHtcbiAgICAgIGFzc2VydERvd24ocG9pbnRlcklkKTtcbiAgICAgIF9kaXNwYXRjaGVyLnJlbGVhc2VDYXB0dXJlKHBvaW50ZXJJZCwgdGhpcyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9jYXB0dXJlX19hcHBseVBvbHlmaWxsKCkge1xuICAgIGlmICh3aW5kb3cuRWxlbWVudCAmJiAhRWxlbWVudC5wcm90b3R5cGUuc2V0UG9pbnRlckNhcHR1cmUpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEVsZW1lbnQucHJvdG90eXBlLCB7XG4gICAgICAgICdzZXRQb2ludGVyQ2FwdHVyZSc6IHtcbiAgICAgICAgICB2YWx1ZTogc1xuICAgICAgICB9LFxuICAgICAgICAncmVsZWFzZVBvaW50ZXJDYXB0dXJlJzoge1xuICAgICAgICAgIHZhbHVlOiByXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFwcGx5QXR0cmlidXRlU3R5bGVzKCk7XG4gIHBsYXRmb3JtX2V2ZW50c19fYXBwbHlQb2x5ZmlsbCgpO1xuICBfY2FwdHVyZV9fYXBwbHlQb2x5ZmlsbCgpO1xuXG4gIHZhciBwb2ludGVyZXZlbnRzID0ge1xuICAgIGRpc3BhdGNoZXI6IF9kaXNwYXRjaGVyLFxuICAgIEluc3RhbGxlcjogaW5zdGFsbGVyLFxuICAgIFBvaW50ZXJFdmVudDogX1BvaW50ZXJFdmVudCxcbiAgICBQb2ludGVyTWFwOiBfcG9pbnRlcm1hcCxcbiAgICB0YXJnZXRGaW5kaW5nOiB0YXJnZXRpbmdcbiAgfTtcblxuICByZXR1cm4gcG9pbnRlcmV2ZW50cztcblxufSkpOyIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFZpY3RvcjtcblxuLyoqXG4gKiAjIFZpY3RvciAtIEEgSmF2YVNjcmlwdCAyRCB2ZWN0b3IgY2xhc3Mgd2l0aCBtZXRob2RzIGZvciBjb21tb24gdmVjdG9yIG9wZXJhdGlvbnNcbiAqL1xuXG4vKipcbiAqIENvbnN0cnVjdG9yLiBXaWxsIGFsc28gd29yayB3aXRob3V0IHRoZSBgbmV3YCBrZXl3b3JkXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IFZpY3Rvcig0MiwgMTMzNyk7XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggVmFsdWUgb2YgdGhlIHggYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IHkgVmFsdWUgb2YgdGhlIHkgYXhpc1xuICogQHJldHVybiB7VmljdG9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gVmljdG9yICh4LCB5KSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBWaWN0b3IpKSB7XG5cdFx0cmV0dXJuIG5ldyBWaWN0b3IoeCwgeSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIFggYXhpc1xuXHQgKlxuXHQgKiAjIyMgRXhhbXBsZXM6XG5cdCAqICAgICB2YXIgdmVjID0gbmV3IFZpY3Rvci5mcm9tQXJyYXkoNDIsIDIxKTtcblx0ICpcblx0ICogICAgIHZlYy54O1xuXHQgKiAgICAgLy8gPT4gNDJcblx0ICpcblx0ICogQGFwaSBwdWJsaWNcblx0ICovXG5cdHRoaXMueCA9IHggfHwgMDtcblxuXHQvKipcblx0ICogVGhlIFkgYXhpc1xuXHQgKlxuXHQgKiAjIyMgRXhhbXBsZXM6XG5cdCAqICAgICB2YXIgdmVjID0gbmV3IFZpY3Rvci5mcm9tQXJyYXkoNDIsIDIxKTtcblx0ICpcblx0ICogICAgIHZlYy55O1xuXHQgKiAgICAgLy8gPT4gMjFcblx0ICpcblx0ICogQGFwaSBwdWJsaWNcblx0ICovXG5cdHRoaXMueSA9IHkgfHwgMDtcbn07XG5cbi8qKlxuICogIyBTdGF0aWNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBhbiBhcnJheVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gVmljdG9yLmZyb21BcnJheShbNDIsIDIxXSk7XG4gKlxuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NDIsIHk6MjFcbiAqXG4gKiBAbmFtZSBWaWN0b3IuZnJvbUFycmF5XG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBBcnJheSB3aXRoIHRoZSB4IGFuZCB5IHZhbHVlcyBhdCBpbmRleCAwIGFuZCAxIHJlc3BlY3RpdmVseVxuICogQHJldHVybiB7VmljdG9yfSBUaGUgbmV3IGluc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IuZnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuXHRyZXR1cm4gbmV3IFZpY3RvcihhcnJbMF0gfHwgMCwgYXJyWzFdIHx8IDApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIGZyb20gYW4gb2JqZWN0XG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBWaWN0b3IuZnJvbU9iamVjdCh7IHg6IDQyLCB5OiAyMSB9KTtcbiAqXG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo0MiwgeToyMVxuICpcbiAqIEBuYW1lIFZpY3Rvci5mcm9tT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIE9iamVjdCB3aXRoIHRoZSB2YWx1ZXMgZm9yIHggYW5kIHlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gVGhlIG5ldyBpbnN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLmZyb21PYmplY3QgPSBmdW5jdGlvbiAob2JqKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKG9iai54IHx8IDAsIG9iai55IHx8IDApO1xufTtcblxuLyoqXG4gKiAjIE1hbmlwdWxhdGlvblxuICpcbiAqIFRoZXNlIGZ1bmN0aW9ucyBhcmUgY2hhaW5hYmxlLlxuICovXG5cbi8qKlxuICogQWRkcyBhbm90aGVyIHZlY3RvcidzIFggYXhpcyB0byB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5hZGRYKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjMwLCB5OjEwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHRvIGFkZCB0byB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggKz0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFub3RoZXIgdmVjdG9yJ3MgWSBheGlzIHRvIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLmFkZFkodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6NDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueSArPSB2ZWMueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW5vdGhlciB2ZWN0b3IgdG8gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuYWRkKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjMwLCB5OjQwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHRvIGFkZCB0byB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCArPSB2ZWMueDtcblx0dGhpcy55ICs9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyB0aGUgZ2l2ZW4gc2NhbGFyIHRvIGJvdGggdmVjdG9yIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMSwgMik7XG4gKlxuICogICAgIHZlYy5hZGRTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMywgeTogNFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKz0gc2NhbGFyO1xuXHR0aGlzLnkgKz0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyB0aGUgZ2l2ZW4gc2NhbGFyIHRvIHRoZSBYIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMSwgMik7XG4gKlxuICogICAgIHZlYy5hZGRTY2FsYXJYKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDMsIHk6IDJcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gYWRkXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFNjYWxhclggPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCArPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhclkoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMSwgeTogNFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyWSA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy55ICs9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgWCBheGlzIG9mIGFub3RoZXIgdmVjdG9yIGZyb20gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLnN1YnRyYWN0WCh2ZWMyKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo4MCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCBzdWJ0cmFjdCBmcm9tIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnN1YnRyYWN0WCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54IC09IHZlYy54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBZIGF4aXMgb2YgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3RZKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeToyMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCBzdWJ0cmFjdCBmcm9tIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnN1YnRyYWN0WSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy55IC09IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIGFub3RoZXIgdmVjdG9yIGZyb20gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLnN1YnRyYWN0KHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjgwLCB5OjIwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCAtPSB2ZWMueDtcblx0dGhpcy55IC09IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBnaXZlbiBzY2FsYXIgZnJvbSBib3RoIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMuc3VidHJhY3RTY2FsYXIoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDgwLCB5OiAxODBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCAtPSBzY2FsYXI7XG5cdHRoaXMueSAtPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHNjYWxhciBmcm9tIHRoZSBYIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMuc3VidHJhY3RTY2FsYXJYKDIwKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiA4MCwgeTogMjAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIHN1YnRyYWN0XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnN1YnRyYWN0U2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgZ2l2ZW4gc2NhbGFyIGZyb20gdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhclkoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDEwMCwgeTogMTgwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIHN1YnRyYWN0XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnN1YnRyYWN0U2NhbGFyWSA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy55IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERpdmlkZXMgdGhlIFggYXhpcyBieSB0aGUgeCBjb21wb25lbnQgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAwKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo1MCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlWCA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54IC89IHZlY3Rvci54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWSBheGlzIGJ5IHRoZSB5IGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDAsIDIpO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlWSh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeToyNVxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlWSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy55IC89IHZlY3Rvci55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyBib3RoIHZlY3RvciBheGlzIGJ5IGEgYXhpcyB2YWx1ZXMgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAyKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZSh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiAodmVjdG9yKSB7XG5cdHRoaXMueCAvPSB2ZWN0b3IueDtcblx0dGhpcy55IC89IHZlY3Rvci55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyBib3RoIHZlY3RvciBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo1MCwgeToyNVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnggLz0gc2NhbGFyO1xuXHRcdHRoaXMueSAvPSBzY2FsYXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy54ID0gMDtcblx0XHR0aGlzLnkgPSAwO1xuXHR9XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERpdmlkZXMgdGhlIFggYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlU2NhbGFyWCgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhclggPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnggLz0gc2NhbGFyO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMueCA9IDA7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIERpdmlkZXMgdGhlIFkgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlU2NhbGFyWSgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeToyNVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHRpZiAoc2NhbGFyICE9PSAwKSB7XG5cdFx0dGhpcy55IC89IHNjYWxhcjtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnkgPSAwO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIHRoZSBYIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5pbnZlcnRYKCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDotMTAwLCB5OjUwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5pbnZlcnRYID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnggKj0gLTE7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIHRoZSBZIGF4aXNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5pbnZlcnRZKCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6LTUwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5pbnZlcnRZID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnkgKj0gLTE7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZlcnRzIGJvdGggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6LTEwMCwgeTotNTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5pbnZlcnRYKCk7XG5cdHRoaXMuaW52ZXJ0WSgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWCBheGlzIGJ5IFggY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMiwgMCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgdGhlIGF4aXMgd2l0aFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseVggPSBmdW5jdGlvbiAodmVjdG9yKSB7XG5cdHRoaXMueCAqPSB2ZWN0b3IueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdGhlIFkgYXhpcyBieSBZIGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDAsIDIpO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlYKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5WSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy55ICo9IHZlY3Rvci55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyBib3RoIHZlY3RvciBheGlzIGJ5IHZhbHVlcyBmcm9tIGEgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAyKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5KHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54ICo9IHZlY3Rvci54O1xuXHR0aGlzLnkgKj0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhciB2YWx1ZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5U2NhbGFyKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5U2NhbGFyID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKj0gc2NhbGFyO1xuXHR0aGlzLnkgKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWCBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVNjYWxhclgoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gVGhlIHNjYWxhciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5U2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54ICo9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgdGhlIFkgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlTY2FsYXJZKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTm9ybWFsaXplXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXG5cdGlmIChsZW5ndGggPT09IDApIHtcblx0XHR0aGlzLnggPSAxO1xuXHRcdHRoaXMueSA9IDA7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5kaXZpZGUoVmljdG9yKGxlbmd0aCwgbGVuZ3RoKSk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLm5vcm0gPSBWaWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZTtcblxuLyoqXG4gKiBJZiB0aGUgYWJzb2x1dGUgdmVjdG9yIGF4aXMgaXMgZ3JlYXRlciB0aGFuIGBtYXhgLCBtdWx0aXBsaWVzIHRoZSBheGlzIGJ5IGBmYWN0b3JgXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubGltaXQoODAsIDAuOSk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo5MCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtYXggVGhlIG1heGltdW0gdmFsdWUgZm9yIGJvdGggeCBhbmQgeSBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gZmFjdG9yIEZhY3RvciBieSB3aGljaCB0aGUgYXhpcyBhcmUgdG8gYmUgbXVsdGlwbGllZCB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmxpbWl0ID0gZnVuY3Rpb24gKG1heCwgZmFjdG9yKSB7XG5cdGlmIChNYXRoLmFicyh0aGlzLngpID4gbWF4KXsgdGhpcy54ICo9IGZhY3RvcjsgfVxuXHRpZiAoTWF0aC5hYnModGhpcy55KSA+IG1heCl7IHRoaXMueSAqPSBmYWN0b3I7IH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJhbmRvbWl6ZXMgYm90aCB2ZWN0b3IgYXhpcyB3aXRoIGEgdmFsdWUgYmV0d2VlbiAyIHZlY3RvcnNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5yYW5kb21pemUobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjY3LCB5OjczXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHRvcExlZnQgZmlyc3QgdmVjdG9yXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gYm90dG9tUmlnaHQgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5yYW5kb21pemUgPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dGhpcy5yYW5kb21pemVYKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0dGhpcy5yYW5kb21pemVZKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyB0aGUgeSBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZVgobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjU1LCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHRvcExlZnQgZmlyc3QgdmVjdG9yXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gYm90dG9tUmlnaHQgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5yYW5kb21pemVYID0gZnVuY3Rpb24gKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XG5cdHZhciBtaW4gPSBNYXRoLm1pbih0b3BMZWZ0LngsIGJvdHRvbVJpZ2h0LngpO1xuXHR2YXIgbWF4ID0gTWF0aC5tYXgodG9wTGVmdC54LCBib3R0b21SaWdodC54KTtcblx0dGhpcy54ID0gcmFuZG9tKG1pbiwgbWF4KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJhbmRvbWl6ZXMgdGhlIHkgYXhpcyB3aXRoIGEgdmFsdWUgYmV0d2VlbiAyIHZlY3RvcnNcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5yYW5kb21pemVZKG5ldyBWaWN0b3IoNTAsIDYwKSwgbmV3IFZpY3Rvcig3MCwgODBgKSk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NjZcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZVkgPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dmFyIG1pbiA9IE1hdGgubWluKHRvcExlZnQueSwgYm90dG9tUmlnaHQueSk7XG5cdHZhciBtYXggPSBNYXRoLm1heCh0b3BMZWZ0LnksIGJvdHRvbVJpZ2h0LnkpO1xuXHR0aGlzLnkgPSByYW5kb20obWluLCBtYXgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9tbHkgcmFuZG9taXplcyBlaXRoZXIgYXhpcyBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZUFueShuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwKSk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NzdcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZUFueSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHRpZiAoISEgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKSkge1xuXHRcdHRoaXMucmFuZG9taXplWCh0b3BMZWZ0LCBib3R0b21SaWdodCk7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5yYW5kb21pemVZKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUm91bmRzIGJvdGggYXhpcyB0byBhbiBpbnRlZ2VyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMC4yLCA1MC45KTtcbiAqXG4gKiAgICAgdmVjLnVuZmxvYXQoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo1MVxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudW5mbG9hdCA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xuXHR0aGlzLnkgPSBNYXRoLnJvdW5kKHRoaXMueSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3VuZHMgYm90aCBheGlzIHRvIGEgY2VydGFpbiBwcmVjaXNpb25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLjIsIDUwLjkpO1xuICpcbiAqICAgICB2ZWMudW5mbG9hdCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjUxXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFByZWNpc2lvbiAoZGVmYXVsdDogOClcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9GaXhlZCA9IGZ1bmN0aW9uIChwcmVjaXNpb24pIHtcblx0aWYgKHR5cGVvZiBwcmVjaXNpb24gPT09ICd1bmRlZmluZWQnKSB7IHByZWNpc2lvbiA9IDg7IH1cblx0dGhpcy54ID0gdGhpcy54LnRvRml4ZWQocHJlY2lzaW9uKTtcblx0dGhpcy55ID0gdGhpcy55LnRvRml4ZWQocHJlY2lzaW9uKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGJsZW5kIC8gaW50ZXJwb2xhdGlvbiBvZiB0aGUgWCBheGlzIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peFgodmVjMiwgMC41KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjE1MCwgeToxMDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBhbW91bnQgVGhlIGJsZW5kIGFtb3VudCAob3B0aW9uYWwsIGRlZmF1bHQ6IDAuNSlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubWl4WCA9IGZ1bmN0aW9uICh2ZWMsIGFtb3VudCkge1xuXHRpZiAodHlwZW9mIGFtb3VudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRhbW91bnQgPSAwLjU7XG5cdH1cblxuXHR0aGlzLnggPSAoMSAtIGFtb3VudCkgKiB0aGlzLnggKyBhbW91bnQgKiB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGJsZW5kIC8gaW50ZXJwb2xhdGlvbiBvZiB0aGUgWSBheGlzIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peFkodmVjMiwgMC41KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeToxNTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBhbW91bnQgVGhlIGJsZW5kIGFtb3VudCAob3B0aW9uYWwsIGRlZmF1bHQ6IDAuNSlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubWl4WSA9IGZ1bmN0aW9uICh2ZWMsIGFtb3VudCkge1xuXHRpZiAodHlwZW9mIGFtb3VudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRhbW91bnQgPSAwLjU7XG5cdH1cblxuXHR0aGlzLnkgPSAoMSAtIGFtb3VudCkgKiB0aGlzLnkgKyBhbW91bnQgKiB2ZWMueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGJsZW5kIC8gaW50ZXJwb2xhdGlvbiB0b3dhcmRzIGFub3RoZXIgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDEwMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgMjAwKTtcbiAqXG4gKiAgICAgdmVjMS5taXgodmVjMiwgMC41KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjE1MCwgeToxNTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBhbW91bnQgVGhlIGJsZW5kIGFtb3VudCAob3B0aW9uYWwsIGRlZmF1bHQ6IDAuNSlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubWl4ID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdHRoaXMubWl4WCh2ZWMsIGFtb3VudCk7XG5cdHRoaXMubWl4WSh2ZWMsIGFtb3VudCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiAjIFByb2R1Y3RzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhpcyB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNsb25lKCk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwLCB5OjEwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBBIGNsb25lIG9mIHRoZSB2ZWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKHRoaXMueCwgdGhpcy55KTtcbn07XG5cbi8qKlxuICogQ29waWVzIGFub3RoZXIgdmVjdG9yJ3MgWCBjb21wb25lbnQgaW4gdG8gaXRzIG93blxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDIwKTtcbiAqICAgICB2YXIgdmVjMiA9IHZlYzEuY29weVgodmVjMSk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwLCB5OjEwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jb3B5WCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54ID0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYW5vdGhlciB2ZWN0b3IncyBZIGNvbXBvbmVudCBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5WSh2ZWMxKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MjBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmNvcHlZID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnkgPSB2ZWMueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbm90aGVyIHZlY3RvcidzIFggYW5kIFkgY29tcG9uZW50cyBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5KHZlYzEpO1xuICpcbiAqICAgICB2ZWMyLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMCwgeToyMFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy5jb3B5WCh2ZWMpO1xuXHR0aGlzLmNvcHlZKHZlYyk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2ZWN0b3IgdG8gemVybyAoMCwwKVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqXHRcdCB2YXIxLnplcm8oKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDowLCB5OjBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnplcm8gPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueCA9IHRoaXMueSA9IDA7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRvdCh2ZWMyKTtcbiAqICAgICAvLyA9PiAyMzAwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRG90IHByb2R1Y3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZG90ID0gZnVuY3Rpb24gKHZlYzIpIHtcblx0cmV0dXJuIHRoaXMueCAqIHZlYzIueCArIHRoaXMueSAqIHZlYzIueTtcbn07XG5cblZpY3Rvci5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbiAodmVjMikge1xuXHRyZXR1cm4gKHRoaXMueCAqIHZlYzIueSApIC0gKHRoaXMueSAqIHZlYzIueCApO1xufTtcblxuLyoqXG4gKiBQcm9qZWN0cyBhIHZlY3RvciBvbnRvIGFub3RoZXIgdmVjdG9yLCBzZXR0aW5nIGl0c2VsZiB0byB0aGUgcmVzdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigxMDAsIDEwMCk7XG4gKlxuICogICAgIHZlYy5wcm9qZWN0T250byh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHRvIHByb2plY3QgdGhpcyB2ZWN0b3Igb250b1xuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5wcm9qZWN0T250byA9IGZ1bmN0aW9uICh2ZWMyKSB7XG4gICAgdmFyIGNvZWZmID0gKCAodGhpcy54ICogdmVjMi54KSsodGhpcy55ICogdmVjMi55KSApIC8gKCh2ZWMyLngqdmVjMi54KSsodmVjMi55KnZlYzIueSkpO1xuICAgIHRoaXMueCA9IGNvZWZmICogdmVjMi54O1xuICAgIHRoaXMueSA9IGNvZWZmICogdmVjMi55O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuXG5WaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGVEZWcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiByYWRpYW4yZGVncmVlcyh0aGlzLmhvcml6b250YWxBbmdsZSgpKTtcbn07XG5cblZpY3Rvci5wcm90b3R5cGUudmVydGljYWxBbmdsZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIE1hdGguYXRhbjIodGhpcy54LCB0aGlzLnkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS52ZXJ0aWNhbEFuZ2xlRGVnID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gcmFkaWFuMmRlZ3JlZXModGhpcy52ZXJ0aWNhbEFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5hbmdsZSA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlO1xuVmljdG9yLnByb3RvdHlwZS5hbmdsZURlZyA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlRGVnO1xuVmljdG9yLnByb3RvdHlwZS5kaXJlY3Rpb24gPSBWaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiAoYW5nbGUpIHtcblx0dmFyIG54ID0gKHRoaXMueCAqIE1hdGguY29zKGFuZ2xlKSkgLSAodGhpcy55ICogTWF0aC5zaW4oYW5nbGUpKTtcblx0dmFyIG55ID0gKHRoaXMueCAqIE1hdGguc2luKGFuZ2xlKSkgKyAodGhpcy55ICogTWF0aC5jb3MoYW5nbGUpKTtcblxuXHR0aGlzLnggPSBueDtcblx0dGhpcy55ID0gbnk7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZURlZyA9IGZ1bmN0aW9uIChhbmdsZSkge1xuXHRhbmdsZSA9IGRlZ3JlZXMycmFkaWFuKGFuZ2xlKTtcblx0cmV0dXJuIHRoaXMucm90YXRlKGFuZ2xlKTtcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlVG8gPSBmdW5jdGlvbihyb3RhdGlvbikge1xuXHRyZXR1cm4gdGhpcy5yb3RhdGUocm90YXRpb24tdGhpcy5hbmdsZSgpKTtcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlVG9EZWcgPSBmdW5jdGlvbihyb3RhdGlvbikge1xuXHRyb3RhdGlvbiA9IGRlZ3JlZXMycmFkaWFuKHJvdGF0aW9uKTtcblx0cmV0dXJuIHRoaXMucm90YXRlVG8ocm90YXRpb24pO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVCeSA9IGZ1bmN0aW9uIChyb3RhdGlvbikge1xuXHR2YXIgYW5nbGUgPSB0aGlzLmFuZ2xlKCkgKyByb3RhdGlvbjtcblxuXHRyZXR1cm4gdGhpcy5yb3RhdGUoYW5nbGUpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVCeURlZyA9IGZ1bmN0aW9uIChyb3RhdGlvbikge1xuXHRyb3RhdGlvbiA9IGRlZ3JlZXMycmFkaWFuKHJvdGF0aW9uKTtcblx0cmV0dXJuIHRoaXMucm90YXRlQnkocm90YXRpb24pO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkaXN0YW5jZSBvZiB0aGUgWCBheGlzIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5kaXN0YW5jZVgodmVjMik7XG4gKiAgICAgLy8gPT4gLTEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VYID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gdGhpcy54IC0gdmVjLng7XG59O1xuXG4vKipcbiAqIFNhbWUgYXMgYGRpc3RhbmNlWCgpYCBidXQgYWx3YXlzIHJldHVybnMgYW4gYWJzb2x1dGUgbnVtYmVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuYWJzRGlzdGFuY2VYKHZlYzIpO1xuICogICAgIC8vID0+IDEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gQWJzb2x1dGUgZGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWJzRGlzdGFuY2VYID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gTWF0aC5hYnModGhpcy5kaXN0YW5jZVgodmVjKSk7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIG9mIHRoZSBZIGF4aXMgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWSh2ZWMyKTtcbiAqICAgICAvLyA9PiAtMTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpc3RhbmNlWSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0cmV0dXJuIHRoaXMueSAtIHZlYy55O1xufTtcblxuLyoqXG4gKiBTYW1lIGFzIGBkaXN0YW5jZVkoKWAgYnV0IGFsd2F5cyByZXR1cm5zIGFuIGFic29sdXRlIG51bWJlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gQWJzb2x1dGUgZGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWJzRGlzdGFuY2VZID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gTWF0aC5hYnModGhpcy5kaXN0YW5jZVkodmVjKSk7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2UodmVjMik7XG4gKiAgICAgLy8gPT4gMTAwLjQ5ODc1NjIxMTIwODlcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdGFuY2VTcSh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlU3EodmVjMik7XG4gKiAgICAgLy8gPT4gMTAxMDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpc3RhbmNlU3EgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHZhciBkeCA9IHRoaXMuZGlzdGFuY2VYKHZlYyksXG5cdFx0ZHkgPSB0aGlzLmRpc3RhbmNlWSh2ZWMpO1xuXG5cdHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9yIG1hZ25pdHVkZSBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubGVuZ3RoKCk7XG4gKiAgICAgLy8gPT4gMTExLjgwMzM5ODg3NDk4OTQ4XG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBMZW5ndGggLyBNYWduaXR1ZGVcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5zcXJ0KHRoaXMubGVuZ3RoU3EoKSk7XG59O1xuXG4vKipcbiAqIFNxdWFyZWQgbGVuZ3RoIC8gbWFnbml0dWRlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubGVuZ3RoU3EoKTtcbiAqICAgICAvLyA9PiAxMjUwMFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gTGVuZ3RoIC8gTWFnbml0dWRlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmxlbmd0aFNxID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55O1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5tYWduaXR1ZGUgPSBWaWN0b3IucHJvdG90eXBlLmxlbmd0aDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgdHJ1ZSBpZiB2ZWN0b3IgaXMgKDAsIDApXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZlYy56ZXJvKCk7XG4gKlxuICogICAgIC8vID0+IHRydWVcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXMueCA9PT0gMCAmJiB0aGlzLnkgPT09IDA7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSB0cnVlIGlmIHRoaXMgdmVjdG9yIGlzIHRoZSBzYW1lIGFzIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2ZWMxLmlzRXF1YWxUbyh2ZWMyKTtcbiAqXG4gKiAgICAgLy8gPT4gdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmlzRXF1YWxUbyA9IGZ1bmN0aW9uKHZlYzIpIHtcblx0cmV0dXJuIHRoaXMueCA9PT0gdmVjMi54ICYmIHRoaXMueSA9PT0gdmVjMi55O1xufTtcblxuLyoqXG4gKiAjIFV0aWxpdHkgTWV0aG9kc1xuICovXG5cbi8qKlxuICogUmV0dXJucyBhbiBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwLCB5OjIwXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuICd4OicgKyB0aGlzLnggKyAnLCB5OicgKyB0aGlzLnk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9BcnJheSgpO1xuICogICAgIC8vID0+IFsxMCwgMjBdXG4gKlxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBbIHRoaXMueCwgdGhpcy55IF07XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAsIDIwKTtcbiAqXG4gKiAgICAgdmVjLnRvT2JqZWN0KCk7XG4gKiAgICAgLy8gPT4geyB4OiAxMCwgeTogMjAgfVxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9PYmplY3QgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB7IHg6IHRoaXMueCwgeTogdGhpcy55IH07XG59O1xuXG5cbnZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZnVuY3Rpb24gcmFuZG9tIChtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xufVxuXG5mdW5jdGlvbiByYWRpYW4yZGVncmVlcyAocmFkKSB7XG5cdHJldHVybiByYWQgKiBkZWdyZWVzO1xufVxuXG5mdW5jdGlvbiBkZWdyZWVzMnJhZGlhbiAoZGVnKSB7XG5cdHJldHVybiBkZWcgLyBkZWdyZWVzO1xufVxuIl19

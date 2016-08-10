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
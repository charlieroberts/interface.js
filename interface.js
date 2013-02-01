/**#Interface
A singleton object holding all widget constructors and a couple of other methods / properties. It is automatically created as soon as interface.js is loaded.
**/

/**###Interface.extend : method  
This method deep copies all the properties and methods of one object to another.  

param **destination** Object. The object that properties and methods will be inserted into.  
param **source** Object. The object providing the properties and methods for copying.  
**/

/**###Interface.mouseDown : property  
Boolean. This property tells whether the left mouse button (in non-touch browsers) is currently pressed.
**/

/**###Interface.useTouch : property  
Boolean. Whether or not a touch UI browser is being used.
**/

/**###Interface.isAndroid : property  
Boolean. Whether or not the browser is running under Android. This is used to determine the range of accelerometer values generated.
**/
var Interface = {
  extend : function(destination, source) {
    for (var property in source) {
  		var keys = property.split(".");
      
  		if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
  	    destination[property] = source[property].slice(0);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  },
  
  mouseDown : false,
  useTouch : 'ontouchstart' in document.documentElement,
  isAndroid : (function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
  })(),
};

/**#Interface.Panel - Widget
A panel is a container for on-screen widgets. There can be multiple panels in a HTML page. Panels are the starting point for event processing in Interface.js.
**/

/**###Interface.Panel.children : property  
Array. An array of all widgets displayed in the panel
**/

/**###Interface.Panel.shouldDraw : property  
Boolean. Whenever the panel refreshes itself it will redraw widgets found in this array.
**/

/**###Interface.Panel.fps : property  
Number. The number of times the panel should refresh itself per second.
**/

/**###Interface.Panel.useRelativeSizesAndPositions : property  
Boolean. This determines whether widgets in the panel uses sizes/positions relative to the size of the panel or use absolute pixel coordinates.
**/

/**###Interface.Panel.container : property  
HTMLElement. The HTMLElement (such as a div tag) containing the Panel.
**/

/**###Interface.Panel.canvas : property  
HTMLElement. The canvas element that the Panel draws onto. This element is created when the panel is initialized.
**/

/**###Interface.Panel.touchEvent : method  
The starting point for on-screen all touch event handling in a Panel. This method distributes events to all child widgets.  
  
param **event** HTML Touch Event Object.
**/

/**###Interface.Panel.mouseEvent : method  
The starting point for on-screen all mouse event handling in a Panel. This method distributes events to all child widgets.  
  
param **event** HTML Mouse Event Object.
**/

/**###Interface.Panel.init : method  
Initialization method called automatically when panel is instantiated.
**/

/**###Interface.Panel.x : property  
Number. The x position of the panel in absolute coordinates relative to the window.
**/
/**###Interface.Panel.y : property  
Number. The y position of the panel in absolute coordinates relative to the window.
**/
/**###Interface.Panel.width : property  
Number. The width of the panel in pixels
**/
/**###Interface.Panel.width : property  
Number. The height of the panel in pixels
**/

/**###Interface.Panel.draw : method  
This method tells all 'dirty' widgets stored in the shouldDraw property to draw themselves.
**/
/**###Interface.Panel.refresh : method  
Clear the entire panel and then tell all widgets to draw themselves.
**/

/**###Interface.Panel.add : method  
Add a new widget to the panel  
  
param **widget** Object. The widget to be added. Motion widgets do not need to be added to the Panel
**/

/**###Interface.Panel.setBackgroundColor : method  
Set the background color the panel using a css color value.  
  
param **cssColor** String. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)'.
**/

/**###Interface.Panel.background : property  
String. The default background color for all widgets in the panel. THIS IS NOT THE BACKGROUND COLOR FOR THE PANEL. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
/**###Interface.Panel.fill : property  
String. The default fill color for all widgets in the panel. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
/**###Interface.Panel.stroke : property  
String. The default stroke color for all widgets in the panel. Any valid css color, such as 'red', '#f00', or 'rgb(255,0,0)' can be assigned to this property.
**/
Interface.Panel = function() {
  var self = this,
      _container = arguments.length >= 1 ? arguments[0].container : undefined;

  Interface.extend(this, {
    children:     [],
    shouldDraw :  [],
    fps : 60,
    useRelativeSizesAndPositions : true,
    
    container: (function() {
      if(typeof _container === 'undefined') {
        $('body').css({
          margin : 0,
          padding: 0,
        });
        
        var d = $('<div id="container">');
        d.css({
          width:$(window).width(),
          height:$(window).height(),
          display:'block',
          margin:0,
          padding:0,
          position:'absolute',
          left:0,
          top:0
        });
        
        $('body').append(d);
        
        return d;
      }else{
        return _container;
      }
    })(),
    
    canvas:  document.createElement('canvas'),
    
    touchEvent : function(event) {
      event.preventDefault();
      //console.log(event);
      for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);		
        
        for(var i = 0; i < self.children.length; i++) {
          touch.x = touch.pageX - self.x;
          touch.y = touch.pageY - self.y;
          touch.type = event.type;
          self.children[i].touchEvent(touch);
        }
    		//var breakCheck = this.events[event.type].call(this, touch);
		
        //if(breakCheck) break;
    	}
      

      //e.preventDefault();
    },
    
    mouseEvent : function(e) {
      if(e.type === 'mousedown') {
        Interface.mouseDown = true;
      }else if(e.type === 'mouseup') {
        Interface.mouseDown = false;
      }
      
      e.x = e.pageX - self.x;
      e.y = e.pageY - self.y;
      
      for(var i = 0; i < self.children.length; i++) {
        self.children[i].mouseEvent(e);
      }
    },
    
    init : function() {
      // remove margin from body if no container element is provided
      // if(typeof _container === 'undefined') {
      //   $(this.container).css({
      //     'margin': '0px',
      //   });
      // }
      this.width  = parseFloat( $(this.container).css('width') );
      this.height = parseFloat( $(this.container).css('height'));
      this.x      = parseFloat( $(this.container).css('left') );
      this.y      = parseFloat( $(this.container).css('top') );
      
      if( isNaN(this.x) ) this.x = 0;
      if( isNaN(this.y) ) this.y = 0;      
      
      console.log(this.width, this.height);
      $(this.canvas).attr({
        'width':  this.width,
        'height': this.height,
      });

      $(this.container).css({ 'user-select': 'none', '-webkit-user-select': 'none'});
      
      $(this.container).append(this.canvas);
      
      this.ctx = this.canvas.getContext( '2d' );
      
      if(Interface.useTouch) {
        $(this.container).on( 'touchstart', this.touchEvent );
        $(this.container).on( 'touchmove',  this.touchEvent );
        $(this.container).on( 'touchend',   this.touchEvent );
      }else{
        $(this.container).on( 'mousedown', this.mouseEvent );
        $(this.container).on( 'mousemove', this.mouseEvent );
        $(this.container).on( 'mouseup',   this.mouseEvent );                
      }
    },
    
    draw : function() {
      for(var i = 0; i < this.shouldDraw.length; i++) {
        this.shouldDraw[i].draw();
      }
      this.shouldDraw.length = 0;
    },
    
    refresh: function() {
      this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
      for(var i = 0; i < this.children.length; i++) {
        this.children[i].draw();
      }
    },
    
    add: function() {
      for(var i = 0; i < arguments.length; i++) {
        var widget = arguments[i];
        
        widget.panel =      this;
        widget.canvas =     this.canvas;
        widget.container =  this.container;
        widget.ctx =        this.ctx;
        
        this.children.push( widget );
        if(widget._init) widget._init();
        
        widget.draw();
      }
    },
    
    setBackgroundColor : function(color) {
      $(this.container).css({ backgroundColor:color });
    },
  });
  
  if(typeof arguments[0] !== 'undefined') Interface.extend(this, arguments[0]);
  
  this.init();

  this.timer = setInterval( function() { self.draw(); }, Math.round(1000 / this.fps) );

  var background ='#444',
      fill = '#888',
      stroke = '#ccc',
      self = this;
      
  Object.defineProperties(this, {
    'background': {
      get: function() { return background; },
      set: function(val) { 
        background = val;
        self.refresh();
      },
    },
    'stroke': {
      get: function() { return stroke; },
      set: function(val) { 
        stroke = val;
        self.refresh();
      },
    },
    'fill': {
      get: function() { return fill; },
      set: function(val) { 
        fill = val;
        self.refresh();
      },
    }
  });
};

var widgetDefaults = {
  hasFocus      : false,
  requiresFocus : true,
  min           : 0,
  max           : 1,
  value         : 0,
  lastValue     : null,
  events : {
    ontouchstart  : null,
    ontouchmove   : null,
    ontouchend    : null,
    onmousedown   : null,
    onmousemove   : null,
    onmouseup     : null,
    ontouchmousedown : null,
    ontouchmousemove : null,    
    ontouchmouseup : null,    
    onvaluechange : null,
  },
}

var convertMouseEvent = function(eventName) {
  switch(eventName) {
    case 'mousedown':
      return 'touchmousedown';
    case 'mousemove':
      return 'touchmousemove';
    case 'mouseup':
      return 'touchmouseup';
    default:
      return eventName;
  }
};

var convertTouchEvent = function(eventName) {
  switch(eventName) {
    case 'touchstart':
      return 'touchmousedown';
    case 'touchmove':
      return 'touchmousemove';
    case 'touchend':
      return 'touchmouseup';
    default:
      return eventName;
  }
};

/**#Interface.Widget - Widget
The prototype object for all Interface.js widgets. These methods and properties are inherited by all widgets.
**/

/**###Interface.Widget.x : property  
Number. The horizontal position of the widget inside of its parent panel. By default, this position is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.y : property  
Number. The vertical position of the widget inside of its parent panel. By default, this position is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.width : property  
Number. The width of the widget. By default, this is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.height : property  
Number. The width of the widget. By default, this is determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.bounds : property  
Array. A shorthand to set x,y,width and height simultaneously upon initialization. By default, these values are determined relative to the size of the widget's containing panel, but absolute values can also be used if the panel's useRelativeSizesAndPositions property is set to false.
**/
/**###Interface.Widget.min : property  
Number. Default 0. The minimum value the widget should output.
**/
/**###Interface.Widget.max : property  
Number. Default 1. The maximum value the widget should output.
**/
/**###Interface.Widget.ontouchstart : method  
Function. A user defined event handler for whenever a touch begins over a widget.
**/
/**###Interface.Widget.ontouchmove : method  
Function. A user defined event handler for whenever a touch moves over a widget.
**/
/**###Interface.Widget.ontouchend : method  
Function. A user defined event handler for whenever a touch ends.
**/
/**###Interface.Widget.onmousedown : method  
Function. A user defined event handler for whenever a mouse press occurs over a widget.
**/
/**###Interface.Widget.onmousemove : method  
Function. A user defined event handler for whenever a mouse moves over a widget while its button is pressed.
**/
/**###Interface.Widget.onmouseup : method  
Function. A user defined event handler for whenever a mouse press ends.
**/
/**###Interface.Widget.ontouchmousedown : method  
Function. A user defined event handler for whenever a mouse press or touch occurs over a widget.
**/
/**###Interface.Widget.ontouchmousemove : method  
Function. A user defined event handler for whenever a mouse or touch moves over a widget.
**/
/**###Interface.Widget.ontouchmouseup : method  
Function. A user defined event handler for whenever a mouse press ends or a touch leaves the screen.
**/

/**###Interface.Widget.init : method  
This method is called as soon as widgets are created. It copies properties passed in the constructor to the widget and also copies some default property values.  
  
param **options** Object. A dictionary of options for the widget to be initilized with.
**/
/**###Interface.Widget.refresh : method  
Tell the widget to redraw itself. This method adds the widget to the shouldDraw array of the parent panel.
**/
/**###Interface.Widget.setValue : method  
Programmatically change the value of the widget. You can optionally not have the widget redraw itself when calling this method.  
  
param **value** Number or String. The new value for the widget.  
param **doNotDraw** Optional, default false. Whether or not the widget should redraw itself.
**/
/**###Interface.Widget.hitTest : method  
Given an HTML touch or mouse event, determine if the event overlaps a graphical widget.  
  
param **event** HTMLEvent. The touch or mouse event to check
**/
/**###Interface.Widget.hitTest : method  
Given an HTML touch or mouse event, determine if the event overlaps a graphical widget.  
  
param **event** HTMLEvent. The touch or mouse event to check
**/
/**###Interface.Widget.draw : method  
Tell the widget to draw itself. This method must be overridden by every graphical widget.
**/
/**###Interface.Widget.mouseEvent : method  
The default mouse event handler for the widget. This method also calls any user defined mouse event handlers. This method should probably never be called manually, but you might want to override it.
  
param **event** HTMLEvent. The mouse event to process
**/
/**###Interface.Widget.mouseEvent : method  
The default touch event handler for the widget. This method also calls any user defined touch event handlers. This method should probably never be called manually, but you might want to override it.
  
param **event** HTMLEvent. The touch event to process
**/
/**###Interface.Widget.sendTargetMessage : method  
If the widget has a target and key property, set the key property or call the key method on the target using the widgets current value.
**/
/**###Interface.Widget._background : method  
returns Color. If the widget has a background color specified, return that, otherwise return the background color of the widget's parent panel.
**/
/**###Interface.Widget._stroke : method  
returns Color. If the widget has a stroke color specified, return that, otherwise return the stroke color of the widget's parent panel.
**/
/**###Interface.Widget._fill : method  
returns Color. If the widget has a fill color specified, return that, otherwise return the fill color of the widget's parent panel.
**/

/**###Interface.Widget._x : method  
returns Number. Return the widget's x position as a pixel value relative to the position of the panel. Note that this method will always return the pixel value, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._y : method  
returns Number. Return the widget's y position as a pixel value relative to the position of the panel. Note that this method will always return the pixel value, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._width : method  
returns Number. Return the widget's width. Note that this method will always return a size in pixels, even if the panel uses relative values to determine sizes and positions.
**/
/**###Interface.Widget._height : method  
returns Number. Return the widget's height. Note that this method will always return a size in pixels, even if the panel uses relative values to determine sizes and positions.
**/

Interface.Widget = {
  init : function( options ) {        
    Interface.extend( this, widgetDefaults);
    
    Interface.extend( this, options);
    
    if(this.bounds) {
      this.x = options.bounds[0];
      this.y = options.bounds[1];
      this.width  = options.bounds[2];
      this.height = options.bounds[3];
    }
      
    if(this.colors) {
      this.background = options.colors[0];
      this.fill       = options.colors[1];
      this.stroke     = options.colors[2];                
    }
    
    this.focusedTouches = [];
  },
  
  refresh : function() {
    if(this.panel.shouldDraw.indexOf(this) === -1) {
      this.panel.shouldDraw.push(this);
    }
  },
  
  setValue : function(value, doNotDraw) {
    var r = this.max - this.min,
        v = value;
        
    this.value = value;
                
    if(this.min !== 0 || this.max !== 1) {
      v -= this.min;
      this._value = v / r;
    }else{
      this._value = this.value;
    }
    
    if(!doNotDraw) this.refresh();
  },
  
  hitTest : function(e) {
    if(e.x >= this._x() && e.x < this._x() + this._width()) {
    	if(e.y >= this._y() && e.y < this._y() + this._height()) {  
    		return true;
    	} 
    }
    
    return false;
  },
  
  mouseEvent : function(e) { 
    var isHit = this.hitTest(e);
    var touchMouseName = convertMouseEvent(e.type);
    
    if(isHit || this.hasFocus || !this.requiresFocus) {
      if(e.type === 'mousedown') this.hasFocus = true;
      
      if(this[e.type]) this[e.type](e, isHit);  // normal event
      
      if(this['on'+e.type]) this['on'+e.type](e, isHit); // user defined event
      if(this['on'+touchMouseName]) this['on'+touchMouseName](e, isHit);  // user defined event
    }
    if(e.type === 'mouseup') this.hasFocus = false;
  },
  
  touchEvent : function(touch) {  // event type is stored in touch by Panel
    var isHit = this.hitTest(touch);
    var touchMouseName = convertTouchEvent(touch.type);
    if(isHit || this.hasFocus || !this.requiresFocus) {
      if(touch.type === 'touchstart') {
        this.focusedTouches.push(touch);
        this.hasFocus = true;
      }
      if(this[touch.type])
        this[touch.type](touch, isHit);  // normal event
      
      if(this['on'+touch.type]) this['on'+touch.type](touch, isHit);          // user defined event
      if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
    }
    if(touch.type === 'touchend') {
      for(var i = 0; i < this.focusedTouches.length; i++) {
        if(this.focusedTouches[i].id === touch.id) {
          this.focusedTouches.splice(i, 1);
          if(this.focusedTouches.length === 0) this.hasFocus = false;
          break;
        }
      }
    }
  },
  
  draw : function() {},
  
  sendTargetMessage : function() {
    if(this.target && this.key) {
      if(typeof this.target[this.key] === 'function') {
        this.target[this.key]( this.value );
      }else{
        this.target[this.key] = this.value;
      }
    }  
  },
  
  _background : function() { return this.background || this.panel.background; },
  _stroke : function() { return this.stroke || this.panel.stroke; },
  _fill : function() { return this.fill || this.panel.fill; },
  
  _x : function() { return this.panel.useRelativeSizesAndPositions ? this.x * this.panel.width : this.x; },
  _y : function() { return this.panel.useRelativeSizesAndPositions ? this.y * this.panel.height : this.y; },
  _width  : function() { return this.panel.useRelativeSizesAndPositions ? this.width * this.panel.width : this.width; },
  _height : function() { return this.panel.useRelativeSizesAndPositions ? this.height * this.panel.height : this.height; },
};

/**#Interface.Slider - Widget
A vertical or horizontal slider.

## Example Usage##
`a = new Interface.Slider({ bounds:[0,0,1,.2], isVertical:false });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Slider.isVertical : property
Boolean. Whether or not the slider draws itself vertically or horizontally. Note this does not affect the boundaries of the slider, just the orientation of the slider's movement.
**/

Interface.Slider = function() {
  Interface.extend(this, {
    isVertical : true,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );
      
      this.ctx.fillStyle = this._fill();
      
      if(this.isVertical) {
        this.ctx.fillRect( x, y + height - this._value * height, width, this._value * height);
      }else{
        this.ctx.fillRect( x, y, width * this._value, height);
      }
      
      if(this.label) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.label, x + width / 2, y + height / 2);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        
        this._value = this.isVertical ? 1 - (yOffset / this._height()) : xOffset / this._width();
        
        if(this._value < 0) {
          this._value = 0;
          // this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          // this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
        
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
  })
  .init( arguments[0] );
};
Interface.Slider.prototype = Interface.Widget;

/**#Interface.Crossfader - Widget
A horizontal crossfader.

## Example Usage##
`a = new Interface.Crossfader({ bounds:[0,0,1,.2], crossfaderWidth:20 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Crossfader.crossfaderWidth : property
Boolean. The width of the rectangle indicating the current position of the crossfader, in pixel values. TODO: use relative values when used by the panel.
**/
Interface.Crossfader = function() {
  Interface.extend(this, {
    crossfaderWidth: 30,
    _value : .5,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( x, y, width, height );
      
      this.ctx.fillStyle = this._fill();
      this.ctx.fillRect( x + (width - this.crossfaderWidth) * this._value, y, this.crossfaderWidth, height);
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = xOffset / this._width();
        
        if(this._value < 0) {
          this._value = 0;
          //this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          //this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
                
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
  })
  .init( arguments[0] );
};
Interface.Crossfader.prototype = Interface.Widget;

/**#Interface.Button - Widget
A button with a variety of on/off modes

## Example Usage##
`a = new Interface.Button({ bounds:[0,0,.25,.25], mode:'contact', label:'test' });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Button.mode : property
String. Can be 'toggle', 'momentary' or 'contact'. In toggle mode, the button turns on when it is pressed and off when it is pressed again. In momentary mode, the button turns on when pressed and off when released. In contact mode, the button briefly flashes when pressed and sends its value.
**/
/**###Interface.Button.label : property
String. A text label to print in the center of the button.
**/
Interface.Button = function() {
  Interface.extend(this, {
    _value: 0,
    mode : 'toggle',
    isMouseOver : false,
    isTouchOver : false,
    label : null,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      if(this._value) {
        this.ctx.fillStyle = this._fill();
      }else{
        this.ctx.fillStyle = this._background();  
      }
      this.ctx.fillRect( x, y, width, height );
      
      if(this.label !== null) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.label, x + width / 2, y + height / 2);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( x, y, width, height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = !this._value;
        
        this.value = this._value ? this.max : this.min;
                
        if(this.value !== this.lastValue || this.mode === 'contact') {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e, hit) {
      if(hit && Interface.mouseDown) {
        this.isMouseOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    mousemove : function(e, hit) { 
      if(!this.requiresFocus && hit && Interface.mouseDown && !this.isMouseOver) {
        this.isMouseOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isMouseOver) {
        this.isMouseOver = false;
      }
    },
    mouseup   : function(e) {
      if(this.mode === 'momentary')
        this.changeValue();// e.x - this.x, e.y - this.y ); 
    },
    
    touchstart : function(e, hit) {
      if(hit) {
        this.isTouchOver = true;
        this.changeValue();
        if(this.mode === 'contact') {
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    touchmove : function(e, hit) {
      if(!this.requiresFocus && hit && !this.isTouchOver) {
        this.isTouchOver = true;
        if(this.mode !== 'contact') {
          this.changeValue();// e.x - this.x, e.y - this.y );
          
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }else if(!hit && this.isTouchOver) {
        this.isTouchOver = false;
      }
    },
    touchend   : function(e) {
      this.isTouchOver = false;
      if(this.mode === 'momentary')
        this.changeValue();// e.x - this.x, e.y - this.y ); 
    },
  })
  .init( arguments[0] );
};
Interface.Button.prototype = Interface.Widget;

/**#Interface.Knob - Widget
A virtual knob. Great.

## Example Usage##
`a = new Interface.Knob({ x:.1, y:.1, radius:.3 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Knob.radius : property
Number. The size of the Knob.
**/
/**###Interface.Knob.knobBuffer : property
Number. The size of the space in the middle of the knob.
**/
/**###Interface.Knob.centerZero : property
Number. If true, the knob is centered at zero. Useful for panning knobs.
**/
/**###Interface.Knob.useRotation : property
Number. If true, the knob value is determined by the slope of the touch or mouse event in relation to the knob. When false, the user simply presses the knob and moves their finger/mouse up and down to change its value.
**/

Interface.Knob = function() {
  Interface.extend(this, {
    _value: 0,
    radius: 30,
    knobBuffer:15,
    lastPosition: 0,
    
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
      //this.canvasCtx.clearRect(0, 0, this.width,this.height);
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.lineWidth = 1.5;
	
    	this.ctx.fillStyle = this._background(); // draw background of widget first
    
      var angle0 = Math.PI * .6;
      var angle1 = Math.PI * .4;

      this.ctx.beginPath();
      this.ctx.arc(x + this.radius, y + this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(x + this.radius, y + this.radius, (this.radius - this.knobBuffer) * .3 , angle1, angle0, true);		
      this.ctx.closePath();
      this.ctx.fill();
          
      this.ctx.fillStyle = this._fill();	// now draw foreground...
	
      if(this.centerZero) {
          var angle3 = Math.PI * 1.5;
          var angle4;
          if(this._value >= .5) {
            angle4 = Math.PI * (1.5 + (this._value - .5) * 1.8); // from 1.5 to 2.4
          }else{
            angle4 = Math.PI * (1.5 - ((1 - this._value * 2) * .9)); // from 1.5 to .6 
          }
          if(this._value > Math.PI * 1.8) this._value -= Math.PI * 1.8; // wrap around      
        
          this.ctx.beginPath();
          this.ctx.arc(x + this.radius, y + this.radius, this.radius -  this.knobBuffer, angle3, angle4, (this._value < .5));
          this.ctx.arc(x + this.radius, y + this.radius, (this.radius - this.knobBuffer) * 0.3,  angle4, angle3, (this._value > .5));
          this.ctx.closePath();
          
          // if(this._value > .495 && this._value < .505) { // draw circle if centered?
          //     this.ctx.beginPath();
          //     this.ctx.arc(this.x + this.radius , this.y + this.radius, (this.radius -  this.knobBuffer) * .3, 0, Math.PI*2, true); 
          //     this.ctx.closePath();
          // }
          this.ctx.fill();
      } else {
          if(!this.isInverted)  { 
            var angle2 = Math.PI * .6 + this._value * 1.8  * Math.PI;
            if(angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI;
          }else{
            var angle2 = Math.PI * (0.4 - (1.8 * this._value));
          }
        
          this.ctx.beginPath();
          
          if(!this.isInverted) {
              this.ctx.arc(x + this.radius, y + this.radius, this.radius - this.knobBuffer, angle0, angle2, false);
              this.ctx.arc(x + this.radius, y + this.radius, (this.radius - this.knobBuffer) * .3, angle2, angle0, true);
          } else {
              this.ctx.arc(x + this.radius, y + this.radius, this.radius - this.knobBuffer, angle1, angle2 ,true);
              this.ctx.arc(x + this.radius, y + this.radius, (this.radius - this.knobBuffer) * .3, angle2, angle1, false);
          }
          this.ctx.closePath();
          this.ctx.fill();
      }
      
      this.ctx.beginPath();
      this.ctx.arc(x + this.radius, y + this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(x + this.radius, y + this.radius, (this.radius - this.knobBuffer) * .3 , angle1, angle0, true);		
      this.ctx.closePath();
      
      this.ctx.stroke();
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this.lastValue = this.value;

        if(!this.usesRotation) {
          if (this.lastPosition != -1) { 
            this._value -= (yOffset - this.lastPosition) / (this.radius * 2);
          }
        }else{
            var xdiff = ((this.radius)) - xOffset;
            var ydiff = ((this.radius)) - yOffset;
            var angle = Math.PI + Math.atan2(ydiff, xdiff);
            this._value =  ((angle + (Math.PI * 1.5)) % (Math.PI * 2)) / (Math.PI * 2);
            
            if(this.lastRotationValue > .8 && this._value < .2) {
              this._value = 1;
            }else if(this.lastRotationValue < .2 && this._value > .8) {
              this._value = 0;
            }
        }

        if (this._value > 1) this._value = 1;
        if (this._value < 0) this._value = 0;

      	this.lastRotationValue = this._value;
        this.lastPosition = yOffset;
      
        var range  = this.max - this.min;
        this.value = this.min + this._value * range;
      
        if(this.value !== this.lastValue) {
          this.sendTargetMessage();
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }
    },
    
    hitTest : function(e) {
      if(e.x >= this._x() && e.x < this._x() + this.radius * 2) {
      	if(e.y >= this._y() && e.y < this._y()  + this.radius * 2) {  
      		return true;
      	} 
      }
    
      return false;
    },
    
    mousedown : function(e) {
      this.lastPosition = e.y - this._y();
      this.changeValue( e.x - this._x(), e.y - this._y() ); 
    },
    mousemove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e) {},
    
    touchstart : function(e) {
      this.lastPosition = e.y - this._y();
      this.changeValue( e.x - this._x(), e.y - this._y() ); 
    },
    touchmove : function(e) { this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e) {},
    
    _init : function() {
      if(this.panel.useRelativeSizesAndPositions && this.radius < 1) {
        this.radius = this.panel.width * this.radius;
        this.draw();
      }
    },
  })
  .init( arguments[0] );
  

};
Interface.Knob.prototype = Interface.Widget;

function sign(n) {
  if(n < 0) return -1;
  return 1;
}
/**#Interface.XY - Widget
A multitouch XY controller with optional built-in physics.

## Example Usage##
`a = new Interface.XY({ x:0, y:0, numChildren:2 });  
panel = new Interface.Panel();
panel.add(a);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.XY.childWidth : property
Number. The size of the children, currently in pixels. TODO: use relative values when the panel is using relative sizes and positions.
**/
/**###Interface.XY.usePhysics : property
Boolean. Wheter or not the physics engine should be turned on.
**/
/**###Interface.XY.friction : property
Number. Default .9. The amount of friction in the physics system. High values mean children will decelerate quicker.
**/
/**###Interface.XY.maxVelocity : property
Number. Default 10. The maximum velocity for each child.
**/
/**###Interface.XY.detectCollisions : property
Boolean. Default true. When true, children bounce off one another.
**/
/**###Interface.XY.values : property
Array. An array of objects taking the form {x,y} that store the x and y positions of every child. So, to get the x position of child #0: myXY.values[0].x
**/
/**###Interface.XY.children : property
Array. An array of objects representing the various children of the widget.
**/
/**###Interface.XY.animate : method
This is called to run the physics engine, draw widgets with updated positions, change values of widgets and call appropriate event handlers.
**/

Interface.XY = function() {
  var self = this,
      posDiff = {x:0, y:0},
      velDiff = {x:0, y:0},
      normal  = {x:0, y:0},
      cDot = 0;
  
  Interface.extend(this, {
    _value            : 0,
    childWidth        : 25,
    childHeight       : 25,
    children          : [],
    values            : [],
    numChildren       : 1,
    usePhysics        : true,
    friction          : .9,
    activeTouch       : null,
    maxVelocity       : 10,
    detectCollisions  : true,
    touchCount        : 0,
    
    animate : function() {
      var x       = this._x(),
          y       = this._y(),
          width   = this._width(),
          height  = this._height(),
          shouldrunvaluechange = false;
          
      for(var i = 0; i < this.children.length; i++) {
        var moveX = moveY = false,
            child = this.children[i];
        
        if(child.x + child.vx < width && child.x + child.vx > 0) {
          child.x += child.vx;
        }else{  
          if(child.x + child.vx >= width && child.vx > 0 ) {
            child.vx *= -1;
          }else if(child.x + child.vx <= 0 && child.vx < 0) {
            child.vx *= -1;
          }else{
            child.x += child.vx;
          }
        }

        if(child.y + child.vy < height && child.y + child.vy > 0) {
          child.y += child.vy;
        }else{
          if(child.y + child.vy >= height && child.vy > 0 ) {
            child.vy *= -1;
          }else if(child.y + child.vy <= 0 && child.vy < 0) {
            child.vy *= -1;
          }else{
            child.y += child.vy;
          }
        }

        child.vx *= this.friction;
        child.vy *= this.friction;
        
        var newValueX = child.x / width;
        var newValueY = child.y / height;
        
        var range = this.max - this.min;
        if(this.values[child.id].x !== newValueX || this.values[child.id].y !== newValueY) {
          this.values[child.id].x = this.min + range * newValueX;
          this.values[child.id].y = this.min + range * newValueY;
          shouldrunvaluechange = true;
        }
        
        if(this.detectCollisions) {
          if(!child.collideFlag) {
            this.collisionTest(child);
          }else{
            child.collideFlag = false;
          }
        }
          
        child.vx = Math.abs(child.vx) > this.maxVelocity ? this.maxVelocity * sign(child.vx) : child.vx;
        child.vy = Math.abs(child.vy) > this.maxVelocity ? this.maxVelocity * sign(child.vy): child.vy;        
      }
      if(shouldrunvaluechange && this.onvaluechange) {
        this.onvaluechange();
      }
    },
    
    collisionTest : function(c1) {
      var cw2 = (this.childWidth * 2) * (this.childWidth * 2);
      for(var i = 0; i < this.children.length; i++) {
        var c2 = this.children[i];
        if(c1.id !== c2.id) {
          var distance = Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2);
          
          if(distance < cw2) { // avoid square root by raising the distance check
            this.collide(c1, c2)
          }
        }
      }
    },
  
    collide : function(c1,c2) {
      // posDiff, velDiff and normal are upvalues for gc performance
      posDiff.x = c1.x - c2.x;
      posDiff.y = c1.y - c2.y;
      velDiff.x = c1.vx - c2.vx;
      velDiff.y = c1.vy - c2.vy;

      cDot = Math.sqrt( Math.pow(posDiff.x, 2) + Math.pow(posDiff.y, 2) );
            
      normal.x = posDiff.x / cDot;
      normal.y = posDiff.y / cDot;
      
      var d = (normal.x * velDiff.x) + (normal.y * velDiff.y);
      c2.vx = c1.vx + d * normal.x;
      c2.vy = c1.vy + d * normal.y;
      c1.vx = c2.vx - d * normal.x;
      c1.vy = c2.vy - d * normal.y;

      c2.x -= normal.x;
      c2.y -= normal.y;
      c1.x += normal.x;
      c1.y += normal.y;
      
      c1.vx = Math.abs(c1.vx) > this.maxVelocity ? this.maxVelocity * sign(c1.vx) : c1.vx;
      c1.vy = Math.abs(c1.vy) > this.maxVelocity ? this.maxVelocity * sign(c1.vy) : c1.vy;
      c2.vx = Math.abs(c2.vx) > this.maxVelocity ? this.maxVelocity * sign(c2.vx) : c2.vx;
      c2.vy = Math.abs(c2.vy) > this.maxVelocity ? this.maxVelocity * sign(c2.vy) : c2.vy;
      
      c1.collideFlag = true;
      c2.collideFlag = true;         
    },

    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      if(this.usePhysics) {
        this.animate();
      }

      this.ctx.fillStyle = this._background();
      //this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.strokeRect( this.x, this.y, this.width, this.height );
      
      this.ctx.save();
      
      this.ctx.beginPath();
      
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + width, y);
      this.ctx.lineTo(x + width, y + height);
      this.ctx.lineTo(x, y + height);
      this.ctx.lineTo(x, y);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.clip();
      
      this.ctx.fillStyle = this._fill();
      
      for(var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        
        this.ctx.fillStyle = this._fill();
        
        this.ctx.beginPath();

        this.ctx.arc(x + child.x, y + child.y, this.childWidth, 0, Math.PI*2, true); 

        this.ctx.closePath();
        
        this.ctx.fill();
        this.ctx.stroke();
        //this.ctx.fillRect( this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = this._stroke();
        this.ctx.fillText(child.id, x + child.x, y + child.y);
      }
      
      this.ctx.closePath();
      this.ctx.restore();
    },
    
    changeValue : function( touch, xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        touch.x = xOffset;
        if(touch.x < 0 ) touch.x = 0;
        if(touch.x > this._width()) touch.x = this._width();
                
        touch.y = yOffset;// - this.half;
        if(touch.y < 0) touch.y = 0;
        if(touch.y > this._height()) touch.y = this._height();        
        this.values[touch.id].x = xOffset / this._width();
        this.values[touch.id].y = yOffset / this._height();
                
        if(this.onvaluechange) this.onvaluechange();
        
        if(!this.usePhysics) {
          this.refresh();
        }
      }     
    },
    
    makeChildren : function() {
      for(var i = 0; i < this.numChildren; i++) {
        this.children.push({ id:i, x:Math.random() * this._width(), y:Math.random() * this._height(), vx:0, vy:0, collideFlag:false, isActive:false, lastPosition:null, });
        this.values.push({ x:null, y:null });
      }
    },
    
    touchEvent : function(touch) {
      var isHit = this.hitTest(touch);
      var touchMouseName = convertTouchEvent(touch.type);
      
      if(isHit) {
        if(touch.type === 'touchstart') {
          this.hasFocus = true;
          this.touchCount++;
          this.trackTouch(touch.x - this._x(), touch.y - this._y(), touch);
        }else{
          if(this[touch.type])
            this[touch.type](touch, isHit, touch.childID);  // normal event
        }
        
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
        
      }else if(touch.type === 'touchend'){
        this.touchCount--;
        if(this.touchCount === 0) {        
          this.hasFocus = false;
        }else if(this.touchCount < 0 ) {
          this.touchCount = 0;
        }
        this.touchend(touch)
        if(this['on'+touch.type]) this['on'+touch.type](touch, isHit, touch.childId); // user defined event
        if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
      }
    },
    
    trackMouse : function(xPos, yPos, id) {
      var closestDiff = 10000;
      var touchFound = null;
      var touchNum = null;
      for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs(touch.x - xPos);
        var ydiff = Math.abs(touch.y - yPos);
        
        if(xdiff + ydiff < closestDiff) {
          closestDiff = xdiff + ydiff;
            
          touchFound = touch;
          touchNum = i;
        }
      }
      
      touchFound.isActive = true;
      touchFound.vx = 0;
      touchFound.vy = 0;
      
      if(touchFound != null) {
        this.changeValue(touchFound, xPos, yPos);
      }
      
      this.activeTouch = touchFound;
      this.activeTouch.lastTouch = null;
      
      this.lastTouched = touchFound;
    },
    
    mousedown : function(e) {
      if(this.hitTest(e)) {
        this.trackMouse(e.x - this._x(), e.y - this._y());
      }
    },
    mousemove : function(e) { 
      if(this.hitTest(e) && this.activeTouch !== null) {
        if(this.activeTouch.lastTouch === null) {
          this.activeTouch.lastTouch = {x:e.x - this._x(), y:e.y - this._y()};
        }else{
          var now = {x:e.x - this._x(), y:e.y - this._y()};
          this.activeTouch.velocity = {x:now.x - this.activeTouch.lastTouch.x, y:now.y - this.activeTouch.lastTouch.y };
          this.activeTouch.lastTouch = now;
        }

        this.changeValue(this.activeTouch, e.x - this._x(), e.y - this._y());
      }
    },
    mouseup   : function(e) {
      if(this.activeTouch !== null) {
        this.activeTouch.vx = this.activeTouch.velocity.x;
        this.activeTouch.vy = this.activeTouch.velocity.y;
        this.activeTouch.lastTouch = null;
        this.activeTouch = null;
      }
      for(var i = 0; i < this.children.length; i++) {
        this.children[i].isActive = false;
      }
    },
    
    trackTouch : function(xPos, yPos, _touch) {
      var closestDiff = 10000;
      var touchFound = null;
      var touchNum = null;
      
      for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs(touch.x - xPos);
        var ydiff = Math.abs(touch.y - yPos);

        if(xdiff + ydiff < closestDiff && !touch.isActive) {
          closestDiff = xdiff + ydiff;
          touchFound = touch;
          touchNum = i;
        }
      }
      
      touchFound.isActive = true;
      touchFound.vx = 0;
      touchFound.vy = 0;
      touchFound.identifier = _touch.identifier;
      touchFound.childID = touchNum;
	
      if(touchFound != null)
        this.changeValue(touchFound, xPos, yPos);
    
      this.lastTouched = touchFound;
      return touchFound.childID;
    },
    touchstart : function(touch) {
      // if(this.hitTest(touch)) {
      //   this.trackTouch(touch.x - this.x, touch.y - this.y, touch);
      // }
    },
    touchmove : function(touch) {
      for(var t = 0; t < this.children.length; t++) {
        _t = this.children[t];
        if(touch.identifier == _t.identifier) {
          this.changeValue(_t, touch.x - this._x(), touch.y - this._y());
			    
          var now = {x:touch.x - this._x(), y:touch.y - this._y()};
          
          if(_t.lastPosition !== null) {
            _t.velocity = {x:now.x - _t.lastPosition.x, y:now.y - _t.lastPosition.y };
          }
          _t.lastPosition = now;
        }
      }
    },
    touchend : function(touch) {
      var found = false;
      var tu = null;
      for(var t = 0; t < this.children.length; t++) {
        var _t = this.children[t];
        
        if(touch.identifier === _t.identifier) {
          _t.vx = _t.velocity.x;
          _t.vy = _t.velocity.y;
          
          _t.lastPosition = null;
          _t.isActive = false;
          

          found = true;
          tu = t.childID;
        }
      }
      if(found) { this.touchUp = tu; }
      //if(!found) console.log("NOT FOUND", touch.identifier);
    },
    
    startAnimation : function() { this.timer = setInterval( function() { self.refresh(); }, 30); },
    stopAnimation : function() { clearInterval(this.timer); },
    
    _init : function() { 
      this.makeChildren();
      if(this.usePhysics) this.startAnimation();
     },
  })
  .init( arguments[0] );
  
  this.requiresFocus = false; // is a widget default... must set after init.
  this.half = this.childWidth / 2;  
};
Interface.XY.prototype = Interface.Widget;

/**#Interface.Menu - Widget
A multi-option dropdown menu.
## Example Usage##
`a = new Interface.Menu({x:0, y:0, options:['red', 'yellow', 'green'] });  
a.onvaluechange = function() { b.background = this.value; }  
b = new Interface.Slider({x:.5, y:.5, width:.2, height:.3});  
panel = new Interface.Panel();  
panel.add(a,b);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the slider on initialization.
- - - -
**/
/**###Interface.Menu.options : property
Array. A list of values found in the menu.
**/
/**###Interface.Menu.css : property
Object. A dictionary of css keys / values to be applied to the menu.
**/
/**###Interface.Menu.onvaluechange : method
The event handler fired whenever the selected menu option changes.  
  
param **newValue** Number or String. The new menu value.
param **oldValue** Number or String. The previous menu value.
**/
Interface.Menu = function() {
  Interface.extend(this, {
    _value: 0,
    options: [],
    
    _init : function() {
      this.element = $("<select>");
      
      for(var i = 0; i < this.options.length; i++) {
       var option = $("<option>" + this.options[i] + "</option>");
       this.element.append(option);
      }
      
      this.element.css({
        position:'absolute',
        left: this._x(),
        top:  this._y(),
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
          self.sendTargetMessage();
          self.onvaluechange(self.value, oldValue);
        }
      );
      
      if(this.options.indexOf( this.value ) !== -1) {
        this.element.val( this.value );
      }else{
        this.element.val( this.options[0] );
      }
      
      $(this.container).append(this.element);
    },   
  })
  .init( arguments[0] );
};
Interface.Menu.prototype = Interface.Widget;

Interface.Label = function() {
  Interface.extend(this, {
    size:12,
    font:'helvetica',
    weight:'normal',
    hAlign:'center',
    vAlign:'middle',
    
    draw : function() {
      this.ctx.font = this.weight + ' ' + this.size + ' ' + this.font;
      this.ctx.textAlign = this.hAlign;
      this.ctx.textBaseline = this.vAlign;
      this.ctx.fillStyle = this._fill();
      this.ctx.fillText(this.value, this._x(), this._y());
    },
  })
  .init( arguments[0] );
};
Interface.Label.prototype = Interface.Widget;

Interface.TextField = function() {
  Interface.extend(this, {
    _init : function() {
      this.element = $("<input>");
      
      if(this.value !== 0) {
        this.element.val( this.value );
      }
      this.element.css({
        position:'absolute',
        left: this._x(),
        top:  this._y(),
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
          self.sendTargetMessage();
          self.onvaluechange(self.value, oldValue);
        }
      );
      
      $(this.container).append(this.element);
    },   
  })
  .init( arguments[0] );
};
Interface.TextField.prototype = Interface.Widget;

Interface.MultiSlider = function() {
  Interface.extend(this, {
    isVertical : true,
    children: [],
    
    _init     : function() {
      var sliderWidth = this.width / this.count;
      
      for(var i = 0; i < this.count; i++) {
        var slider = new Interface.Slider({
          x : this.x + i * sliderWidth,
          y : this.y,
          width: sliderWidth,
          height:this.height,
          requiresFocus: false,
          parent:this,
          colors:[this.background, this.fill, this.stroke],
          onvaluechange: (function() {
            var sliderNum = i;
                  
            return function() {
              this.parent.onvaluechange(sliderNum, this.value);
            };
          })(),
        });
        
        this.children.push( slider );
        
        this.panel.add( slider );
      }
    },
  onvaluechange : function(id, value) { /*console.log("MS", id, value);*/ },
  })
  .init( arguments[0] );
};
Interface.MultiSlider.prototype = Interface.Widget;

Interface.MultiButton = function() {
  Interface.extend(this, {
    mode:     'toggle',
    children: [],
    rows:     4,
    columns:  4,
    requiresFocus:true,
    
    _init     : function() {
      var childWidth  = this.width  / this.columns;
      var childHeight = this.height / this.rows;      
      
      for(var i = 0; i < this.rows; i++) {
        for(var j = 0; j < this.columns; j++) {
          var button = new Interface.Button({
            x : this.x + j * childWidth,
            y : this.y + i * childHeight,
            width: childWidth,
            height:childHeight,
            parent:this,
            requiresFocus: this.requiresFocus,
            onvaluechange: (function() {
              var row = i, col = j;
                  
              return function() {
                this.parent.onvaluechange(row, col, this.value);
              };
            })(),
          });
        
          this.children.push( button );
        
          this.panel.add( button );
        }
      }
    },
    onvaluechange : function(row, column, value) {},
  })
  .init( arguments[0] );
};
Interface.MultiButton.prototype = Interface.Widget;

Interface.Accelerometer = function() {
  var self = this,
      metersPerSecondSquared = 9.80665;
  
  Interface.extend(this, {
    name:"Accelerometer",
    delay : 100, // measured in ms
    min: 0,
    max: 1,

    update : function(event) {
      var acceleration = event.acceleration;
      self.x = self.min + ((((0 - self.hardwareMin) + acceleration.x) / self.hardwareRange ) * self.max);
      self.y = self.min + ((((0 - self.hardwareMin) + acceleration.y) / self.hardwareRange ) * self.max);
      self.z = self.min + ((((0 - self.hardwareMin) + acceleration.z) / self.hardwareRange ) * self.max);
        
      if(typeof self.onvaluechange !== 'undefined') {
        self.onvaluechange(self.x, self.y, self.z);
      }
    },
    start : function() {
      window.addEventListener('devicemotion', this.update, true);
      return this;
    },
    unload : function() {
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

Interface.Orientation = function() {
  var _self = this;
  
  Interface.extend(this, {
    delay : 100, // measured in ms
    update : function(orientation) {
      _self.roll   = _self.min + ((90 + orientation.gamma)  /  180 ) * _self.max ;
      _self.pitch  = _self.min + ((180 + orientation.beta) / 360 ) * _self.max ;
      _self.yaw    = _self.min + (orientation.alpha / 360 ) * _self.max ;
      
      if( !isNaN(orientation.webkitCompassHeading) ) {
        _self.heading = _self.min + ((orientation.webkitCompassHeading  /  360 ) * _self.max );
      }
      
      if(typeof _self.onvaluechange !== 'undefined') {
        _self.onvaluechange(_self.pitch, _self.roll, _self.yaw, _self.heading);
      }
    },
    start : function() {
      window.addEventListener('deviceorientation', function (event) {
        _self.update(event);
      }, true);
      return this;
    },
    unload : function() {
      window.removeEventListener('deviceorientation');
    },
  })
  .init( arguments[0] );
};
Interface.Orientation.prototype = Interface.Widget;

Interface.Range = function() {
  Interface.extend(this, {
    isVertical: false,
    handleSize: 20,
    leftValue:0,
    rightValue:1,
    _leftValue:0,
    _rightValue:1,
    draw : function() {
      var x = this._x(),
          y = this._y(),
          width = this._width(),
          height= this._height();
          
      this.ctx.fillStyle = this._background();
      this.ctx.clearRect(x, y, width, height);    
        
      if(this.isVertical) {
    		if(this.prevValue > this.value) {
    		  this.ctx.clearRect(x, (y + height) - (prevPercent * height) - 1, width, (prevPercent * height) - (percent * height) + 1);
    		}
        this.ctx.fillRect(x, (y + height) - (percent * height), width, percent * height);
      }else{
    		var rightHandlePos = x + (this._rightValue * width) - this.handleSize;
    		var leftHandlePos  = x + this._leftValue  * width;
		    
  	    this.ctx.fillStyle = this._background();
        this.ctx.fillRect(x, y, width, height);
        
  	    this.ctx.fillStyle = this._fill();
        this.ctx.fillRect(leftHandlePos, y, rightHandlePos - leftHandlePos, height);
		
  	    this.ctx.fillStyle = this._stroke();
    		this.ctx.fillRect(leftHandlePos, y, this.handleSize, height);
		
  	    //this.ctx.fillStyle = "rgba(0,255,0,.25)";
    		this.ctx.fillRect(rightHandlePos, y, this.handleSize, height);
      }
    },
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        var value = this.isVertical ? 1 - (yOffset / this._height()) : xOffset / this._width();
      	//var value = 1 - ((this.x + this.width) - val) / (this.width);
        
        //console.log(value);
        var range = this.max - this.min
      	if(Math.abs( value - this._leftValue) < Math.abs( value - this._rightValue)) {
          this._leftValue = value;
      		this.leftValue = this.min + range * value;
      	}else{
          this._rightValue = value;
      		this.rightValue = this.min + range * value;
      	}
        
        this.refresh();
        //this._value = this.isVertical ? 1 - (yOffset / this.height) : xOffset / this.width;
        //this.leftValue = this.isVertical ? 1 - (yOffset / this.height) : xOffset / this.width;
        
        // if(this._value < 0) {
        //   this._value = 0;
        //   // this.hasFocus = false;
        // }else if(this._value > 1) {
        //   this._value = 1;
        //   // this.hasFocus = false;
        // }
        // 
        // this.value = this.min + (this.max - this.min) * this._value;
        // 
        if(this.leftValue !== this.lastLeftValue || this.rightValue !== this.lastRightValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastLeftValue = this.leftValue;
          this.lastRightValue = this.rightValue;          
        }
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this._x(), e.y - this._y() ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this._x(), e.y - this._y() ); },  
  })
  .init( arguments[0] );
}
Interface.Range.prototype = Interface.Widget;
  
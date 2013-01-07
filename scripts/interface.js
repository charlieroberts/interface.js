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

  useTouch : 'ontouchstart' in document.documentElement,
};

Interface.Panel = function(_container) {
  var self = this;
  
  Interface.extend(this, {
    children: [],
    
    container: _container || $('body')[0],
    
    canvas:  document.createElement('canvas'),
    
    touchEvent : function(e) {
      for(var i = 0; i < self.children.length; i++) {
        self.children[i].touchEvent(e);
      }
    },
    
    mouseEvent : function(e) {      
      e.x = e.pageX - this.x;
      e.y = e.pageY - this.y;
      
      for(var i = 0; i < self.children.length; i++) {
        self.children[i].mouseEvent(e);
      }
    },
    
    init : function() {
      this.width  = parseFloat( $(this.container).css('width') );
      this.height = parseFloat( $(this.container).css('height'));
      this.x      = parseFloat( $(this.container).css('left') );
      this.y      = parseFloat( $(this.container).css('top') );
            
      $(this.canvas).attr({
        'width':  this.width,
        'height': this.height,
      });
      
      if(typeof _container === 'undefined') $(this.container).css('margin', '0px');
      
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
      for(var i = 0; i < this.children.length; i++) {
        this.children[i].draw();
      }
    },
    
    add: function() {
      for(var i = 0; i < arguments.length; i++) {
        var widget = arguments[i];
        
        widget.panel =      this;
        widget.container =  this.canvas;
        widget.ctx =        this.ctx;
        
        this.children.push( widget );
        
        widget.draw();
      }
    },
  });
  
  this.init();
};

var widgetDefaults = {
  hasFocus      : false,
  requiresFocus : true,
  min           : 0,
  max           : 1,
  value         : 0,
  background    : "#444",
  fill          : "#777",
  stroke        : "#999",
  lastValue     : null,
  events : {
    ontouchdown   : null,
    ontouchmove   : null,
    ontouchup     : null,
    onmousedown   : null,
    onmousemove   : null,
    onmouseup     : null,
    onvaluechange : null,
  }
}

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
  },
  
  hitTest : function(e) {
    if(e.x >= this.x && e.x < this.x + this.width) {
    	if(e.y >= this.y && e.y < this.y + this.height) {  
    		return true;
    	} 
    }
    
    return false;
  },
  
  mouseEvent : function(e) {
    if(e.type === 'mouseup') this.hasFocus = false;
    
    if(this.hitTest(e) || this.hasFocus || !this.requiresFocus) {
      if(e.type === 'mousedown') this.hasFocus = true;
      
      this[e.type](e);  // normal event
      
      if(this['on'+e.type]) this['on'+e.type](e); // user defined event
    }
  },
  
  touchEvent : function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
      var touch = event.changedTouches.item(j);
  		this.processingTouch = touch;
        
  		var breakCheck = this[event.type].call(this, touch);

      if(breakCheck) break;
    }
  },
};

Interface.Slider = function() {
  Interface.extend(this, {
    isVertical : true,
    
    draw : function() {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.fillStyle = this.fill;
      
      if(this.isVertical) {
        this.ctx.fillRect( this.x, this.y + this.height - this._value * this.height, this.width, this.value * this.height);
      }else{
        this.ctx.fillRect( this.x, this.y, this.width * this._value, this.height);
      }
      
      this.ctx.strokeStyle = this.stroke;
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        
        this._value = this.isVertical ? 1 - (yOffset / this.height) : xOffset / this.width;
        
        if(this._value < 0) {
          this._value = 0;
          this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
        
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    mousemove : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    mouseup   : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },    
    
  })
  .init( arguments[0] );
};
Interface.Slider.prototype = Interface.Widget;

Interface.Crossfader = function() {
  Interface.extend(this, {
    crossfaderWidth: 30,

    draw : function() {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.fillStyle = this.fill;
      this.ctx.fillRect( this.x + (this.width - this.crossfaderWidth) * this._value, this.y, this.crossfaderWidth, this.height);
      
      this.ctx.strokeStyle = this.stroke;
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = xOffset / this.width;
        
        if(this._value < 0) {
          this._value = 0;
          this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
                
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e) { 
      this.offset = e.x - this.x < this.crossfaderWidth / 2 ? e.x - this.x < this.crossfaderWidth / 2 : 0;
      this.changeValue( e.x - this.x, e.y - this.y ); 
    },
    mousemove : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    mouseup   : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },    
    
  })
  .init( arguments[0] );
};
Interface.Crossfader.prototype = Interface.Widget;
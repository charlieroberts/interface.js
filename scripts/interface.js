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
  
  widgetInit : function(widget, options) {
    if(options.bounds) {
      widget.x = options.bounds[0];
      widget.y = options.bounds[1];
      widget.width  = options.bounds[2];
      widget.height = options.bounds[3];
    }else{
      widget.x = options.x;
      widget.y = options.y;
      widget.width  = options.width;
      widget.height = options.height;
    }
      
    if(options.colors) {
      widget.background = options.colors[0];
      widget.fill       = options.colors[1];
      widget.stroke     = options.colors[2];                
    }else{
      widget.background = options.background || "#444";
      widget.fill       = options.fill || "#777";
      widget.stroke     = options.stroke || "#999";
    }
      
    widget.ontouchstart = options.ontouchstart || null;
    widget.ontouchmove  = options.ontouchmove  || null;
    widget.ontouchend   = options.ontouchend   || null;
      
    widget.onmousestart = options.onmousestart || null;
    widget.onmousemove  = options.onmousemove  || null;
    widget.onmouseend   = options.onmouseend   || null;            
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
    
    if(this.hitTest(e) || this.hasFocus) {
      if(e.type === 'mousedown') this.hasFocus = true;
  
      this.changeValue( e.x - this.x, e.y - this.y );
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
    draw : function() {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.fillStyle = this.fill;
      this.ctx.fillRect( this.x, this.y + this.height - this.value * this.height, this.width, this.value * this.height);
      
      this.ctx.strokeStyle = this.stroke;
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this.value = 1 - (yOffset / this.height);
        
        if(this.value < this.min) {
          this.value = this.min;
        }else if(this.value > this.max) {
          this.value = this.max;
        }
        
        this.draw();
      }
    },
  })
  .init( arguments[0] );
};
Interface.Slider.prototype = Interface.Widget;


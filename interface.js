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

Interface.Panel = function(_container) {
  var self = this;
  
  Interface.extend(this, {
    children:     [],
    shouldDraw :  [],
    fps : 60,
    
    container: _container || $('body')[0],
    
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
      
      if( isNaN(this.x)) this.x = 0;
      if( isNaN(this.y)) this.y = 0;      
      
      $(this.canvas).attr({
        'width':  this.width,
        'height': this.height,
      });
      
      if(typeof _container === 'undefined') $(this.container).css({
        'margin': '0px',
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
        
        widget.draw();
        if(widget._init) widget._init();
      }
    },
    
    setBackgroundColor : function(color) {
      $(this.container).css({ backgroundColor:color });
    },
  });
  
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
    if(e.x >= this.x && e.x < this.x + this.width) {
    	if(e.y >= this.y && e.y < this.y + this.height) {  
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
      if(touch.type === 'touchstart') this.hasFocus = true;
      
      if(this[touch.type])
        this[touch.type](touch, isHit);  // normal event
      
      if(this['on'+touch.type]) this['on'+touch.type](touch, isHit);          // user defined event
      if(this['on'+touchMouseName]) this['on'+touchMouseName](touch, isHit);  // user defined event
    }
    if(touch.type === 'touchend') this.hasFocus = false;
  },
  
  draw : function() {},
  
  _background : function() { return this.background || this.panel.background; },
  _stroke : function() { return this.stroke || this.panel.stroke; },
  _fill : function() { return this.fill || this.panel.fill; },
};

Interface.Slider = function() {
  Interface.extend(this, {
    isVertical : true,
    
    draw : function() {
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.fillStyle = this._fill();
      
      if(this.isVertical) {
        this.ctx.fillRect( this.x, this.y + this.height - this._value * this.height, this.width, this._value * this.height);
      }else{
        this.ctx.fillRect( this.x, this.y, this.width * this._value, this.height);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        
        this._value = this.isVertical ? 1 - (yOffset / this.height) : xOffset / this.width;
        
        if(this._value < 0) {
          this._value = 0;
          // this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          // this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
        
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this.x, e.y - this.y ); },
    mousemove : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this.x, e.y - this.y ); },
    mouseup   : function(e, hit) { if(hit && Interface.mouseDown) this.changeValue( e.x - this.x, e.y - this.y ); },    
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },  
  })
  .init( arguments[0] );
};
Interface.Slider.prototype = Interface.Widget;

Interface.Crossfader = function() {
  Interface.extend(this, {
    crossfaderWidth: 30,
    _value : .5,
    
    draw : function() {
      this.ctx.fillStyle = this._background();
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.fillStyle = this._fill();
      this.ctx.fillRect( this.x + (this.width - this.crossfaderWidth) * this._value, this.y, this.crossfaderWidth, this.height);
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = xOffset / this.width;
        
        if(this._value < 0) {
          this._value = 0;
          //this.hasFocus = false;
        }else if(this._value > 1) {
          this._value = 1;
          //this.hasFocus = false;
        }
        
        this.value = this.min + (this.max - this.min) * this._value;
                
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e) { 
      //this.offset = e.x - this.x < this.crossfaderWidth / 2 ? e.x - this.x < this.crossfaderWidth / 2 : 0;
      this.changeValue( e.x - this.x, e.y - this.y ); 
    },
    mousemove : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    mouseup   : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    
    touchstart : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },
    touchmove  : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },
    touchend   : function(e, hit) { if(hit) this.changeValue( e.x - this.x, e.y - this.y ); },
  })
  .init( arguments[0] );
};
Interface.Crossfader.prototype = Interface.Widget;

Interface.Button = function() {
  Interface.extend(this, {
    _value: 0,
    mode : 'toggle',
    isMouseOver : false,
    isTouchOver : false,
    label : null,
    
    draw : function() {
      if(this._value) {
        this.ctx.fillStyle = this._fill();
      }else{
        this.ctx.fillStyle = this._background();  
      }
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      if(this.label !== null) {
        this.ctx.fillStyle = this._stroke();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
      }
      
      this.ctx.strokeStyle = this._stroke();
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );      
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        this._value = !this._value;
        
        this.value = this._value ? this.max : this.min;
                
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
          this.lastValue = this.value;
        }
      }     
    },
    
    mousedown : function(e, hit) {
      if(hit && Interface.mouseDown) {
        this.isMouseOver = true;
        if(this.mode !== 'contact') {
          this.changeValue( e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    mousemove : function(e, hit) { 
      if(!this.requiresFocus && hit && Interface.mouseDown && !this.isMouseOver) {
        this.isMouseOver = true;
        if(this.mode !== 'contact') {
          this.changeValue( e.x - this.x, e.y - this.y ); 
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
        this.changeValue( e.x - this.x, e.y - this.y ); 
    },
    
    touchstart : function(e, hit) {
      if(hit) {
        this.isTouchOver = true;
        
        if(this.mode !== 'contact') {
          this.changeValue( e.x - this.x, e.y - this.y ); 
        }else{
          this._value = 1;
          this.draw();
          var self = this;
          setTimeout( function() { self._value = 0; self.draw(); }, 75);
        }
      }
    },
    touchmove : function(e, hit) {
      if(!this.requiresFocus && hit && !this.isTouchOver) {
        this.isTouchOver = true;
        if(this.mode !== 'contact') {
          this.changeValue( e.x - this.x, e.y - this.y );
          
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
        this.changeValue( e.x - this.x, e.y - this.y ); 
    },
  })
  .init( arguments[0] );
};
Interface.Button.prototype = Interface.Widget;

Interface.Knob = function() {
  Interface.extend(this, {
    _value: 0,
    mode : 'toggle',
    radius: 30,
    knobBuffer:15,
    lastPosition: 0,
    
    draw : function() {
      //this.canvasCtx.clearRect(0, 0, this.width,this.height);
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.lineWidth = 1.5;
	
    	this.ctx.fillStyle = this._background(); // draw background of widget first
    
      var angle0 = Math.PI * .6;
      var angle1 = Math.PI * .4;
    
      this.ctx.beginPath();
      this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(this.x + this.radius, this.y + this.radius, (this.radius - this.knobBuffer) * .3 , angle1, angle0, true);		
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
          this.ctx.arc(this.x + this.radius , this.y + this.radius, this.radius -  this.knobBuffer, angle3, angle4, (this._value < .5));
          this.ctx.arc(this.x + this.radius , this.y + this.radius, (this.radius - this.knobBuffer) * 0.3,  angle4, angle3, (this._value > .5));
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
              this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius - this.knobBuffer, angle0, angle2, false);
              this.ctx.arc(this.x + this.radius, this.y + this.radius, (this.radius - this.knobBuffer) * .3, angle2, angle0, true);
          } else {
              this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius - this.knobBuffer, angle1, angle2 ,true);
              this.ctx.arc(this.x + this.radius, this.y + this.radius, (this.radius - this.knobBuffer) * .3, angle2, angle1, false);
          }
          this.ctx.closePath();
          this.ctx.fill();
      }
      
      this.ctx.beginPath();
      this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(this.x + this.radius, this.y + this.radius, (this.radius - this.knobBuffer) * .3 , angle1, angle0, true);		
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
          if(this.onvaluechange) this.onvaluechange();
          this.refresh();
          this.lastValue = this.value;
        }
      }
    },
    
    hitTest : function(e) {
      if(e.x >= this.x && e.x < this.x + this.radius * 2) {
      	if(e.y >= this.y && e.y < this.y  + this.radius * 2) {  
      		return true;
      	} 
      }
    
      return false;
    },
    
    mousedown : function(e) {
      this.lastPosition = e.y - this.y;
      this.changeValue( e.x - this.x, e.y - this.y ); 
    },
    mousemove : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    mouseup   : function(e) {},
    
    touchstart : function(e) {
      this.lastPosition = e.y - this.y;
      this.changeValue( e.x - this.x, e.y - this.y ); 
    },
    touchmove : function(e) { this.changeValue( e.x - this.x, e.y - this.y ); },
    touchend   : function(e) {},
  })
  .init( arguments[0] );
};
Interface.Knob.prototype = Interface.Widget;

function sign(n) {
  if(n < 0) return -1;
  return 1;
}
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
      var shouldrunvaluechange = false;
      for(var i = 0; i < this.children.length; i++) {
        var moveX = moveY = false,
            child = this.children[i];
        
        if(child.x + child.vx < this.width && child.x + child.vx > 0) {
          child.x += child.vx;
        }else{
          if(child.x + child.vx >= this.width && child.vx > 0 ) {
            child.vx *= -1;
          }else if(child.x + child.vx <= 0 && child.vx < 0) {
            child.vx *= -1;
          }else{
            child.x += child.vx;
          }
        }

        if(child.y + child.vy < this.height && child.y + child.vy > 0) {
          child.y += child.vy;
        }else{
          if(child.y + child.vy >= this.height && child.vy > 0 ) {
            child.vy *= -1;
          }else if(child.y + child.vy <= 0 && child.vy < 0) {
            child.vy *= -1;
          }else{
            child.y += child.vy;
          }
        }

        child.vx *= this.friction;
        child.vy *= this.friction;
        
        var newValueX = child.x / this.width;
        var newValueY = child.y / this.height;
        
        if(this.values[child.id].x !== newValueX || this.values[child.id].y !== newValueY) {
          this.values[child.id].x = newValueX;
          this.values[child.id].y = newValueY;
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
      if(this.usePhysics) {
        this.animate();
      }
      
      this.ctx.fillStyle = this._background();
      //this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this._stroke();
      //this.ctx.strokeRect( this.x, this.y, this.width, this.height );
      
      this.ctx.save();
      
      this.ctx.beginPath();
      
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x + this.width, this.y);
      this.ctx.lineTo(this.x + this.width, this.y + this.height);
      this.ctx.lineTo(this.x, this.y + this.height);
      this.ctx.lineTo(this.x, this.y);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.clip();
      
      this.ctx.fillStyle = this._fill();
      
      for(var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        
        this.ctx.fillStyle = this._fill();
        
        this.ctx.beginPath();

        this.ctx.arc(this.x + child.x, this.y + child.y, this.childWidth, 0, Math.PI*2, true); 

        this.ctx.closePath();
        
        this.ctx.fill();
        this.ctx.stroke();
        //this.ctx.fillRect( this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = this._stroke();
        this.ctx.fillText(child.id, this.x + child.x, this.y + child.y);
      }
      
      this.ctx.closePath();
      this.ctx.restore();
    },
    
    changeValue : function( touch, xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        touch.x = xOffset;
        if(touch.x < 0 ) touch.x = 0;
        if(touch.x > this.width) touch.x = this.width;
                
        touch.y = yOffset;// - this.half;
        if(touch.y < 0) touch.y = 0;
        if(touch.y > this.height) touch.y = this.height;        
        this.values[touch.id].x = xOffset / this.width;
        this.values[touch.id].y = yOffset / this.height;
                
        if(this.onvaluechange) this.onvaluechange();
        
        if(!this.usePhysics) {
          this.refresh();
        }
      }     
    },
    
    makeChildren : function() {
      for(var i = 0; i < this.numChildren; i++) {
        this.children.push({ id:i, x:Math.random() * this.width, y:Math.random() * this.height, vx:0, vy:0, collideFlag:false, isActive:false, lastPosition:null, });
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
          this.trackTouch(touch.x - this.x, touch.y - this.y, touch);
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
    
    hitTest : function(e) {
      if(e.x >= this.x && e.x < this.x + this.width) {
      	if(e.y >= this.y && e.y < this.y + this.height) {  
      		return true;
      	} 
      }
    
      return false;
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
        this.trackMouse(e.x - this.x, e.y - this.y);
      }
    },
    mousemove : function(e) { 
      if(this.hitTest(e) && this.activeTouch !== null) {
        if(this.activeTouch.lastTouch === null) {
          this.activeTouch.lastTouch = {x:e.x - this.x, y:e.y - this.y};
        }else{
          var now = {x:e.x - this.x, y:e.y - this.y};
          this.activeTouch.velocity = {x:now.x - this.activeTouch.lastTouch.x, y:now.y - this.activeTouch.lastTouch.y };
          this.activeTouch.lastTouch = now;
        }

        this.changeValue(this.activeTouch, e.x - this.x, e.y - this.y);
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
          this.changeValue(_t, touch.x - this.x, touch.y - this.y);
			    
          var now = {x:touch.x - this.x, y:touch.y - this.y};
          
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
  })
  .init( arguments[0] );
  
  this.requiresFocus = false; // is a widget default... must set after init.
  this.half = this.childWidth / 2;
  this.makeChildren();
  
  if(this.usePhysics) this.startAnimation();
};
Interface.XY.prototype = Interface.Widget;

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
        left: this.x,
        top:  this.y,
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
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
      this.ctx.fillText(this.value, this.x, this.y);
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
        left: this.x,
        top:  this.y,
      });
      
      if(this.css) this.element.css( this.css );
      
      var self = this;
      this.element.change( 
        function(obj) {
          var oldValue = self.value;
          self.value = self.element.val();
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
  var _self = this;
  
  Interface.extend(this, {
    name:"Accelerometer",
    delay : 100, // measured in ms
    min: 0,
    max: 1,
    maxValue: 0,
    update : function(acceleration) {
      if(Math.abs(acceleration.x) > _self.maxValue) _self.maxValue = Math.abs(acceleration.x);
      _self.x = _self.min + (((0 - _self.hardwareMin) + acceleration.x) / _self.hardwareRange );
      _self.y = _self.min + (((0 - _self.hardwareMin) + acceleration.y) / _self.hardwareRange );
      _self.z = _self.min + (((0 - _self.hardwareMin) + acceleration.z) / _self.hardwareRange );
        
      if(typeof _self.onvaluechange !== 'undefined') {
        _self.onvaluechange(_self.x, _self.y, _self.z);
      }
    },
    start : function() {
      window.addEventListener('devicemotion', function (event) {
        _self.update(event.acceleration);
      }, true);
    },
    unload : function() {
      window.removeEventListener('devicemotion');
    },
  })
  .init( arguments[0] );
    
  var metersPerSecondSquared = 9.80665;
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
      _self.roll   = _self.min + (orientation.alpha  /  360 );
      _self.pitch  = _self.min + (((0 - -90) + orientation.beta) / 180 );
      _self.yaw    = _self.min + (((0 - 180) + orientation.gammma) / 360 );
        
      if(typeof _self.onvaluechange !== 'undefined') {
        _self.onvaluechange(_self.pitch, _self.roll, _self.yaw);
      }
    },
    start : function() {
      window.addEventListener('deviceorientation', function (event) {
        _self.update(event);
      }, true);
    },
    unload : function() {
      window.removeEventListener('deviceorientation');
    },
  })
  .init( arguments[0] );
};
Interface.Orientation.prototype = Interface.Widget;
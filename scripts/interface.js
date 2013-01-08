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
  
  setValue : function(value, doNotDraw) {
    var r = this.max - this.min,
        v = value;
        
    this.value = value;
                
    if(this.min !== 0 || this.max !== 1) {
      v -= this.min;
      this._value = v / r;
    }
    
    if(!doNotDraw) this.draw();
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
    if(this.hitTest(e) || this.hasFocus || !this.requiresFocus) {
      if(e.type === 'mousedown') this.hasFocus = true;
      
      this[e.type](e);  // normal event
      
      if(this['on'+e.type]) this['on'+e.type](e); // user defined event
    }
    if(e.type === 'mouseup') this.hasFocus = false;
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
    _value : .5,
    
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

Interface.Button = function() {
  Interface.extend(this, {
    _value: 0,
    mode : 'toggle',
    
    draw : function() {
      if(this._value) {
        this.ctx.fillStyle = this.fill;
      }else{
        this.ctx.fillStyle = this.background;  
      }
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this.stroke;
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
    
    mousedown : function(e) {
      if(this.mode !== 'contact') {
        this.changeValue( e.x - this.x, e.y - this.y ); 
      }else{
        this._value = 1;
        this.draw();
        var self = this;
        setTimeout( function() { self._value = 0; self.draw(); }, 75);
      }
    },
    mousemove : function(e) { /*this.changeValue( e.x - this.x, e.y - this.y );*/ },
    mouseup   : function(e) {
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
      this.ctx.strokeStyle = this.stroke;
      this.ctx.lineWidth = 1.5;
	
    	this.ctx.fillStyle = this.background; // draw background of widget first
    
      var angle0 = Math.PI * .6;
      var angle1 = Math.PI * .4;
    
      this.ctx.beginPath();
      this.ctx.arc(this.x + this.radius, this.y + this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
      this.ctx.arc(this.x + this.radius, this.y + this.radius, (this.radius - this.knobBuffer) * .3 , angle1, angle0, true);		
      this.ctx.closePath();
      this.ctx.fill();
    
      this.ctx.stroke();
      
      this.ctx.fillStyle = this.fill;	// now draw foreground...
	
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
    },
    
    changeValue : function( xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
    	// TODO: accommodate !usesRotation and centeredRotation.
        this.lastValue = this.value;

        if(!this.usesRotation) {
          if (this.lastPosition != -1) { 
            this._value -= (yOffset - this.lastPosition) / (this.radius * 2);
            //console.log(this._value);
          }
        }else{
            var xdiff = ((this.radius)) - xOffset;
            var ydiff = ((this.radius)) - yOffset;
            var angle = Math.PI + Math.atan2(ydiff, xdiff);
            this._value =  ((angle + (Math.PI * 1.5)) % (Math.PI * 2)) / (Math.PI * 2);
        }
        //console.log(this.rotationValue);
        if (this._value > 1) this._value = 1;
        if (this._value < 0) this._value = 0;

      	this.lastRotationValue = this._value;
        this.lastPosition = yOffset;
      
        var range  = this.max - this.min;
        this.value = this.min + this._value * range;
      
        if(this.value !== this.lastValue) {
          if(this.onvaluechange) this.onvaluechange();
          this.draw();
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
    mouseup   : function(e) {
      if(this.mode === 'momentary')
        this.changeValue( e.x - this.x, e.y - this.y ); 
    },    
  })
  .init( arguments[0] );
};
Interface.Knob.prototype = Interface.Widget;

Interface.XY = function() {
  Interface.extend(this, {
    _value: 0,
    childWidth: 25,
    childHeight: 25,
    children: [],
    values: [],
    numChildren: 5,
    stroke:"#fff",
    
    draw : function() {
      this.ctx.fillStyle = this.background;
      this.ctx.fillRect( this.x, this.y, this.width, this.height );
      
      this.ctx.strokeStyle = this.stroke;
      this.ctx.strokeRect( this.x, this.y, this.width, this.height );

      this.ctx.fillStyle = this.fill;      
      for(var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        

        this.ctx.fillRect( this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
        
        //this.fillStyle = "#000";
        this.ctx.strokeText(child.id, this.x + child.x + this.half - 3, this.y + child.y + 5 + this.half);
      }
    },
    
    changeValue : function( touch, xOffset, yOffset ) {
      if(this.hasFocus || !this.requiresFocus) {
        touch.x = xOffset - this.half;
        if(touch.x < 0 ) touch.x = 0;
        
        if(touch.x > this.width - this.childWidth) touch.x = this.width - this.childWidth;
        
        touch.y = yOffset - this.half;
        if(touch.y < 0) touch.y = 0;
        if(touch.y > this.height - this.childHeight) touch.y = this.height - this.childHeight;        
        this.values[touch.id].x = xOffset / this.width;
        this.values[touch.id].y = yOffset / this.height;
                
        //if(this.values[touch] !== this.lastValue) {
        if(this.onvaluechange) this.onvaluechange();
        this.draw();
        this.lastValue = this.value;
        //}
      }     
    },
    
    trackTouch : function(xPos, yPos, id) {
      var closestDiff = 10000;
      var touchFound = null;
      var touchNum = null;
      for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs(touch.x - xPos);
        var ydiff = Math.abs(touch.y - yPos);

        //if(!touch.isActive) {
          if(xdiff + ydiff < closestDiff) {
            closestDiff = xdiff + ydiff;
            console.log("closesetdiff", closestDiff);
            
            touchFound = touch;
            touchNum = i;
          }
        //}
      }
      //console.log(touchFound);
      //touchFound.id = id;
  	  //touchFound.pressure = Control.pressures[pressureID];
	
  	  //console.log(touchFound);
      touchFound.isActive = true;
      if(touchFound != null)
          this.changeValue(touchFound, xPos, yPos);
    
      this.lastTouched = touchFound;
    },
    
    
    makeChildren : function() {
      for(var i = 0; i < this.numChildren; i++) {
        this.children.push({ id:i, x:i * 25, y:i * 25, isActive:false });
        this.values.push({ x:null, y:null });
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
    
    mousedown : function(e) {
      if(this.hitTest(e)) {
        this.trackTouch(e.x - this.x, e.y - this.y);
      }
      /*if(this.mode !== 'contact') {
        this.changeValue( e.x - this.x, e.y - this.y ); 
      }else{
        this._value = 1;
        this.draw();
        var self = this;
        setTimeout( function() { self._value = 0; self.draw(); }, 75);
      }*/
    },
    mousemove : function(e) { 
      if(this.hitTest(e)) {
        this.trackTouch(e.x - this.x, e.y - this.y);
      }
    },
    mouseup   : function(e) {
      for(var i = 0; i < this.children.length; i++) {
        this.children[i].isActive = false;
      }
    },
  })
  .init( arguments[0] );
  this.half = this.childWidth / 2;
  this.makeChildren();
};
Interface.XY.prototype = Interface.Widget;
import CanvasWidget from './canvasWidget.js'

/**
 * A horizontal or vertical fader. 
 * @module Knob
 * @augments CanvasWidget
 */ 

let Knob = Object.create( CanvasWidget ) 

Object.assign( Knob, {
  /** @lends Knob.prototype */

  /**
   * A set of default property settings for all Knob instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Knob
   * @static
   */  
  defaults: {
    __value:.5, // always 0-1, not for end-users
    value:.5,   // end-user value that may be filtered
    active: false,
    knobBuffer:20,
    usesRotation:false,
    lastPosition:0,
    isSquare:true,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the Knob instance.
     * @memberof Knob
     * @instance
     * @type {String}
     */
    style:  'horizontal'
  },

  /**
   * Create a new Knob instance.
   * @memberof Knob
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Knob with.
   * @static
   */
  create( props ) {
    let knob = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with Knob defaults
    CanvasWidget.create.call( knob )

    // ...and then finally override with user defaults
    Object.assign( knob, Knob.defaults, props )

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) knob.__value = props.value
    
    // inherits from Widget
    knob.init()

    return knob
  },

  /**
   * Draw the Knob onto its canvas context using the current .__value property.
   * @memberof Knob
   * @instance
   */
  draw() {
    // draw background
    this.ctx.fillStyle   = this.container.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth   = this.lineWidth

    this.ctx.fillRect( 0,0, this.rect.width, this.rect.height )

    let x = 0,
        y = 0,
        width = this.rect.width,
        height= this.rect.height,
        radius = width / 2
    
    this.ctx.fillRect( x, y, width, height )
    //this.ctx.strokeStyle = this.stroke

    this.ctx.fillStyle = this.background // draw background of widget first

    let angle0 = Math.PI * .6,
        angle1 = Math.PI * .4

    this.ctx.beginPath()
    this.ctx.arc( x + radius, y + radius, radius - this.knobBuffer,         angle0, angle1, false )
    this.ctx.arc( x + radius, y + radius, (radius - this.knobBuffer) * .5 , angle1, angle0, true  )		
    this.ctx.closePath()
    
    this.ctx.fill()

    let angle2
    if(!this.isInverted)  { 
      angle2 = Math.PI * .6 + this.__value * 1.8  * Math.PI
      if( angle2 > 2 * Math.PI) angle2 -= 2 * Math.PI
    }else{
      angle2 = Math.PI * (0.4 - (1.8 * this.__value))
    }

    this.ctx.beginPath()

    if(!this.isInverted) {
      this.ctx.arc( x + radius, y + radius, radius - this.knobBuffer, angle0, angle2, false )
      this.ctx.arc( x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle0, true )
    } else {
      this.ctx.arc( x + radius, y + radius, radius - this.knobBuffer, angle1, angle2 ,true )
      this.ctx.arc( x + radius, y + radius, (radius - this.knobBuffer) * .5, angle2, angle1, false )
    }

    this.ctx.closePath()

    this.ctx.fillStyle = this.fill
    this.ctx.fill()
  
  },

  addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  events: {
    pointerdown( e ) {
      this.active = true
      this.pointerId = e.pointerId

      this.processPointerPosition( e ) // change knob value on click / touchdown

      window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      window.addEventListener( 'pointerup',   this.pointerup ) 
    },

    pointerup( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.active = false
        window.removeEventListener( 'pointermove', this.pointermove ) 
        window.removeEventListener( 'pointerup',   this.pointerup ) 
      }
    },

    pointermove( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        this.processPointerPosition( e )
      }
    },
  },
  
  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Knob's position, and triggers output.
   * @instance
   * @memberof Knob
   * @param {PointerEvent} e - The pointer event to be processed.
   */

  processPointerPosition( e ) {
    let xOffset = e.clientX, yOffset = e.clientY

    let radius = this.rect.width / 2;
    this.lastValue = this.value;

    if( !this.usesRotation ) {
      if( this.lastPosition !== -1 ) { 
        //this.__value -= ( yOffset - this.lastPosition ) / (radius * 2);
        this.__value = 1 - yOffset / this.rect.height
      }
    }else{
      var xdiff = radius - xOffset;
      var ydiff = radius - yOffset;
      var angle = Math.PI + Math.atan2(ydiff, xdiff);
      this.__value =  ((angle + (Math.PI * 1.5)) % (Math.PI * 2)) / (Math.PI * 2);

      if(this.lastRotationValue > .8 && this.__value < .2) {
        this.__value = 1;
      }else if(this.lastRotationValue < .2 && this.__value > .8) {
        this.__value = 0;
      }
    }

    if (this.__value > 1) this.__value = 1;
    if (this.__value < 0) this.__value = 0;

    this.lastRotationValue = this.__value;
    this.lastPosition = yOffset;

    let shouldDraw = this.output()
    
    if( shouldDraw ) this.draw()
  },

  //__addToPanel( panel ) {
  //  this.container = panel

  //  if( typeof this.addEvents === 'function' ) this.addEvents()

  //  // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    
  //  this.place( true ) 

  //  if( this.label ) this.addLabel()

  //  this.draw()     

  //}

})

module.exports = Knob

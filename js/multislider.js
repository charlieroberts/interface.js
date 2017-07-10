import CanvasWidget from './canvasWidget.js'

/**
 * A horizontal or vertical fader. 
 * @module MultiSlider
 * @augments CanvasWidget
 */ 

let MultiSlider = Object.create( CanvasWidget ) 

Object.assign( MultiSlider, {
  /** @lends MultiSlider.prototype */

  /**
   * A set of default property settings for all MultiSlider instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiSlider
   * @static
   */  
  defaults: {
    __value:[.15,.35,.5,.75], // always 0-1, not for end-users
    value:[.5,.5,.5,.5],   // end-user value that may be filtered
    active: false,
    /**
     * The count property determines the number of sliders in the multislider, default 4.
     * @memberof MultiSlider
     * @instance
     * @type {Integer}
     */
    count:4,
    lineWidth:1,
    /**
     * The style property can be either 'horizontal' (the default) or 'vertical'. This
     * determines the orientation of the MultiSlider instance.
     * @memberof MultiSlider
     * @instance
     * @type {String}
     */
    style:'vertical'
  },

  /**
   * Create a new MultiSlider instance.
   * @memberof MultiSlider
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize MultiSlider with.
   * @static
   */
  create( props ) {
    let multiSlider = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with MultiSlider defaults
    CanvasWidget.create.call( multiSlider )

    // ...and then finally override with user defaults
    Object.assign( multiSlider, MultiSlider.defaults, props )

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) multiSlider.__value = props.value
    
    // inherits from Widget
    multiSlider.init()
    
    if( props.value === undefined && multiSlider.count !== 4 ) {
      for( let i = 0; i < multiSlider.count; i++ ) {
        multiSlider.__value[ i ] = i / multiSlider.count
      }
    }else if( typeof props.value === 'number' ) {
      for( let i = 0; i < multiSlider.count; i++ ) multiSlider.__value[ i ] = props.value
    }

    return multiSlider
  },
  

  /**
   * Draw the MultiSlider onto its canvas context using the current .__value property.
   * @memberof MultiSlider
   * @instance
   */
  draw() {
    // draw background
    this.ctx.fillStyle   = this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth
    this.ctx.fillRect( 0,0, this.rect.width, this.rect.height )

    // draw fill (multiSlider value representation)
    this.ctx.fillStyle = this.fill

    let sliderWidth = this.style === 'vertical' ? this.rect.width / this.count : this.rect.height / this.count

    for( let i = 0; i < this.count; i++ ) {
      
      if( this.style === 'horizontal' ) {
        let ypos = Math.floor( i * sliderWidth )
        this.ctx.fillRect( 0, ypos, this.rect.width * this.__value[ i ], Math.ceil( sliderWidth ) )
        this.ctx.strokeRect( 0, ypos, this.rect.width, sliderWidth )
      }else{
        let xpos = Math.floor( i * sliderWidth )
        this.ctx.fillRect( xpos, this.rect.height - this.__value[ i ] * this.rect.height, Math.ceil(sliderWidth), this.rect.height * this.__value[ i ] )
        this.ctx.strokeRect( xpos, 0, sliderWidth, this.rect.height )
      }
    }

   
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

      this.processPointerPosition( e ) // change multiSlider value on click / touchdown

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
   * to the MultiSlider's position, and triggers output.
   * @instance
   * @memberof MultiSlider
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition( e ) {
    let prevValue = this.value,
        sliderNum

    if( this.style === 'horizontal' ) {
      sliderNum = Math.floor( ( e.clientY / this.rect.height ) / ( 1/this.count ) )
      this.__value[ sliderNum ] = ( e.clientX - this.rect.left ) / this.rect.width
    }else{
      sliderNum = Math.floor( ( e.clientX / this.rect.width ) / ( 1/this.count ) )
      this.__value[ sliderNum ] = 1 - ( e.clientY - this.rect.top  ) / this.rect.height 
    }

    for( let i = 0; i < this.count; i++  ) {
      if( this.__value[ i ] > 1 ) this.__value[ i ] = 1
      if( this.__value[ i ] < 0 ) this.__value[ i ] = 0
    }

    let shouldDraw = this.output()
    
    if( shouldDraw ) this.draw()
  },

})

module.exports = MultiSlider

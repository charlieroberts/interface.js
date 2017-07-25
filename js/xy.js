import CanvasWidget from './canvasWidget.js'
import Vec2 from 'victor'

/**
 * A horizontal or vertical fader. 
 * @module XY
 * @augments CanvasWidget
 */ 

let XY = Object.create( CanvasWidget ) 

Object.assign( XY, {
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
    count:4,
    lineWidth:1,
    usePhysics:true,
    touchSize:50,
    fill:'rgba( 255,255,255, .2 )',
    stroke:'#999',
    background:'#000',
    friction:.0,
  },

  /**
   * Create a new XY instance.
   * @memberof XY
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize XY with.
   * @static
   */
  create( props ) {
    let xy = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with XY defaults
    CanvasWidget.create.call( xy )

    // ...and then finally override with user defaults
    Object.assign( xy, XY.defaults, props, {
      value:[],
      __value:[],
      touches:[],
    })

    // set underlying value if necessary... TODO: how should this be set given min/max?
    // if( props.value ) xy.__value = props.value
    
    // inherits from Widget
    xy.init()
    
    xy.onplace = () => {
      for( let i = 0; i < xy.count; i++ ) {
        xy.touches.push({
          pos: new Vec2( i * ( xy.rect.width / xy.count ), i * ( xy.rect.height / xy.count ) ),
          vel: new Vec2( 0,0 ),
          acc: new Vec2( .05,.05 ),
          name: xy.names === undefined ? i : xy.names[ i ]
        })
      }

      if( xy.usePhysics === true )
        xy.startAnimationLoop()
    }

    return xy
  },

  startAnimationLoop() {
    this.draw( true )

    let loop = ()=> { 
      this.draw()
      window.requestAnimationFrame( loop )
    }

    loop()
  },

  animate() {
    let shouldDraw = true 
    let __friction = new Vec2( -1 * this.friction, -1 * this.friction )
    for( let touch of this.touches ) {
      if( touch.vel.x !== 0 && touch.vel.y !== 0 ) {
        //touch.vel.add( touch.acc )
        let friction = touch.vel.clone()
        friction.x *= -1 * this.friction
        friction.y *= -1 * this.friction
        touch.vel.add( friction )

        if( (touch.pos.x - this.touchSize) + touch.vel.x < 0 ) {
          touch.pos.x = this.touchSize
          touch.vel.x *= -1
        } else if ( touch.pos.x + this.touchSize + touch.vel.x > this.rect.width ) {
          touch.pos.x = this.rect.width - this.touchSize
          touch.vel.x *= -1
        } else {
          touch.pos.x += touch.vel.x 
        }

        if( (touch.pos.y - this.touchSize) + touch.vel.y < 0 ) { 
          touch.pos.y = this.touchSize
          touch.vel.y *= -1
        } else if ( touch.pos.y + this.touchSize + touch.vel.y > this.rect.height ) {
          touch.pos.y = this.rect.height - this.touchSize
          touch.vel.y *= -1
        }else{
          touch.pos.y += touch.vel.y
        }

        shouldDraw = true
      }
    }

    return shouldDraw
  },
  
  /**
   * Draw the XY onto its canvas context using the current .__value property.
   * @memberof XY
   * @instance
   */
  draw( override=false ) {
    let shouldDraw = this.animate()

    if( shouldDraw === false && override === false ) return

    // draw background
    this.ctx.fillStyle   = this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth
    this.ctx.fillRect( 0, 0, this.rect.width, this.rect.height )

    // draw fill (xy value representation)
    this.ctx.fillStyle = this.fill

    for( let i = 0; i < this.count; i++ ) {
      let child = this.touches[ i ]
      this.ctx.fillStyle = this.fill

      this.ctx.beginPath()

      this.ctx.arc( child.pos.x, child.pos.y, this.touchSize, 0, Math.PI * 2, true )

      this.ctx.closePath()

      this.ctx.fill()
      this.ctx.stroke()
      this.ctx.fillRect( this.x + child.x, this.y + child.y, this.childWidth, this.childHeight);
      this.ctx.textBaseline = 'middle'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = this.stroke
      this.ctx.font = 'normal 20px Helvetica'
      this.ctx.fillText( child.name, child.pos.x, child.pos.y )
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
    this.element.addEventListener( 'pointerup',  this.pointerup )
    window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
  },

  events: {
    pointerdown( e ) {
      this.active = true
      this.pointerId = e.pointerId

      this.processPointerPosition( e ) // change xy value on click / touchdown

      
      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },

    pointerup( e ) {
      //if( this.active && e.pointerId === this.pointerId ) {
        //this.active = false
        //window.removeEventListener( 'pointermove', this.pointermove ) 
        //window.removeEventListener( 'pointerup',   this.pointerup ) 
      //}
      let touch = this.touches.find( t => t.pointerId === e.pointerId )

      if( touch !== undefined ) {
        //console.log( 'found', touch.name, e.pointerId )
        touch.vel.x = ( e.clientX - touch.lastX ) * .5
        touch.vel.y = ( e.clientY - touch.lastY ) * .5
        //console.log( touch.vel.x, e.clientX, touch.lastX, touch.pos.x  )
        touch.pointerId = null
      }else{
        console.log('undefined touch', e.pointerId )
      }
    },

    pointermove( e ) {
      let touch = this.touches.find( t => t.pointerId === e.pointerId )

      if( touch !== undefined ) {
        touch.lastX = touch.pos.x
        touch.lastY = touch.pos.y

        touch.pos.x = e.clientX
        touch.pos.y = e.clientY
      }

    },
  },
  
  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the XY's position, and triggers output.
   * @instance
   * @memberof XY
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition( e ) {
    let closestDiff = Infinity,
        touchFound = null,
        touchNum = null

    for( let i = 0; i < this.touches.length; i++) {
      let touch = this.touches[ i ],
          xdiff = Math.abs( touch.pos.x - e.clientX ),
          ydiff = Math.abs( touch.pos.y - e.clientY )

      if( xdiff + ydiff < closestDiff ) {
        closestDiff = xdiff + ydiff
        touchFound = touch
        touchNum = i
        //console.log( 'touch found', touchNum, closestDiff, e.pointerId )
      }
    }

    touchFound.isActive = true
    touchFound.vel.x = 0
    touchFound.vel.y = 0
    touchFound.pos.x = touchFound.lastX = e.clientX
    touchFound.pos.y = touchFound.lastY = e.clientY
    touchFound.pointerId = e.pointerId

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
  },

})

module.exports = XY

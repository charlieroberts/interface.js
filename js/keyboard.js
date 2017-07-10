import CanvasWidget from './canvasWidget.js'
import Utilities    from './utilities.js'

/**
 * A horizontal or vertical fader. 
 * @module Keys
 * @augments CanvasWidget
 */ 

const Keys = Object.create( CanvasWidget ) 

const keyTypesForNote = {
  c:     'wRight',
  'c#':  'b',
  db:    'b',
  d:     'wMiddle',
  'd#':  'b',
  eb:    'b',
  e:     'wLeft',
  f:     'wRight',
  'f#':  'b',
  gb:    'b',
  g:     'wMiddleR',
  'g#':  'b',
  ab:    'b',
  a:     'wMiddleL',
  'a#':  'b',
  bb:    'b',
  b:     'wLeft' 
} 

const noteIntegers = [
  'c','db','d','eb','e','f','gb','g','ab','a','bb','b'
]

const keyColors = [
  1,0,1,0,1,1,0,1,0,1,0,1
]


Object.assign( Keys, {
  /** @lends Keys.prototype */

  /**
   * A set of default property settings for all Keys instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Keys
   * @static
   */  
  defaults: {
    active:     false,
    startKey:   36,
    endKey:     60,
    whiteColor: '#fff',
    blackColor: '#000',
  },

  /**
   * Create a new Keys instance.
   * @memberof Keys
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize Keys with.
   * @static
   */
  create( props ) {
    let keys = Object.create( this )
    
    // apply Widget defaults, then overwrite (if applicable) with Keys defaults
    CanvasWidget.create.call( keys )

    // ...and then finally override with user defaults
    Object.assign( 
      keys, 
      Keys.defaults, 
      props, 
      { 
        value:{}, 
        __value:{}, 
        bounds:[], 
        active:{},
        __prevValue:[]
      }
    )

    // set underlying value if necessary... TODO: how should this be set given min/max?
    if( props.value ) keys.__value = props.value
    
    // inherits from Widget
    keys.init()

    for( let i = keys.startKey; i < keys.endKey; i++ ) {
      keys.__value[ i ] = 0
      keys.value[ i ] = 0
      keys.bounds[ i ] = []
    }

    keys.onplace = () => keys.__defineBounds()

    return keys
  },

  __defineBounds() {
    const keyRange = this.endKey - this.startKey
    const rect = this.rect
    const keyWidth = (rect.width / keyRange) * 1.725
    const blackHeight = .65 * rect.height

    let currentX = 0

    for( let i = 0; i < keyRange; i++ ) {
      let bounds = this.bounds[ this.startKey + i ]
      let noteNumber = ( this.startKey + i ) % 12
      let noteName   = noteIntegers[ noteNumber ]
      let noteDrawType = keyTypesForNote[ noteName ]
      
      switch( noteDrawType ) {
        case 'wRight':
          bounds.push({ x:currentX, y:0 })
          bounds.push({ x:currentX, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .6, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .6, y:0 })
          bounds.push({ x:currentX, y:0 })

          currentX += keyWidth * .6
          break

        case 'b':
          bounds.push({ x:currentX, y:0 })
          bounds.push({ x:currentX, y:blackHeight  })
          bounds.push({ x:currentX + keyWidth * .6, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .6, y:0 })
          bounds.push({ x:currentX, y:0 })

          currentX += keyWidth * .4
          break

        case 'wMiddle':
          bounds.push({ x:currentX, y:blackHeight })
          bounds.push({ x:currentX, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .8, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .8, y:0 })
          bounds.push({ x:currentX + keyWidth * .2, y:0 })
          bounds.push({ x:currentX + keyWidth * .2, y:blackHeight })
          bounds.push({ x:currentX, y:blackHeight })

          currentX += keyWidth * .8
          break 

        case 'wLeft':
          currentX -= keyWidth * .2 

          bounds.push({ x:currentX, y:blackHeight })
          bounds.push({ x:currentX, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:0 })
          bounds.push({ x:currentX + keyWidth * .4, y:0 })
          bounds.push({ x:currentX + keyWidth * .4, y:blackHeight })
          bounds.push({ x:currentX, y:blackHeight })
          
          currentX += keyWidth
          break

        case 'wMiddleR':
          bounds.push({ x:currentX + keyWidth *.2, y:0 })
          bounds.push({ x:currentX + keyWidth *.2, y:blackHeight })
          bounds.push({ x:currentX, y:blackHeight })
          bounds.push({ x:currentX, y:rect.height })
          bounds.push({ x:currentX + keyWidth * 1.1, y:rect.height })
          bounds.push({ x:currentX + keyWidth * 1.1, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .7, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .7, y:0 })
          bounds.push({ x:currentX + keyWidth *.2, y:0 })

          currentX += keyWidth * .7
          break 

        case 'wMiddleL':
          currentX -= keyWidth * .1

          bounds.push({ x:currentX, y:blackHeight })
          bounds.push({ x:currentX, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:rect.height })
          bounds.push({ x:currentX + keyWidth, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .8, y:blackHeight })
          bounds.push({ x:currentX + keyWidth * .8, y:0 })
          bounds.push({ x:currentX + keyWidth * .3, y:0 })
          bounds.push({ x:currentX + keyWidth * .3, y:blackHeight })
          bounds.push({ x:currentX, y:blackHeight })
          
          currentX += keyWidth * .8
          break
        default:
      }
    }
  },

  /**
   * Draw the Keys onto its canvas context using the current .__value property.
   * @memberof Keys
   * @instance
   */
  draw() {
    const ctx  = this.ctx  
    ctx.strokeStyle = this.blackColor
    ctx.lineWidth = 1
    
    let count  = 0
    for( let bounds of this.bounds ) {
      if( bounds === undefined ) continue 

      let noteNumber = ( this.startKey + count ) % 12
      let noteName   = noteIntegers[ noteNumber ]
      let noteDrawType = keyTypesForNote[ noteName ]

      ctx.beginPath()

      ctx.moveTo( bounds[0].x, bounds[0].y )

      for( let idx = 1; idx < bounds.length; idx++ ) {
        ctx.lineTo( bounds[ idx ].x, bounds[ idx ].y )
      }

      ctx.closePath()
      
      if( this.__value[ this.startKey + count ] === 1 ) {
        ctx.fillStyle = '#999'
      }else{
        ctx.fillStyle = keyColors[ noteNumber ] === 1 ? this.whiteColor : this.blackColor
      }

      ctx.fill()
      ctx.stroke()

      count++
    }
  },

  addEvents() {
    // create event handlers bound to the current object, otherwise 
    // the 'this' keyword will refer to the window object in the event handlers
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    // only listen for mousedown intially; mousemove and mouseup are registered on mousedown
    this.element.addEventListener( 'pointerdown', this.pointerdown )
    this.element.addEventListener( 'pointerup',   this.pointerup )
  },

  events: {
    pointerdown( e ) {
      let hit = this.processPointerPosition( e, 'down' ) // change keys value on click / touchdown
      if( hit !== null ) {
        this.active[ e.pointerId ] = hit 
        //this.active[ e.pointerId ].lastButton = data.buttonNum
      }

      //window.addEventListener( 'pointermove', this.pointermove ) // only listen for up and move events after pointerdown 
      //window.addEventListener( 'pointerup',   this.pointerup ) 
    },

    pointerup( e ) {
      let keyNum = this.active[ e.pointerId ]

      if( keyNum !== undefined ) { 
        delete this.active[ e.pointerId ]

        this.__value[ keyNum ] = 0
        let shouldDraw = this.output( keyNum )
        if( shouldDraw ) this.draw()

        //window.removeEventListener( 'pointermove', this.pointermove ) 
        //window.removeEventListener( 'pointerup',   this.pointerup ) 
      }
    },

    pointermove( e ) {
      if( this.active && e.pointerId === this.pointerId ) {
        //this.processPointerPosition( e )
      }
    },
  },
  
  /**
   * Generates a value between 0-1 given the current pointer position in relation
   * to the Keys's position, and triggers output.
   * @instance
   * @memberof Keys
   * @param {PointerEvent} e - The pointer event to be processed.
   */
  processPointerPosition( e, dir ) {
    let prevValue = this.value,
        hitKeyNum = null,
        shouldDraw = false

    for( let i = this.startKey; i < this.endKey; i++ ) {
      let hit = Utilities.polyHitTest( e, this.bounds[ i ], this.rect )

      if( hit === true ) {
        hitKeyNum = i
        this.__value[ i ] = dir === 'down' ? 1 : 0
        let __shouldDraw = this.output( hitKeyNum, dir )

        if( __shouldDraw === true ) shouldDraw = true
      }
    }

    if( shouldDraw ) this.draw()

    return hitKeyNum
  },

  output( keyNum, dir ) {
    let value = this.__value[ keyNum ], newValueGenerated = false, prevValue = this.__prevValue[ keyNum ]

    value = this.runFilters( value, this )
    
    this.value[ keyNum ] = value
    
    if( this.target !== null ) this.transmit( [ value, keyNum ] )

    if( prevValue !== undefined ) {
      if( value !== prevValue ) {
        newValueGenerated = true
      }
    }else{
      newValueGenerated = true
    }

    if( newValueGenerated ) { 
      if( this.onvaluechange !== null ) this.onvaluechange( value, keyNum ) 
      
      this.__prevValue[ keyNum ] = value
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated
  },

})

module.exports = Keys

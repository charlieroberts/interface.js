import CanvasWidget from './canvasWidget'

/**
 * A MultiButton with three different styles: 'momentary' triggers a flash and instaneous output, 
 * 'hold' outputs the multiButtons maximum value until it is released, and 'toggle' alternates 
 * between outputting maximum and minimum values on press. 
 * 
 * @module MultiButton
 * @augments CanvasWidget
 */ 

let MultiButton = Object.create( CanvasWidget )

Object.assign( MultiButton, {

  /** @lends MultiButton.prototype */

  /**
   * A set of default property settings for all MultiButton instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof MultiButton
   * @static
   */  
  defaults: {
    rows:2,
    columns:2,
    lastButton:null,
    /**
     * The style property can be 'momentary', 'hold', or 'toggle'. This
     * determines the interaction of the MultiButton instance.
     * @memberof MultiButton
     * @instance
     * @type {String}
     */
    style:  'toggle'
  },

  /**
   * Create a new MultiButton instance.
   * @memberof MultiButton
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a MultiButton instance with.
   * @static
   */
  create( props ) {
    let multiButton = Object.create( this )
    
    CanvasWidget.create.call( multiButton )

    Object.assign( multiButton, MultiButton.defaults, props )

    if( props.value ) {
      multiButton.__value = props.value
    }else{
      multiButton.__value = []
      for( let i = 0; i < multiButton.count; i++ ) multiButton.__value[ i ] = 0
      multiButton.value = []
    }
    
    multiButton.active = {}
    multiButton.__prevValue = []

    multiButton.init()

    return multiButton
  },

  /**
   * Draw the MultiButton into its canvas context using the current .__value property and multiButton style.
   * @memberof MultiButton
   * @instance
   */
  draw() {
    this.ctx.fillStyle   = this.__value === 1 ? this.fill : this.background
    this.ctx.strokeStyle = this.stroke
    this.ctx.lineWidth = this.lineWidth

    let buttonWidth  = this.rect.width  / this.columns,  
        buttonHeight = this.rect.height / this.rows

    for( let row = 0; row < this.rows; row++ ) {
      let y = row * buttonHeight
      for( let column = 0; column < this.columns; column++ ) {
        let x = column * buttonWidth,
            buttonNum = row * this.columns + column

        this.ctx.fillStyle = this.__value[ buttonNum ] === 1 ? this.fill : this.background
        this.ctx.fillRect( x,y, buttonWidth, buttonHeight )
        this.ctx.strokeRect( x,y, buttonWidth, buttonHeight )
      }
    }
  },

  addEvents() {
    for( let key in this.events ) {
      this[ key ] = this.events[ key ].bind( this ) 
    }

    this.element.addEventListener( 'pointerdown',  this.pointerdown )
  },

  getDataFromEvent( e ) {
    let rowSize = 1/this.rows,
        row =  Math.floor( ( e.clientY / this.rect.height ) / rowSize ),
        columnSize = 1/this.columns,
        column =  Math.floor( ( e.clientX / this.rect.width ) / columnSize ),
        buttonNum = row * this.columns + column

     return { buttonNum, row, column }
  },

  processButtonOn( data, e ) {
    if( this.style === 'toggle' ) {
      this.__value[ buttonNum ] = this.__value[ buttonNum ] === 1 ? 0 : 1
    }else if( this.style === 'momentary' ) {
      this.__value[ buttonNum ] = 1
      setTimeout( ()=> { 
        this.__value[ buttonNum ] = 0;
        //let idx = this.active.findIndex( v => v.buttonNum === buttonNum )
        //this.active.splice( idx, 1 )
        this.active[ e.pointerId ].splice( this.active[ e.pointerId ].indexOf( buttonNum ), 1 )
        this.draw() 
      }, 50 )
    }else if( this.style === 'hold' ) {
      this.__value[ data.buttonNum ] = 1
    }

    this.output( data )

    this.draw()
  },

  events: {
    pointerdown( e ) {
      // only hold needs to listen for pointerup events; toggle and momentary only care about pointerdown
      let data = this.getDataFromEvent( e )

      this.active[ e.pointerId ] = [ data.buttonNum ]
      this.active[ e.pointerId ].lastButton = data.buttonNum

      window.addEventListener( 'pointermove', this.pointermove ) 
      window.addEventListener( 'pointerup', this.pointerup ) 

      this.processButtonOn( data, e )
    },

    pointermove( e ) {
      let data = this.getDataFromEvent( e )
      
      let checkForPressed = this.active[ e.pointerId ].indexOf( data.buttonNum ),
          lastButton  = this.active[ e.pointerId ].lastButton
      
      if( checkForPressed === -1 && lastButton !== data.buttonNum ) {
        
        if( this.style === 'toggle' || this.style === 'hold' ) {
          if( this.style === 'hold' ) {
            this.__value[ lastButton ] = 0
            this.output( data )
          }
          this.active[ e.pointerId ] = [ data.buttonNum ]
        }else{
          this.active[ e.pointerId ].push( data.buttonNum )
        }

        this.active[ e.pointerId ].lastButton = data.buttonNum

        this.processButtonOn( data, e )
      }
    },

    pointerup( e ) {
      if( Object.keys( this.active ).length ) {
        window.removeEventListener( 'pointerup',   this.pointerup )
        window.removeEventListener( 'pointermove', this.pointermove )

        if( this.style !== 'toggle' ) {
          let buttonsForPointer = this.active[ e.pointerId ]

          if( buttonsForPointer !== undefined ) {
            for( let button of buttonsForPointer ) {
              this.__value[ button ] = 0
              let row = Math.floor( button / this.rows ),
                  column = button % this.columns

              this.output({ buttonNum:button, row, column })
            }
          
            delete this.active[ e.pointerId ]
            
            this.draw()
          }
        }
      }
    }
  },

  output( buttonData ) {
    let value = this.__value[ buttonData.buttonNum ], newValueGenerated = false, prevValue = this.__prevValue[ buttonData.buttonNum ]

    value = this.runFilters( value, this )
    
    this.value[ buttonData.buttonNum ] = value
    
    if( this.target !== null ) this.transmit( [ value, buttonData.row, buttonData.column ] )

    if( prevValue !== undefined ) {
      if( value !== prevValue ) {
        newValueGenerated = true
      }
    }else{
      newValueGenerated = true
    }

    if( newValueGenerated ) { 
      if( this.onvaluechange !== null ) this.onvaluechange( value, buttonData.row, buttonData.column )
      
      this.__prevValue[ buttonData.buttonNum ] = value
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated
  },
})

export default MultiButton

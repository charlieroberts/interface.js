import DOMWidget from './domWidget'
import Utilities from './utilities'
import WidgetLabel from './widgetLabel'

/**
 * CanvasWidget is the base class for widgets that use HTML canvas elements.
 * @module CanvasWidget
 * @augments DOMWidget
 */ 

let CanvasWidget = Object.create( DOMWidget )

Object.assign( CanvasWidget, {
  /** @lends CanvasWidget.prototype */

  /**
   * A set of default colors and canvas context properties for use in CanvasWidgets
   * @type {Object}
   * @static
   */  
  defaults: {
    background:'#888',
    fill:'#aaa',
    stroke:'rgba(255,255,255,.3)',
    lineWidth:4,
    defaultLabel: {
      x:.5, y:.5, align:'center', width:1, text:'demo'
    },
    shouldDisplayValue:false
  },
  /**
   * Create a new CanvasWidget instance
   * @memberof CanvasWidget
   * @constructs
   * @static
   */
  create( props ) {
    let shouldUseTouch = Utilities.getMode() === 'touch'
    
    DOMWidget.create.call( this )

    Object.assign( this, CanvasWidget.defaults )

    /**
     * Store a reference to the canvas 2D context.
     * @memberof CanvasWidget
     * @instance
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = this.element.getContext( '2d' )

    this.applyHandlers( shouldUseTouch )
  },

  /**
   * Create a the canvas element used by the widget and set
   * some default CSS values.
   * @memberof CanvasWidget
   * @static
   */
  createElement() {
    let element = document.createElement( 'canvas' )
    element.setAttribute( 'touch-action', 'none' )
    element.style.position = 'absolute'
    element.style.display  = 'block'
    
    return element
  },

  applyHandlers( shouldUseTouch=false ) {
    let handlers = shouldUseTouch ? CanvasWidget.handlers.touch : CanvasWidget.handlers.mouse
    
    // widgets have ijs defined handlers stored in the _events array,
    // and user-defined events stored with 'on' prefixes (e.g. onclick, onmousedown)
    for( let handlerName of handlers ) {
      this.element.addEventListener( handlerName, event => {
        if( typeof this[ 'on' + handlerName ]  === 'function'  ) this[ 'on' + handlerName ]( event )
      })
    }

  },

  handlers: {
    mouse: [
      'mouseup',
      'mousemove',
      'mousedown',
    ],
    touch: []
  },

  addLabel() {
    let props = Object.assign( { ctx: this.ctx }, this.label || this.defaultLabel ),
        label = WidgetLabel.create( props )

    this.label = label
    this._draw = this.draw
    this.draw = function() {
      this._draw()
      this.label.draw()
    }
  },

  __addToPanel( panel ) {
    this.container = panel

    if( typeof this.addEvents === 'function' ) this.addEvents()

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place() 

    if( this.label || this.shouldDisplayValue ) this.addLabel()
    if( this.shouldDisplayValue ) {
      this.__postfilters.push( ( value ) => { 
        this.label.text = value.toFixed( 5 )
        return value
      })
    }
    this.draw()     

  }
})

export default CanvasWidget

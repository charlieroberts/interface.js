import Filters from './filters'
import Communication from './communication.js'
import Utilities from './utilities'

/**
 * Widget is the base class that all other UI elements inherits from. It primarily
 * includes methods for filtering / scaling output.
 * @module Widget
 */


let Widget = {
  /** @lends Widget.prototype */
  
  /**
   * store all instantiated widgets.
   * @type {Array.<Widget>}
   * @static
   */  
  widgets: [],
  lastValue: null,
  onvaluechange: null,

  /**
   * A set of default property settings for all widgets
   * @type {Object}
   * @static
   */  
  defaults: {
    min:0, max:1,
    scaleOutput:true, // apply scale filter by default for min / max ranges
    target:null,
    __prevValue:null
  },
  
  /**
   * Create a new Widget instance
   * @memberof Widget
   * @constructs
   * @static
   */
  create() {
    Object.assign( this, Widget.defaults )
    
    /** 
     * Stores filters for transforming widget output.
     * @memberof Widget
     * @instance
     */
    this.filters = []

    this.__prefilters = []
    this.__postfilters = []

    Widget.widgets.push( this )

    return this
  },

  /**
   * Initialization method for widgets. Checks to see if widget contains
   * a 'target' property; if so, makes sure that communication with that
   * target is initialized.
   * @memberof Widget
   * @instance
   */

  init() {
    if( this.target && this.target === 'osc' || this.target === 'midi' ) {
      if( !Communication.initialized ) Communication.init()
    }

    // if min/max are not 0-1 and scaling is not disabled
    if( this.scaleOutput && (this.min !== 0 || this.max !== 1 )) {      
      this.__prefilters.push( 
        Filters.Scale( 0,1,this.min,this.max ) 
      )
    }
  },

  runFilters( value, widget ) {
    for( let filter of widget.__prefilters )  value = filter( value )
    for( let filter of widget.filters )       value = filter( value )
    for( let filter of widget.__postfilters ) value = filter( value )
   
    return value
  },

  /**
   * Calculates output of widget by running .__value property through filter chain.
   * The result is stored in the .value property of the widget, which is then
   * returned.
   * @memberof Widget
   * @instance
   */
  output() {
    let value = this.__value, newValueGenerated = false, lastValue = this.value, isArray

    isArray = Array.isArray( value )

    if( isArray ) {
      value = value.map( v => Widget.runFilters( v, this ) )
    }else{
      value = this.runFilters( value, this )
    }
    
    this.value = value
    
    if( this.target !== null ) this.transmit( this.value )

    if( this.__prevValue !== null ) {
      if( isArray ) {
        if( !Utilities.compareArrays( this.__value, this.__prevValue ) ) {
          newValueGenerated = true
        }
      } else if( this.__value !== this.__prevValue ) {
        newValueGenerated = true
      }
    }else{
      newValueGenerated = true
    }

    if( newValueGenerated ) { 
      if( this.onvaluechange !== null ) this.onvaluechange( this.value, lastValue )

      if( Array.isArray( this.__value ) ) {
        this.__prevValue = this.__value.slice()
      } else {
        this.__prevValue = this.__value
      }
    }

    // newValueGenerated can be use to determine if widget should draw
    return newValueGenerated
  },

  /**
   * If the widget has a remote target (not a target inside the interface web page)
   * this will transmit the widgets value to the remote destination.
   * @memberof Widget
   * @instance
   */
  transmit( output ) {
    if( this.target === 'osc' ) {
      Communication.OSC.send( this.address, output )
    } else {
      if( this.target[ this.key ] !== undefined ) {
        if( typeof this.target[ this.key ] === 'function' ) {
          this.target[ this.key ]( output )
        }else{
          this.target[ this.key ] = output 
        }
      }
    }
  },
}

export default Widget

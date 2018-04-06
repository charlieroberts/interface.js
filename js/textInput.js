import DOMWidget from './domWidget.js'

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */ 
let Input = Object.create( DOMWidget ) 

Object.assign( Input, {
  /** @lends Input.prototype */

  /**
   * A set of default property settings for all Input instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Input
   * @static
   */ 
  defaults: {
    __value:0,
    value:0,
    background:'#333',
    fill:'#777',
    stroke:'#aaa',
    borderWidth:4,

  /**
   * The options array stores the different possible values for the Input
   * widget. There are used to create HTML option elements which are then
   * attached to the primary select element used by the Input.
   * @memberof Input
   * @instance
   * @type {Array}
   */ 
    options:[],
    onvaluechange:null
  },

  /**
   * Create a new Input instance.
   * @memberof Input
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Input with.
   * @static
   */
  create( props ) {
    let menu = Object.create( this )
    
    DOMWidget.create.call( menu )

    Object.assign( menu, Input.defaults, props )

    menu.element.innerHTML = menu.value

    menu.element.addEventListener( 'change', ( e )=> {
      menu.__value = e.target.value
      menu.output()

      if( menu.onvaluechange !== null ) {
        menu.onvaluechange( menu.value  )
      }
    })

    menu.init()

    return menu
  },

  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Input 
   * @instance
   */
  createElement() {
    let input = document.createElement( 'input' )

    return input
  },

  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Input 
   * @instance
   */
  __addToPanel( panel ) {
    this.container = panel

    if( typeof this.addEvents === 'function' ) this.addEvents()

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place() 
  }

})

export default Input

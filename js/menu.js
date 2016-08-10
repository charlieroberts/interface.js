import DOMWidget from './domWidget.js'

/**
 * A HTML select element, for picking items from a drop-down menu. 
 * 
 * @module Menu
 * @augments DOMWidget
 */ 
let Menu = Object.create( DOMWidget ) 

Object.assign( Menu, {
  /** @lends Menu.prototype */

  /**
   * A set of default property settings for all Menu instances.
   * Defaults can be overridden by user-defined properties passed to
   * construtor.
   * @memberof Menu
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
   * The options array stores the different possible values for the Menu
   * widget. There are used to create HTML option elements which are then
   * attached to the primary select element used by the Menu.
   * @memberof Menu
   * @instance
   * @type {Array}
   */ 
    options:[],
    onvaluechange:null
  },

  /**
   * Create a new Menu instance.
   * @memberof Menu
   * @constructs
   * @param {Object} [props] - A dictionary of properties to initialize a Menu with.
   * @static
   */
  create( props ) {
    let menu = Object.create( this )
    
    DOMWidget.create.call( menu )

    Object.assign( menu, Menu.defaults, props )

    menu.createOptions()

    menu.element.addEventListener( 'change', ( e )=> {
      menu.__value = e.target.value
      menu.output()

      if( menu.onvaluechange !== null ) {
        menu.onvaluechange( menu.value  )
      }
    })

    return menu
  },

  /**
   * Create primary DOM element (select) to be placed in a Panel.
   * @memberof Menu 
   * @instance
   */
  createElement() {
    let select = document.createElement( 'select' )

    return select
  },

  /**
   * Generate option elements for menu. Removes previously appended elements.
   * @memberof Menu 
   * @instance
   */
  createOptions() {
    this.element.innerHTML = ''

    for( let option of this.options ) {
      let optionEl = document.createElement( 'option' )
      optionEl.setAttribute( 'value', option )
      optionEl.innerText = option
      this.element.appendChild( optionEl )
    }
  },

  /**
   * Overridden virtual method to add element to panel.
   * @private
   * @memberof Menu 
   * @instance
   */
  __addToPanel( panel ) {
    this.container = panel

    if( typeof this.addEvents === 'function' ) this.addEvents()

    // called if widget uses DOMWidget as prototype; .place inherited from DOMWidget
    this.place() 
  }

})

export default Menu

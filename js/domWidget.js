import Widget from './widget'
import Utilities from './utilities'

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

let DOMWidget = Object.create( Widget )

Object.assign( DOMWidget, {
  /** @lends DOMWidget.prototype */

  /**
   * A set of default property settings for all DOMWidgets
   * @type {Object}
   * @static
   */  
  defaults: {
    x:0,y:0,width:.25,height:.25,
    attached:false,
  },

  /**
   * Create a new DOMWidget instance
   * @memberof DOMWidget
   * @constructs
   * @static
   */
  create() {
    let shouldUseTouch = Utilities.getMode() === 'touch'
    
    Widget.create.call( this )

    Object.assign( this, DOMWidget.defaults )

    // ALL INSTANCES OF DOMWIDGET MUST IMPLEMENT CREATE ELEMENT
    if( typeof this.createElement === 'function' ) {

      /**
       * The DOM element used by the DOMWidget
       * @memberof DOMWidget
       * @instance
       */
      this.element = this.createElement()
    }else{
      throw new Error( 'widget inheriting from DOMWidget does not implement createElement method; this is required.' )
    }
  },
  
  /**
   * Create a DOM element to be placed in a Panel.
   * @virtual
   * @memberof DOMWidget
   * @static
   */
  createElement() {
    throw Error( 'all subclasses of DOMWidget must implement createElement()' )
  },

  /**
   * use CSS to position element element of widget
   * @memberof DOMWidget
   */
  place() {
    let containerWidth = this.container.getWidth(),
        containerHeight= this.container.getHeight(),
        width  = this.width  <= 1 ? containerWidth  * this.width : this.width,
        height = this.height <= 1 ? containerHeight * this.height: this.height,
        x      = this.x < 1 ? containerWidth  * this.x : this.x,
        y      = this.y < 1 ? containerHeight * this.y : this.y

    if( !this.attached ) {
      this.attached = true
    }
  
    if( this.isSquare ) {
      if( height > width ) {
        height = width
      }else{
        width = height
      }
    }

    this.element.width  = width
    this.element.style.width = width + 'px'
    this.element.height = height
    this.element.style.height = height + 'px'
    this.element.style.left = x
    this.element.style.top  = y

    /**
     * Bounding box, in absolute coordinates, of the DOMWidget
     * @memberof DOMWidget
     * @instance
     * @type {Object}
     */
    this.rect = this.element.getBoundingClientRect() 

    if( typeof this.onplace === 'function' ) this.onplace()
  },
  
})

export default DOMWidget

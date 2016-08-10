let WidgetLabel = {

  defaults: {
    size:24,
    face:'sans-serif',
    fill:'white',
    align:'center',
    background:null,
    width:1
  },

  create( props ) {
    let label = Object.create( this )

    Object.assign( label, this.defaults, props )

    if( typeof label.ctx === undefined ) throw Error( 'WidgetLabels must be constructed with a canvas context (ctx) argument' )
    
    label.font = `${label.size}px ${label.face}`

    return label
  },

  draw() {
    let cnvs = this.ctx.canvas,
        cwidth = cnvs.width,
        cheight= cnvs.height,
        x      = this.x * cwidth,
        y      = this.y * cheight,
        width  = this.width * cwidth

    if( this.background !== null ) {
      this.ctx.fillStyle = this.background
      this.ctx.fillRect( x,y,width,this.size + 10 )
    }
    
    this.ctx.fillStyle = this.fill
    this.ctx.textAlign = this.align
    this.ctx.font = this.font
    this.ctx.fillText( this.text, x,y,width )    
  }

}

export default WidgetLabel

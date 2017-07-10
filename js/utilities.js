let Utilities = {

  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  },
  
  compareArrays( a1, a2 ) {
    return a1.length === a2.length && a1.every((v,i)=> v === a2[i])
  },


  // ported/adapted from orignal Interface.js ButtonV code by Jonathan Simozar
  polyHitTest( e, bounds, rect ) {
    const w = rect.width,
          h = rect.height,
          p = bounds

    let sides = 0,
        hit = false

    for( let i = 0; i < p.length - 1; i++ ) {
      if( p[ i+1 ].x > p[ i ].x ) {
        if( ( p[ i ].x  <= e.x ) && ( e.x <  p[i+1].x ) ) {
          let yval = ( p[i+1].y - p[i].y )/ ( p[i+1].x - p[i].x ) * h/w * ( e.x - p[i].x ) + p[i].y

          if( yval - e.y < 0 ) sides++
        }
      } else if( p[i+1].x < p[i].x ) {
        if( ( p[i].x >= e.x ) && ( e.x > p[i+1].x ) ) {
          let yval = ( p[i+1].y - p[i].y) / ( p[i+1].x - p[i].x) * h/w * ( e.x - p[i].x ) + p[i].y

          if( yval - e.y < 0 ) sides++
        }
      }
    }

    if( sides % 2 === 1 ) hit = true
 
    return hit
  },

}

export default Utilities

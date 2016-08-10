var webpage = require( 'webpage' ),
    page    = webpage.create()
   // assert  = require( 'assert' )

page.includeJs( 'http://127.0.0.1:18000/tests/babel-polyfill.js', function(){
  page.includeJs( 'http://127.0.0.1:18000/dist/interface.lib.js', run )           
})

page.onConsoleMessage = function( msg ) {
  console.log( 'browser:', msg )
}

page.viewportSize = { width: 100, height: 100 }

var assert = function( condition, msg ) {
  if( !condition ) {
    msg = msg || 'assertion failed.'
    throw new Error( msg )
  }
}

var run = function() {
  page.evaluate( function() {
    var p = Interface.Panel.create(),
        s = Interface.Slider.create({ x:0, y:0, width:1, height:1 }, p),
        e = new Event( 'pointerdown' )

    window.testObject = { p:p, s:s, e:e }

    Object.assign( e, { clientX:25, clientY:25 })
    console.log( 'slider value is', s.value )

    s.canvas.dispatchEvent( e )

    console.log( 'new slider value is', s.value )
  })

  page.sendEvent( 'mousedown', 25, 25 )
  var test = page.evaluate( function() { return window.testObject.s.value } )
  
}

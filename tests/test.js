function runTests() {

  describe( 'testing Slider functionality', function() {
    var panel, slider  

    // carry out before each test... a new panel and slider is created everytime
    before( function() {
      panel  = Interface.Panel.create()
      slider = Interface.Slider.create({ width:1, height:.25 }, panel ) 
    })

    it( 'should have an initial value of .5', function( done ) {
      assert.equal( .5, slider.value )
      done()
    })

    it( 'should have a value of .25 after receiving an event with a clientX of 1/4 width', function( done ) {
      var e = new Event( 'pointerdown' )
      
      // __width property stores width of widget in pixels
      Object.assign( e, { 
        clientX: slider.__width * .25, 
        clientY: 25 
      })
      
      // trigger event on canvas object of widget
      slider.canvas.dispatchEvent( e )

      assert.equal( .25, slider.value )

      done()
    })

    it( 'should not exceed its min or max values no matter what events it receives', function( done ) {
      var e = new Event( 'pointerdown' )

      // if event clientX exceeds width, value should still be 1
      Object.assign( e, { clientX:slider.__width * 2, clientY:200 } )
      slider.canvas.dispatchEvent( e )
      assert.equal( 1, slider.value )

      // if event clientX is less than slider.rect.left, value should still be 0
      Object.assign( e, { clientX:-200, clientY:200 } )
      slider.canvas.dispatchEvent( e )
      assert.equal( 0, slider.value )

      done()
    })

    // cleanup after each test... remove panel (and child slider) from the DOM
    after( function() {
      document.querySelector( 'body' ).removeChild( panel.div ) 
    })

  })

}

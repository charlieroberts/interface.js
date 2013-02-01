#Interface.js

Interface.js is a GUI library designed to be device agnostic; it works with mouse, touch and motion events. This means you can write a GUI once and be reasonably assured that it will work on smartphones, tablets and laptops. Although you can register for touch or mouse events individually with widgets, Interface.js adds a new event category, touchmouse events, that works for both types. The onvaluechange event handler is also agnostic to the touch / mouse divide.

Interface.js also features a simple theming system that makes it easy to experiment with colors or change interface characteristics on the fly. It was inspired by my work on Control and intended for use with my JavaScript DSP library Gibberish; Gibberish + Interface.js together provide a complete system for web-based musical instruments.

## Widgets
* Slider
* MultiSlider
* Crossfader
* Button (toggle, contact and momentary)
* MultiButton
* XY (multitouch with physics)
* Accelerometer
* Orientation
* Label
* Menu
* TextField

## Example Code
```html
<html>
<head>
  <script src="zepto.js"></script>  // requires zepto or jQuery
  <script src="interface.js"></script>
</head>
<body>
  <script>
  panel = new Interface.Panel() // panel fills page by default, alternatively you can specify boundaries
  
  slider1 = new Interface.Slider({
    bounds: [0,0,50,200],
    ontouchmousestart : function() { console.log('touch or mouse down on slider') }
  })
  
  slider2 = new Interface.Slider({
    bounds: [50,0,50,200],
  })
  
  orientation = new Interface.Orientation({ // this only works on devices with a gyro sensor
    onvaluechange : function(pitch, roll, yaw) {
      slider2.setValue(pitch);
    }
  })
  orientation.start()
  
  panel.add( slider1, slider2 )
  </script>
</body>
</html>
```

![Screenshot](https://raw.github.com/charlieroberts/Interface.js/screenshots/screenshot.png) 

## Dependencies
Interface.js requires jQuery or Zepto (a minimal version of jQuery). The demo included in the repo uses Zepto.
## License
Interface.js uses the MIT license.
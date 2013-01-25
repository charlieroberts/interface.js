#Interface.js

Interface.js is a GUI library designed to be device agnostic; it works with mouse, touch and motion events. This means you can write a GUI once and be reasonably assured that it will work on smartphones, tablets and laptops. Although you can register for touch or mouse events individually with widgets, there is also a new category, touchmouse events, that works for both types. The onvaluechange event handler is also agnostic the touch / mouse divide.

## Widgets
* Slider
* MultiSlider
* Button
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
  <script src="zepto.js"></script>
  <script src="interface.js"></script>
</head>
<body>
  <script>
  a = new Interface.Panel() // panel fills page by default, alternatively you can specify boundaries
  
  b = new Interface.Slider({
    bounds: [0,0,50,200],
    ontouchmousestart : function() { console.log('touch begins!!!')}
  })
  
  c = new Interface.Slider({
    bounds: [50,0,50,200],
  })
  
  d = new Interface.Orientation({
    onvaluechange : function(pitch, roll, yaw) {
      c.setValue(pitch);
    }
  })
  
  a.add( b, c )
  </script>
</body>
</html>
```

## License
Interface.js uses the MIT license.
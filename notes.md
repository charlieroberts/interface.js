What unites widgets?
--------------------

* Widgets _output values_ based (primarily) on user interaction
* These output values can be _filtered_ in various ways
* The filtered values can be _transmitted_

Three types of widgets: _Canvas Widgets_, _DOM Widgets_, and _Sensor Widgets_. Each should probably have their own class, although canvas widgets should probably use a DOM widget for their prototype.

DOM widget    - wraps a HTML DOM element
Canvas widget - wraps a canvas DOM element
Sensor        - wraps sensors that are read via JavaScript (accelerometer, GPS, gyroscope etc.) 

* every ui widget (e.g. slider or button) is its own file
* gulp script that concatenates into one file that everyone downloads (and down-converts ecma javascript ES6 to ES5)
* e.g. browserify (called using gulp) does dependency scan and concats files in legit manner

* `git clone . . .`
* `npm install` looks in package.json and installs both compile and runtime dependencies locally

* some notes on gulp
	* gulpfile.js is like a makefile
	* browserify adds node-like capabilities to client-side code

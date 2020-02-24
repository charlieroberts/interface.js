import Widget from './widget'
import Utilities from './utilities'

/**
 * DOMWidget is the base class for widgets that use HTML canvas elements.
 * @augments Widget
 */

const Accelerometer = Object.create( Widget )
const metersPerSecondSquared = 9.80665
const os = Utilities.getOS()

if( os !== 'android' ) {
  Accelerometer.hardwareMin = -2.307 * metersPerSecondSquared  // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
	Accelerometer.hardwareMax = 2.307 * metersPerSecondSquared   // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
}else{
	Accelerometer.hardwareMin  = metersPerSecondSquared
	Accelerometer.hardwareMax = metersPerSecondSquared
}

Accelerometer.hardwareRange = Accelerometer.hardwareMax - Accelerometer.hardwareMin

Object.assign( Accelerometer, {
  value : [0,0,0],
  __value: [0,0,0],
  __prevValue: [0,0,0],

  create() {
    const acc = Object.create( this )
    Widget.create.call( acc )
    acc.addEvents()
    return acc
  },

  addEvents() {
    alert('adding')
    DeviceMotionEvent.requestPermission()
    .then( response => {
      if ( response === 'granted') {
        window.addEventListener( 'devicemotion',  this.update.bind( this ) )
      }
    })
  },

  update( event ) {
    const  acceleration = event.acceleration
    this.x = this.__value[0] = this.min + ((((0 - this.hardwareMin) + acceleration.x) / this.hardwareRange ) * this.max);
    this.y = this.__value[1] = this.min + ((((0 - this.hardwareMin) + acceleration.y) / this.hardwareRange ) * this.max);
    this.z = this.__value[2] = this.min + ((((0 - this.hardwareMin) + acceleration.z) / this.hardwareRange ) * this.max);

    this.output()
  },

}, {
  x:0,
  y:0,
  z:0,
  min: 0,
  max: 1
})

export default Accelerometer 

/*
Interface.Accelerometer = function() {
  var self = this,
      metersPerSecondSquared = 9.80665;

  Interface.extend(this, {
    type:"Accelerometer",

    serializeMe : ["delay"],
    delay : 100, // measured in ms
    min: 0,
    max: 1,
    values : [0,0,0],

    update : function(event) {
      var acceleration = event.acceleration;
      self.x = self.values[0] = self.min + ((((0 - self.hardwareMin) + acceleration.x) / self.hardwareRange ) * self.max);
      self.y = self.values[1] = self.min + ((((0 - self.hardwareMin) + acceleration.y) / self.hardwareRange ) * self.max);
      self.z = self.values[2] = self.min + ((((0 - self.hardwareMin) + acceleration.z) / self.hardwareRange ) * self.max);

      if(typeof self.onvaluechange !== 'undefined') {
        self.onvaluechange(self.x, self.y, self.z);
      }

      self.sendTargetMessage();
    },
    start : function() {
      window.addEventListener('devicemotion', this.update, true);
      return this;
    },
    stop : function() {
      window.removeEventListener('devicemotion', this.update);
      return this;
    },
  })
  .init( arguments[0] );

	if(!Interface.isAndroid) {
	    this.hardwareMin = -2.307 * metersPerSecondSquared;  // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
	    this.hardwareMax = 2.307 * metersPerSecondSquared;   // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
	}else{
	    this.hardwareMin = metersPerSecondSquared;
	    this.hardwareMax = metersPerSecondSquared;
	}

  this.hardwareRange = this.hardwareMax - this.hardwareMin;
};
Interface.Accelerometer.prototype = Interface.Widget;
*/

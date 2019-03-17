"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Filters = {
  Scale: function Scale() {
    var inmin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var inmax = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var outmin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var outmax = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    var inrange = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange;

    return function (input) {
      return outmin + input * rangeRatio;
    };
  }
};

exports.default = Filters;
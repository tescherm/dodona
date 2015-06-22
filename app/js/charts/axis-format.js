var bytes = require('bytes')

var DEFAULT_FORMATTER = function (tick) {
  return tick
}

var UNIT_FORMATS = {
  // byte
  B: function (tick) {
    // handles an initialization case where
    // c3 is scaling the chart
    if (tick < 1) {
      tick = 0
    }
    return bytes(tick)
  },

  // percent
  pct: function (tick) {
    // assumes that the value comes in as a whole percent
    return '%' + Math.round(tick)
  },

  Load: function (tick) {
    return +tick.toFixed(2)
  }
}

module.exports = function (unit) {
  var formatter = UNIT_FORMATS[unit]
  return formatter || DEFAULT_FORMATTER
}

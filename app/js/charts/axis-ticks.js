var X_AXIS_TICKS = {
  small: 4,
  medium: 6,
  large: 12
}

module.exports = function (size) {
  var ticks = X_AXIS_TICKS[size]
  return ticks || 4
}

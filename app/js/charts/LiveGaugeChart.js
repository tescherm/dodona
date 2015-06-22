var _ = require('underscore')

function PointsBuffer (metrics) {
  this._metrics = metrics
  this._buffer = {}
}

PointsBuffer.prototype.add = function (point) {
  this._buffer[point.type] = point.value
}

PointsBuffer.prototype.get = function () {
  return _.map(this._buffer, function (value, key) {
    return [key, value]
  })
}

PointsBuffer.prototype.reset = function () {
  this._buffer = {}
}

PointsBuffer.prototype.has_all_targets = function () {
  var buffer = this._buffer
  var check_targets = function (memo, metric) {
    var has_target = _.any(buffer, function (value, key) {
      return metric.type === key
    })
    return memo && has_target
  }

  return _.reduce(this._metrics, check_targets, true)
}

function LiveGaugeChart (chart) {
  this._chart = chart

  var badge = chart.badge

  var targets = badge.targets
  var metrics = _.pluck(targets, 'metric')

  this._points = new PointsBuffer(metrics)

  var check_flush = function () {
    if (!this._should_flush()) {
      return
    }

    this._flush()
  }.bind(this)

  this._check_flush = _.throttle(check_flush, 3000, {
    leading: false
  })
}

LiveGaugeChart.prototype.flow = function (points) {
  this._buffer_points(points)
  this._check_flush()
}

LiveGaugeChart.prototype.update = function () {
  return this._chart.update.apply(this._chart, arguments)
}

LiveGaugeChart.prototype.destroy = function () {
  return this._chart.destroy.apply(this._chart, arguments)
}

LiveGaugeChart.prototype._buffer_points = function (points) {
  var buf = this._points
  _.each(points, buf.add.bind(buf))
}

LiveGaugeChart.prototype._flush = function () {
  var columns = this._points.get()

  try {
    this._chart.load({
      columns: columns
    })
  } finally {
    this._points.reset()
  }
}

LiveGaugeChart.prototype._should_flush = function () {
  return this._points.has_all_targets()
}

module.exports = LiveGaugeChart

var _ = require('underscore')

var MIN_POINTS = 4

function PointsBuffer (metrics) {
  this._metrics = _.reduce(metrics, function (memo, metric) {
    var type = metric.type

    metric.regex = new RegExp('^(.+\.)?' + type + '$')
    memo[type] = metric
    return memo
  }, {})
  this._buffer = {}
}

PointsBuffer.prototype.add = function (point) {
  var type = point.type
  var time = point.time
  var value = point.value

  var buf = this._buffer

  var metric = this._metrics[type]
  var series = metric.series

  var target = series ? point[series] + '.' + type : type

  if (!buf[target]) {
    buf[target] = []
  }

  buf[target].push(value)

  if (!buf.time) {
    buf.time = []
  }

  var last_time = _.last(buf.time)

  // only push if this time is in the future
  if (last_time && last_time < time) {
    buf.time.push(time)
  }

  if (!last_time) {
    buf.time.push(time)
  }
}

PointsBuffer.prototype.get = function () {
  return _.map(this._buffer, function (value, key) {
    return [key].concat(value)
  })
}

PointsBuffer.prototype.reset = function () {
  this._buffer = {}
}

PointsBuffer.prototype.has_all_targets = function () {
  var buffer = this._buffer
  var check_targets = function (memo, metric) {
    var has_target = _.any(buffer, function (value, key) {
      return metric.regex.test(key)
    })
    return memo && has_target
  }

  return _.reduce(this._metrics, check_targets, true)
}

PointsBuffer.prototype.has_num_points = function (num) {
  return _.every(this._buffer, function (value) {
    return value.length === num
  })
}

function LiveTimeSeriesChart (chart) {
  this._chart = chart

  var badge = chart.badge

  var targets = badge.targets
  var metrics = _.pluck(targets, 'metric')

  this._points = new PointsBuffer(metrics)
}

LiveTimeSeriesChart.prototype._check_flush = function () {
  if (!this._should_flush()) {
    return
  }

  this._flush()
}

LiveTimeSeriesChart.prototype.flow = function (points) {
  this._buffer_points(points)
  this._check_flush()
}

LiveTimeSeriesChart.prototype.update = function () {
  return this._chart.update.apply(this._chart, arguments)
}

LiveTimeSeriesChart.prototype.destroy = function () {
  return this._chart.destroy.apply(this._chart, arguments)
}

LiveTimeSeriesChart.prototype._buffer_points = function (points) {
  var buf = this._points
  _.each(points, buf.add.bind(buf))
}

LiveTimeSeriesChart.prototype._buffer_point = function (point) {
  this._points.add(point)
}

LiveTimeSeriesChart.prototype._flush = function () {
  var columns = this._points.get()

  try {
    this._chart.flow({
      columns: columns
    })
  } finally {
    this._points.reset()
  }
}

LiveTimeSeriesChart.prototype._should_flush = function () {
  return this._points.has_num_points(MIN_POINTS) && this._points.has_all_targets()
}

module.exports = LiveTimeSeriesChart

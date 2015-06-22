var _ = require('underscore')
var key_mirror = require('keyMirror')

var C3Chart = require('./C3Chart')

var axis_format = require('./axis-format')
var axis_ticks = require('./axis-ticks')

var TIME_SERIES_CHARTS = key_mirror({
  'area': null,
  'area-spline': null,
  'line': null,
  'step': null,
  'spline': null
})

function BadgeChart (badge) {
  this.badge = badge

  this.is_time_series = this._is_time_series()
  this.unit = this._get_unit()

  this._chart = this._generate_chart()
}

BadgeChart.prototype._generate_chart = function () {
  var badge = this.badge
  var size = badge.size

  var is_time_series = this.is_time_series
  var unit = this.unit

  var bind_to = '#' + badge.id

  var opts = {
    bindto: bind_to
  }

  if (is_time_series) {
    opts.axis = {
      x: {
        type: 'timeseries',
        tick: {
          format: '%I:%M:%S',
          count: axis_ticks(size)
        }
      },
      y: {
        tick: {
          count: 4,
          format: axis_format(unit)
        }
      }
    }
  }

  opts.color = badge.color || {}
  opts.data = this._data_attributes()

  return new C3Chart(opts)
}

BadgeChart.prototype._data_attributes = function () {
  var badge = this.badge
  var is_time_series = this.is_time_series

  var data = {}

  // set the target name -> chart map
  // for example:
  // { free_memory: 'line', total_memory 'line' }
  data.types = _.reduce(badge.targets, function (memo, target) {
    var chart_type = target.type
    var series = target.metric.type

    memo[series] = chart_type

    return memo
  }, {})

  // x axis is a time type for time series charts
  if (is_time_series) {
    data.x = 'time'
  }

  // could also validate this against the targets
  // (must be a stacked chart, and group values
  // must match the metric types/series)
  if (badge.groups) {
    data.groups = badge.groups
  }

  return data
}

BadgeChart.prototype.flow = function () {
  return this._chart.flow.apply(this._chart, arguments)
}

BadgeChart.prototype.load = function () {
  return this._chart.load.apply(this._chart, arguments)
}

BadgeChart.prototype.update = function () {
  return this._chart.update.apply(this._chart, arguments)
}

BadgeChart.prototype.destroy = function () {
  return this._chart.destroy.apply(this._chart, arguments)
}

BadgeChart.prototype._is_time_series = function () {
  var targets = this.badge.targets
  return _.any(targets, function (target) {
    return TIME_SERIES_CHARTS[target.type]
  })
}

BadgeChart.prototype._get_unit = function () {
  var targets = this.badge.targets
  var units = _.reduce(targets, function (memo, target) {
    var unit = target.metric.unit

    memo[unit] = unit
    return memo
  }, {})

  // no unit(s) declared
  if (_.isEmpty(units)) {
    return
  }

  // the assumption is that series share the same unit, although you could
  // also use c3's ability to create a second y axis (y2) if this is not the case
  if (_.size(units) > 1) {
    console.warn('badge', this.badge.label, 'series do not share the same unit', units)
  }

  return _.first(_.keys(units))
}

module.exports = BadgeChart

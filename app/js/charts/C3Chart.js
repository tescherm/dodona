var _ = require('underscore')
var c3 = require('c3')

function C3Chart (opts) {
  opts = opts || {}

  var data = opts.data || {}
  _.defaults(data, {columns: []})

  _.defaults(opts, {
    data: data,
    point: {
      show: false
    }
  })

  this._chart = c3.generate(opts)
}

C3Chart.prototype.load = function (opts) {
  this._chart.load(opts)
}

C3Chart.prototype.flow = function (opts) {
  _.defaults(opts, {
    columns: [],
    length: 0,
    duration: 350
  })

  this._chart.flow(opts)
}

C3Chart.prototype.transform = function (type, targets) {
  this._chart.transform(type, targets)
}

C3Chart.prototype.resize = function (opts) {
  this._chart.resize({
    height: opts.height,
    width: opts.width
  })
}

C3Chart.prototype.update = function () {
  this._chart.flush()
}

C3Chart.prototype.destroy = function () {
  this._chart.destroy()
}

module.exports = C3Chart

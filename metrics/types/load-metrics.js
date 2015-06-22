var os = require('os')
var _ = require('underscore')

function LoadMetrics () {

}

LoadMetrics.prototype.get = function () {
  var now = _.now()

  var load_avg = os.loadavg()

  var one = load_avg[0]
  var five = load_avg[1]
  var fifteen = load_avg[2]

  var load_metric = function (type, value) {
    return {
      unit: 'Load',
      what: 'loadavg',
      target_type: 'gauge',
      time: now,
      type: type,
      value: value
    }
  }

  return [
    load_metric('one', one),
    load_metric('five', five),
    load_metric('fifteen', fifteen)
  ]
}

module.exports = LoadMetrics
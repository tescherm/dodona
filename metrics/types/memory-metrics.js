var os = require('os')
var _ = require('underscore')

function MemoryMetrics () {

}

MemoryMetrics.prototype.get = function () {
  var now = _.now()

  var total_mem = os.totalmem()
  var free_mem = os.freemem()

  var memory_metric = function (type, value) {
    return {
      unit: 'B',
      what: 'memory',
      type: type,
      target_type: 'gauge',
      value: value,
      time: now
    }
  }

  return [
    memory_metric('free', free_mem),
    memory_metric('total', total_mem),
    memory_metric('used', total_mem - free_mem)
  ]
}

module.exports = MemoryMetrics
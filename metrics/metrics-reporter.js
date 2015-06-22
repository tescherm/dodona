var _ = require('underscore')
var os = require('os')
var Promise = require('bluebird')
var FireHoseClient = require('../shared/firehose-client')

var CpuMetrics = require('./types/cpu-metrics')
var LoadMetrics = require('./types/load-metrics')
var MemoryMetrics = require('./types/memory-metrics')
var DiskMetrics = require('./types/disk-metrics')

function MetricsReporter (opts) {
  opts = opts || {}

  this.cpu = new CpuMetrics()
  this.load = new LoadMetrics()
  this.mem = new MemoryMetrics()
  this.disk = new DiskMetrics()

  this.client = opts.client || new FireHoseClient({
    port: 6060,
    address: '0.0.0.0'
  })
}

MetricsReporter.prototype.send = function () {
  var metrics = [
    this.cpu.get(),
    this.load.get(),
    this.mem.get(),
    this.disk.get()
  ]

  var client = this.client

  Promise.all(metrics)
  .settle()
  .reduce(function (points, result) {
    if (result.isRejected()) {
      var err = result.reason()
      logger.error('could not collect metrics', err)
    }

    var metrics = _.map(result.value(), function (metric) {
      return _.defaults(metric, {server: os.hostname()})
    })

    points = points.concat(metrics)
    return points;
  }, []).then(function (points) {
    // fire and forget
    client.send(points)
  }).done()
}

module.exports = MetricsReporter
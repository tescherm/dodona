var os = require('os');
var Promise = require('bluebird');
var statvfs = Promise.promisify(require('statvfs'))
var _ = require('underscore')

var DEFAULT_DIR = os.tmpdir()

function DiskMetrics (opts) {
  opts = opts || {}

  this._dir = opts.dir || DEFAULT_DIR
}

DiskMetrics.prototype.get = function () {
  var now = _.now()
  var dir = this._dir

  var disk_metric = function (type, value) {
    return {
      unit: 'B',
      dir: dir,
      what: 'disk_space',
      target_type: 'gauge',
      time: now,
      type: type,
      value: value
    }
  }

  return statvfs(dir).then(function (info) {
    var free = info.bavail * info.frsize
    var total = info.blocks * info.frsize

    return [
      disk_metric('free', free),
      disk_metric('total', total),
      disk_metric('used', total - free)
    ]
  })
}

module.exports = DiskMetrics
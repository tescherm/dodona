var os = require('os')
var _ = require('underscore')

var CPU_STATES = ['user', 'nice', 'sys', 'idle', 'irq']

function CpuDelta (cpus) {
  this.cpus = cpus
}

CpuDelta.prototype.compute = function (other) {
  if (_.size(other.cpus) !== _.size(this.cpus)) {
    throw new Error('cpu core count must match')
  }

  var core_results = _.map(this.cpus, function (cpu, core_id) {
    var core = {
      times: {},
      times_pct: {},
      id: core_id
    }

    var other_core = other.cpus[core_id];

    var total_time = _.reduce(CPU_STATES, function (total_time, state) {
      var time = other_core.times[state] - cpu.times[state]

      core.times[state] = time
      total_time += time

      return total_time
    }, 0)

    // as percent
    _.each(CPU_STATES, function (state) {
      if (total_time === 0) {
        core.times_pct[state] = 0
      } else {
        var total_pct = Math.round((core.times[state] / total_time) * 100)
        core.times_pct[state] = total_pct
      }
    });

    return core
  })

  // compute average usage across cores
  var total_usage = this._compute_average_usage(core_results)

  return {
    total: total_usage,
    cores: core_results
  }
}

CpuDelta.prototype._compute_average_usage = function (core_results) {
  // sum across cores
  var totals = _.reduce(core_results, function (memo, result) {
    _.each(result.times_pct, function (value, key) {
      if (!memo[key]) {
        memo[key] = value
      } else {
        memo[key] = memo[key] + value
      }
    })
    return memo
  }, {})

  // take the average
  _.each(totals, function (value, state) {
    totals[state] = totals[state] / _.size(core_results)
  })

  return totals
}

function CpuMetrics () {
  this.cpu_delta = new CpuDelta(os.cpus())
}

CpuMetrics.prototype.get = function () {
  var now = _.now()

  var current_cpu = new CpuDelta(os.cpus())
  var cpu_stats = this.cpu_delta.compute(current_cpu)

  this.cpu_delta = current_cpu

  var cpu_total_metric = function (type, value) {
    return {
      unit: 'pct',
      what: 'total_cpu',
      target_type: 'gauge',
      time: now,
      type: type,
      value: value
    }
  }

  var cpu_core_metric = function (core, value) {
    return {
      unit: 'pct',
      what: 'cpu',
      target_type: 'gauge',
      time: now,
      type: 'used',
      core: core,
      value: value
    }
  }

  var metrics = [];

  _.each(cpu_stats.total, function (pct, state) {
    metrics.push(cpu_total_metric(state, pct))
  })

  var idle = cpu_stats.total.idle
  metrics.push(cpu_total_metric('used', 100 - Math.round(idle)))

  _.each(cpu_stats.cores, function (core) {
    var idle = core.times_pct.idle
    metrics.push(cpu_core_metric(core.id, 100 - Math.round(idle)))
  })

  return metrics
}

module.exports = CpuMetrics
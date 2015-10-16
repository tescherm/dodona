var _ = require('underscore')
var expect = require('chai').expect

var CpuMetrics = require('../../../metrics/types/cpu-metrics')

describe('cpu metrics', function () {
  it('can collect metrics', function () {
    var metrics = new CpuMetrics()
    var res = metrics.get()

    expect(res).an('array')
    expect(res.length).gt(0)

    _.each(res, function (metric) {
      expect(metric.unit).equals('pct')
      expect(metric.what).a('string')
      expect(metric.target_type).equals('gauge')
      expect(metric.time).a('number')
      expect(metric.type).a('string')
      expect(metric.value).a('number')
    })
  })
})

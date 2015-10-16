var _ = require('underscore')
var expect = require('chai').expect

var MemoryMetrics = require('../../../metrics/types/memory-metrics')

describe('load metrics', function () {
  it('can collect metrics', function () {
    var metrics = new MemoryMetrics()
    var res = metrics.get()

    expect(res).an('array')
    expect(res.length).equals(3)

    _.each(res, function (metric) {
      expect(metric.unit).equals('B')
      expect(metric.what).a('string')
      expect(metric.target_type).equals('gauge')
      expect(metric.time).a('number')
      expect(metric.type).a('string')
      expect(metric.value).a('number')
    })
  })
})

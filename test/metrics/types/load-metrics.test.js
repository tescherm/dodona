var _ = require('underscore')
var expect = require('chai').expect

var LoadMetrics = require('../../../metrics/types/load-metrics')

describe('load metrics', function () {
  it('can collect metrics', function () {
    var metrics = new LoadMetrics()
    var res = metrics.get()

    expect(res).an('array')
    expect(res.length).equals(3)

    _.each(res, function (metric) {
      expect(metric.unit).equals('Load')
      expect(metric.what).a('string')
      expect(metric.target_type).equals('gauge')
      expect(metric.time).a('number')
      expect(metric.type).a('string')
      expect(metric.value).a('number')
    })
  })
})

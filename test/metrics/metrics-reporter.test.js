var _ = require('underscore')
var expect = require('chai').expect

var MetricsReporter = require('../../metrics/metrics-reporter')

describe('metrics reporter', function () {

  it('can report metrics', function (done) {
    var mockClient = {
      send: function (points) {
        expect(points).an('array')
        expect(points.length).gt(0)

        _.each(points, function (point) {
          expect(point.unit).a('string')
          expect(point.what).a('string')
          expect(point.target_type).a('string')
          expect(point.time).a('number')
          expect(point.server).a('string')
          expect(point.type).a('string')
          expect(point.value).a('number')
        })

        done()
      }
    }

    var reporter = new MetricsReporter({client: mockClient})
    reporter.send()
  })
})

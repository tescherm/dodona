var _ = require('underscore')

var request = require('supertest')
var url = require('url')

var expect = require('chai').expect

var ApiService = require('../../../api-service')

var validate_badge = function (badge) {
  expect(badge.id).a('string')
  expect(badge.label).a('string')
  expect(badge.size).a('string')

  var targets = badge.targets
  expect(targets).an('array')

  _.each(targets, function (target) {
    expect(target.type).a('string')

    var metric = target.metric
    expect(metric).an('object')

    expect(metric.unit).an('string')
    expect(metric.what).an('string')
    expect(metric.type).an('string')
  })
}

var validate_badges = function (row) {
  var badges = row.badges
  expect(badges).an('array')
  _.each(badges, validate_badge)
}

var validate_dashboard = function (dashboard) {
  expect(dashboard.id).a('string')
  expect(dashboard.label).a('string')

  var rows = dashboard.rows
  _.each(rows, validate_badges)
}

var validate_dashboards = function (dashboards) {
  expect(dashboards).an('array')
  expect(dashboards.length).to.equal(1)

  _.each(dashboards, validate_dashboard)
}

describe('dashboard REST tests', function () {
  var api_port = 4040

  var api_service = new ApiService({
    api_port: api_port
  })

  var BASE_URL = url.format({
    protocol: 'http',
    hostname: 'localhost',
    port: api_port
  })

  request = request(BASE_URL)

  before(function () {
    return api_service.start()
  })

  after(function () {
    if (api_service) {
      return api_service.stop()
    }
  })

  it('should be listening at ' + BASE_URL, function (done) {
    request.get('/').expect(404, function (err) {
      done(err)
    })
  })

  it('can obtain dashboards', function (done) {
    request.get('/dashboards')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err)
        }

        var dashboards = JSON.parse(res.text)
        validate_dashboards(dashboards)

        done()
      })
  })
})

var Promise = require('bluebird')
var expect = require('chai').expect

var PointSubscriber = require('../../ui-service/point-subscriber')
var PublisherServer = require('../../firehose-service/publisher-server')

var subscriber = new PointSubscriber({
  port: 5050
})

var server = new PublisherServer({
  port: 5050
})

describe('point subscriber tests', function () {

  before(function () {
    return Promise.all([server.start(), subscriber.start()])
  })

  after(function () {
    return Promise.all([server.stop(), subscriber.stop()])
  })

  it('can intercept sent points', function (done) {
    var point = {unit: 'B', what: 'memory', type: 'used', value: 1337}
    subscriber.once('point', function (point) {
      expect(point).to.deep.equal(point)
      done()
    })

    server.send(point)
  })
})

var _ = require('underscore')
var expect = require('chai').expect

var FireHoseClient = require('../../shared/firehose-client')
var FireHoseServer = require('../../firehose-service/firehose-server')

describe('firehose server', function () {
  var firehose_address = 'localhost'
  var firehose_port = 4040

  var firehose_client
  var firehose_server

  // init firehose client
  before(function () {
    firehose_client = new FireHoseClient({
      host: firehose_address,
      port: firehose_port
    })
  })

  // init firehose server
  before(function () {
    firehose_server = new FireHoseServer({
      address: firehose_address,
      port: firehose_port
    })
    return firehose_server.start()
  })

  after(function () {
    if (firehose_server) {
      return firehose_server.stop()
    }
  })

  // remove event listeners after each test
  afterEach(function () {
    firehose_server.removeAllListeners('point')
  })

  it('can process a basic point', function (done) {
    firehose_server.once('point', function (point) {
      expect(point).to.deep.equal({
        hello: 'world'
      })
      done()
    })

    firehose_client.send({hello: 'world'})
  })

  it('can bulk send points', function (done) {
    var points = []
    firehose_server.on('point', function (point) {
      points.push(point)

      if (points.length === 5) {
        _.each(points, function (point, index) {
          expect(point.msg).to.equal(index)
        })
        done()
      }
    })

    firehose_client.send([
      {msg: 0},
      {msg: 1},
      {msg: 2},
      {msg: 3},
      {msg: 4}
    ])
  })
})

var _ = require('underscore')
var expect = require('chai').expect

var FireHoseClient = require('../../shared/firehose-client')
var FireHoseServer = require('../../firehose-service/firehose-server')

describe('firehose client', function () {
  var firehose_address = 'localhost'
  var firehose_port = 4040

  var firehose_client
  var firehose_server

  // init firehose client
  before(function () {
    firehose_client = new FireHoseClient({
      address: firehose_address,
      port: firehose_port
    })
  })

  // init firehose mock server
  before(function () {
    firehose_server = new FireHoseServer({
      port: firehose_port
    })
    return firehose_server.start()
  })

  // remove event listeners after each test
  afterEach(function () {
    if (!firehose_server) {
      return
    }
    firehose_server.removeAllListeners('point')
    firehose_server.removeAllListeners('error')
  })

  after(function () {
    if (firehose_server) {
      return firehose_server.stop()
    }
  })

  it('can send a point', function (done) {
    var now = _.now()
    firehose_server.once('point', function (point) {
      expect(point.message).equals('the msg')
      expect(point.status).equals(1337)
      expect(point.time).equals(now)
      done()
    })

    firehose_server.on('error', done)

    firehose_client.send({message: 'the msg', status: 1337, time: now})
  })
})

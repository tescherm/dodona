var _ = require('underscore')
var expect = require('chai').expect

var WebSocket = require('ws')
var WebSocketServer = require('../../ui-service/ws-server')

var server = new WebSocketServer({
  port: 2020
})

describe('websocket server tests', function () {
  var test_point = {unit: 'B', what: 'disk_space', type: 'used', value: 1337}

  var test_badge = {
    id: 'badge-1337',
    label: 'Disk Space - Free vs Used',
    size: 'medium',

    targets: [{
      type: 'donut',
      metric: {
        unit: 'B',
        what: 'disk_space',
        type: 'used'
      }
    }, {
      type: 'donut',
      metric: {
        unit: 'B',
        what: 'disk_space',
        type: 'free'
      }
    }]
  }

  before(function () {
    return server.start()
  })

  after(function () {
    return server.stop()
  })

  it('can route points', function (done) {
    var ws = new WebSocket('ws://localhost:2020')

    ws.once('open', function open () {
      ws.send(JSON.stringify(test_badge))
    })

    ws.once('message', function (data) {
      var points = JSON.parse(data)
      var point = _.first(points)

      expect(point).deep.equals(test_point)
      done()
    })

    server.once('connection', function (connection) {
      server.route(test_point)
    })
  })
})

var Logger = require('./logger')

var axon = require('axon');
var logger = Logger.get('firehose.client')

function FireHoseClient (opts) {
  opts = opts || {}

  var address = opts.address
  var port = opts.port

  this.sock = axon.socket('push', {});
  this.sock.connect(port, address, function () {
    logger.info('client connected')
  });
}

FireHoseClient.prototype.send = function (points) {
  this.sock.send(points)
}

module.exports = FireHoseClient

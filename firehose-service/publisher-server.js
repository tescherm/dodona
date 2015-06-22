var Promise = require('bluebird')
var axon = require('axon');

var Logger = require('../shared/logger')
var logger = Logger.get('publisher.server')

function PublisherServer (opts) {
  this.port = opts.port
  this.address = opts.address || '0.0.0.0'
}

PublisherServer.prototype.start = function () {
  if (this.server) {
    return Promise.reject(new Error('server already running'))
  }

  logger.info('starting publish server', {
    port: this.port,
    address: this.address
  })

  var server = axon.socket('pub', {});
  this.server = server

  server.bind(this.port, this.address, function (err) {
    if (err) {
      server.emit('error', err);
    }
    logger.info('publish server started');
    server.emit('started');
  });

  return new Promise(function (resolve, reject) {
    server.on('started', resolve);
    server.on('error', reject);
  });
}

PublisherServer.prototype.stop = function () {
  var server = this.server

  return new Promise(function (resolve, reject) {
    if (!server) {
      return reject(new Error('server not running'))
    }

    logger.info('stopping publish server')

    server.close(function () {
      logger.info('stopped publish server')
      server = null
      resolve()
    })
  })
}

PublisherServer.prototype.send = function (point) {
  this.server.send('point', point);
}

module.exports = PublisherServer
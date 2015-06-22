var Promise = require('bluebird')
var axon = require('axon')
var domain = require('domain')

var _ = require('underscore')
var util = require('util')
var EventEmitter = require('events').EventEmitter

var Logger = require('../shared/logger')
var logger = Logger.get('firehose.server')

function FireHoseServer (opts) {
  EventEmitter.call(this)
  opts = opts || {}

  this.server = null

  this.port = opts.port
  this.address = opts.address || '0.0.0.0'
}

util.inherits(FireHoseServer, EventEmitter)

FireHoseServer.prototype.start = function () {
  if (this.server) {
    return Promise.reject(new Error('server already running'))
  }

  logger.info('starting firehose server', {
    port: this.port,
    address: this.address
  })

  var server = axon.socket('pull', {})
  server.bind(this.port, this.address, function (err) {
    if (err) {
      server.emit('error', err);
    }
    logger.info('firehose server started...');
    server.emit('started');
  });

  server.on('message', this._handle_request.bind(this))

  this.server = server

  return new Promise(function (resolve, reject) {
    server.on('started', resolve);
    server.on('error', reject);
  });
}

FireHoseServer.prototype._handle_request = function (points) {
  if (!_.isArray(points)) {
    points = [points]
  }
  _.each(points, this.emit.bind(this, 'point'))
}

FireHoseServer.prototype.stop = function () {
  var server = this.server

  return new Promise(function (resolve, reject) {
    if (!server) {
      return reject(new Error('server not running'))
    }

    logger.info('stopping firehose server')

    server.close(function () {
      logger.info('stopped firehose server')
      server = null
      resolve()
    })
  })
}

module.exports = FireHoseServer

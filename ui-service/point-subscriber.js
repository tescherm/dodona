var axon = require('axon');

var util = require('util')
var EventEmitter = require('events').EventEmitter

var Logger = require('../shared/logger')
var logger = Logger.get('point.subscriber')

function PointSubscriber (opts) {
  EventEmitter.call(this)

  this.port = opts.port
  this.address = opts.address || '0.0.0.0'
}

util.inherits(PointSubscriber, EventEmitter)

PointSubscriber.prototype.start = function () {
  if (this.socket) {
    return Promise.reject(new Error('subscriber already started'))
  }

  logger.info('starting point subscriber')

  this.socket = axon.socket('sub', {});
  this.socket.connect(this.port, this.address, function () {
    logger.info('point subscriber started')
  });

  this.socket.subscribe('point')

  var handle_point = function (topic, message) {
    if (topic !== 'point') {
      return;
    }
    this.emit('point', message)
  }.bind(this)

  this.socket.on('message', handle_point)
}

PointSubscriber.prototype.stop = function () {
  if (!this.socket) {
    return Promise.reject(new Error('subscriber never started'))
  }

  logger.info('stopping point subscriber')

  this.socket.close()
  this.socket = null

  logger.info('stopped point subscriber')
}

module.exports = PointSubscriber
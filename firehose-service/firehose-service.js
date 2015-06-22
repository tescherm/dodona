var _ = require('underscore')
var Promise = require('bluebird')
var Logger = require('../shared/logger')

var FireHoseServer = require('./firehose-server')
var PublisherServer = require('./publisher-server')

var logger = Logger.get('publisher.service')

function FireHoseService (opts) {
  this.firehose = new FireHoseServer({
    port: opts.firehose_port
  })
  this.firehose.on('point', this.demux.bind(this))

  this.publisher = new PublisherServer({
    port: opts.publisher_port
  })

  this.channels = [this.publisher]
}

FireHoseService.prototype.start = function () {
  logger.info('starting service')

  return Promise.all([
    this.firehose.start(),
    this.publisher.start()
  ])
  .settle()
  .reduce(function (errors, result) {
    if (result.isRejected()) {
      var err = result.reason()
      logger.error('could not start server', err)
      errors.push(err)
    }
    return errors
  }, [])
  .then(function (errors) {
    if (!_.isEmpty(errors)) {
      throw new Error('could not start service')
    }
  }).tap(function () {
    logger.info('service started')
  })
}

FireHoseService.prototype.stop = function () {
  logger.info('stopping service')

  return Promise.all([
    this.firehose.stop(),
    this.publisher.stop()
  ])
  .settle()
  .reduce(function (errors, result) {
    if (result.isRejected()) {
      var err = result.reason()
      logger.error('could not stop server', err)
      errors.push(err)
    }
    return errors
  }, [])
  .then(function (errors) {
    if (!_.isEmpty(errors)) {
      throw new Error('could not stop service')
    }
  }).tap(function () {
    logger.info('service stopped')
  })
}

FireHoseService.prototype.demux = function (point) {
  // demultiplex the data point fire hose. for example,
  // you might send points to a time series database
  // as well as a websocket channel
  return Promise.each(this.channels, function (channel) {
    channel.send(point)
  })
}

module.exports = FireHoseService
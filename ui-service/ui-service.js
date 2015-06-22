var _ = require('underscore')
var Promise = require('bluebird')
var Logger = require('../shared/logger')

var UiServer = require('./ui-server')
var WsServer = require('./ws-server')
var PointSubscriber = require('./point-subscriber')

var logger = Logger.get('ui.service')

function UiService (opts) {
  this.ui_server = new UiServer({
    port: opts.ui_port,
    api_port: opts.api_port
  })

  this.ws_server = new WsServer({
    port: opts.wss_port
  })

  this.subscriber = new PointSubscriber({
    port: opts.publisher_port
  })

  var route_point = function (point) {
    this.ws_server.route(point)
  }.bind(this)

  this.subscriber.on('point', route_point)
}

UiService.prototype.start = function () {
  logger.info('starting service')

  return Promise.all([
    this.ui_server.start(),
    this.ws_server.start(),
    this.subscriber.start()
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

UiService.prototype.stop = function () {
  logger.info('stopping service')

  return Promise.all([
    this.ui_server.stop(),
    this.ws_server.stop(),
    this.subscriber.stop()
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
    logger.info('service stoped')
  })
}

module.exports = UiService
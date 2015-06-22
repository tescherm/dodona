var Logger = require('./shared/logger')

var Promise = require('bluebird')

var ApiService = require('./api-service')
var UiService = require('./ui-service')
var FireHoseService = require('./firehose-service')

var logger = Logger.get('dodona')

var Dodona = function () {
  var wss_port = 2020
  var ui_port = 3030
  var api_port = 4040
  var publisher_port = 5050
  var firehose_port = 6060

  this.api_service = new ApiService({
    api_port: api_port
  })
  this.ui_service = new UiService({
    api_port: api_port,
    ui_port: ui_port,
    wss_port: wss_port,
    publisher_port: publisher_port
  })
  this.firehose_service = new FireHoseService({
    publisher_port: publisher_port,
    firehose_port: firehose_port
  })
}

Dodona.prototype.start = function () {
  logger.info('dodona starting')

  var services = [
    this.api_service.start(),
    this.ui_service.start(),
    this.firehose_service.start()
  ]

  return Promise.all(services).tap(function () {
    logger.info('dodona started')
  })
}

Dodona.prototype.stop = function () {
  logger.info('dodona stopping')

  var services = [
    this.api_service.stop(),
    this.ui_service.stop(),
    this.firehose_service.stop()
  ]

  return Promise.all(services).tap(function () {
    logger.info('dodona stopped')
  })
}

module.exports = Dodona

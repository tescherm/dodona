var ApiServer = require('./api-server')

var Logger = require('../shared/logger')
var logger = Logger.get('api.service')

function ApiService (opts) {
  this.server = new ApiServer({
    port: opts.api_port
  })
}

ApiService.prototype.start = function () {
  logger.info('starting service')

  return this.server.start().tap(function () {
    logger.info('service started')
  })
}

ApiService.prototype.stop = function () {
  logger.info('stopping service')

  return this.server.stop().tap(function () {
    logger.info('service stopped')
  })
}

module.exports = ApiService
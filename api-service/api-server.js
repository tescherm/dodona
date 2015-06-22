var _ = require('underscore')

var Promise = require('bluebird')

var express = require('express')

var morgan = require('morgan')
var body_parser = require('body-parser')
var compression = require('compression')

var DashboardsResource = require('./rest/dashboards-resource')

var Logger = require('../shared/logger')
var logger = Logger.get('api.server')

// convert internal error to a json format
function error_to_json (err) {
  return {
    message: 'internal error',
    error: {
      name: err.name,
      message: err.message
    }
  }
}

// 404 catchall
function not_found_errors (req, res) {
  res.status(404)
  res.json({message: 'not found'})
}

// 500 catchall
function error_handler (err, req, res, next) {
  if (!(err instanceof Error)) {
    err = new Error(err)
  }

  logger.error('internal error', err)

  res.status(err.status || 500)
  res.json(error_to_json(err))

  next(err)
}

function init_api (resources) {
  var app = express()

  app.use(morgan('combined'))

  app.use(compression())
  app.use(body_parser.json())

  // dashboard endpoints
  app.get('/dashboards', resources.dashboards.list)

  app.use(not_found_errors)
  app.use(error_handler)

  return app
}

/**
 * API entry point
 */
function ApiServer (opts) {
  var dashboards = new DashboardsResource()

  this.port = opts.port
  this.address = opts.address || '0.0.0.0'

  this.app = init_api({
    dashboards: dashboards
  })
}

ApiServer.prototype.start = function () {
  if (this.server) {
    return Promise.reject(new Error('server already running'))
  }

  logger.info('starting api server', {
    port: this.port,
    address: this.address
  })

  var server = this.app.listen(this.port, this.address, function (err) {
    if (err) {
      server.emit('error', err);
    }
    logger.info('api server started');
    server.emit('started');
  });

  this.server = server

  return new Promise(function (resolve, reject) {
    server.on('started', resolve);
    server.on('error', reject);
  });
}

ApiServer.prototype.stop = function () {
  var server = this.server

  return Promise.try(function () {
    if (!server) {
      throw new Error('no server to stop');
    }

    logger.info('api server stopping');
    server.close();
  });
}

module.exports = ApiServer

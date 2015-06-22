var _ = require('underscore')
var express = require('express')

var http_proxy = require('http-proxy')

var Promise = require('bluebird')
var Logger = require('../shared/logger')

var logger = Logger.get('ui.server')

var PUBLIC_DIR = __dirname + '/../public'

function UiServer (opts) {
  this.app = this._init_app({
    api: opts.api,
    api_port: opts.api_port
  })

  this.port = opts.port
  this.address = opts.address || '0.0.0.0'
}

UiServer.prototype._init_app = function (opts) {
  var api = opts.api
  var api_port = opts.api_port

  var app = express()

  // all environments
  app.use(express.static(PUBLIC_DIR))

  var proxy = http_proxy.createProxyServer({
    target: {
      host: 'localhost',
      port: api_port
    }
  })

  proxy.on('error', function (err, req, res) {
    logger.error('proxy error', err)

    res.writeHead(500, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
      message: 'could not connect to the api service'
    }));
  })

  app.use('/api', function (req, res, next) {
    proxy.web(req, res)
  })

  // ui endpoint
  app.get('/', express.static(PUBLIC_DIR + '/index.html'))

  return app
}

UiServer.prototype.start = function () {
  if (this.server) {
    return Promise.reject(new Error('server already started'))
  }

  logger.info('starting ui server', {
    port: this.port,
    address: this.address
  })

  var server = this.app.listen(this.port, this.address, function (err) {
    if (err) {
      server.emit('error', err);
    }
    logger.info('ui server started');
    server.emit('started');
  });

  this.server = server

  return new Promise(function (resolve, reject) {
    server.on('started', resolve);
    server.on('error', reject);
  });
}

UiServer.prototype.stop = function () {
  var server = this.server
  return Promise.try(function () {
    if (!server) {
      throw new Error('no server to stop');
    }

    logger.info('ui server stopping');
    server.close();
  });
}

module.exports = UiServer

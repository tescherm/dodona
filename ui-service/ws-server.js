var util = require('util')
var EventEmitter = require('events').EventEmitter

var _ = require('underscore')
var uuid = require('../shared/uuid')

var Promise = require('bluebird')
var Logger = require('../shared/logger')

var WebSocket = require('ws')

var logger = Logger.get('ws.server')

function WebSocketConnection (web_socket) {
  EventEmitter.call(this)

  this.id = uuid({prefix: 'conn'})

  this.badge = null
  this.web_socket = web_socket

  this._attach()
}

util.inherits(WebSocketConnection, EventEmitter)

WebSocketConnection.prototype._attach = function () {
  var web_socket = this.web_socket

  var handle_message = _.bind(this._handle_message, this)
  var handle_close = _.bind(this._handle_close, this)
  var handle_error = _.bind(this._handle_error, this)
  var handle_open = _.bind(this._handle_open, this)

  // bind events

  web_socket.on('message', handle_message)
  web_socket.on('close', handle_close)
  web_socket.on('error', handle_error)

  if (web_socket.readyState === WebSocket.CONNECTING) {
    web_socket.once('open', handle_open)
  } else {
    handle_open()
  }
}

WebSocketConnection.prototype._handle_open = function () {
  logger.info('channel open', {id: this.id})
}

WebSocketConnection.prototype._handle_message = function (message) {
  if (this.badge) {
    logger.error('badge already sent')
    return;
  }

  // message is assumed to be the badge here
  this.badge = JSON.parse(message)
  this.emit('connected', this)
}

WebSocketConnection.prototype._handle_close = function () {
  this.close()
}

WebSocketConnection.prototype._handle_error = function (err) {
  logger.error('channel error', {id: this.id, message: err.message})
  this.close()
}

WebSocketConnection.prototype.send = function (points) {
  if (this.web_socket.readyState !== WebSocket.OPEN) {
    logger.warn('attempted to send to closed web socket', {
      id: this.id
    })
    return
  }

  if (!_.isArray(points)) {
    points = [points]
  }

  this.web_socket.send(JSON.stringify(points), function (err) {
    // err is only set if send() failed
    if (err) {
      logger.error('could not send', err)
    }
  })
}

WebSocketConnection.prototype.close = function () {
  logger.info('channel closing', {id: this.id})

  this.web_socket.close()
  this.emit('close', this)
}

function WebSocketServer (opts) {
  EventEmitter.call(this)

  this.connections = []

  this.port = opts.port
  this.address = opts.address || '0.0.0.0'
}

util.inherits(WebSocketServer, EventEmitter)

WebSocketServer.prototype.start = function () {
  logger.info('starting ws server', {
    port: this.port,
    address: this.address
  })

  var server = new WebSocket.Server({
    port: this.port,
    host: this.address
  }, function (err) {
    if (err) {
      server.emit('error', err);
    }
    logger.info('ws server started');
    server.emit('started');
  })

  server.on('connection', this._handle_connection.bind(this))

  this.server = server

  return new Promise(function (resolve, reject) {
    server.on('started', resolve);
    server.on('error', reject);
  });
}

WebSocketServer.prototype.stop = function () {
  var server = this.server
  var connections = this.connections

  return Promise.try(function () {
    if (!server) {
      throw new Error('no server to stop');
    }

    // make a best attempt to close current connections
    _.each(connections, function (connection) {
      connection.close()
    })

    logger.info('ws server stopping');
    server.close();
  });
}

WebSocketServer.prototype._handle_connection = function (web_socket) {
  var connection = new WebSocketConnection(web_socket)
  connection.on('close', this.remove_connection.bind(this))
  connection.on('connected', this.emit.bind(this, 'connection'))

  this.connections.push(connection)
}

WebSocketServer.prototype.remove_connection = function (connection) {
  var to_remove = connection

  this.connections = _.reject(this.connections, function (connection) {
    return connection.id === to_remove.id
  })
}

WebSocketServer.prototype.route = function (tuple) {
  var connections = this.connections

  // there are few enough connections/targets where
  // this nested for loop shouldn't be too much of a problem
  _.each(connections, function (connection) {
    var badge = connection.badge

    // might happen if the connection hasn't sent a message yet
    if (!badge) {
      return
    }

    var _matched_target = function (target_metric) {
      // metric category (cpu, memory, disk, etc.)
      var matches_what = target_metric.what === tuple.what

      // matches the 'facet' that we are interested in
      // (free memory, used disk space, etc.)
      var matches_type = target_metric.type === tuple.type

      // the target metric series (if specified) matches a field
      // in the metric tuple
      var matches_series = true
      if (target_metric.series) {
        matches_series = _.any(tuple, function (value, key) {
          return key === target_metric.series
        })
      }

      return matches_what && matches_type && matches_series
    }

    var points = []

    var targets = badge.targets
    _.each(targets, function (target) {
      var target_metric = target.metric

      if (_matched_target(target_metric)) {
        points.push(tuple)
      }
    })

    if (_.isEmpty(points)) {
      return
    }

    connection.send(points)
  })
}

module.exports = WebSocketServer

var _ = require('underscore')
var EventEmitter = require('events').EventEmitter
var WebSocket = require('ws')

function Channel (opts) {
  this.badge = opts.badge
}

_.extend(Channel.prototype, EventEmitter.prototype)

Channel.prototype.open = function () {
  this.web_socket = new WebSocket('ws://localhost:2020')

  this.web_socket.onopen = _.bind(this._on_open, this)
  this.web_socket.onclose = _.bind(this._on_close, this)
  this.web_socket.onmessage = _.bind(this._handle_message, this)
  this.web_socket.onerror = _.bind(this._handle_error, this)
}

Channel.prototype._on_open = function () {
  var message = JSON.stringify(this.badge)
  this.web_socket.send(message)
}

Channel.prototype._on_close = function () {}

Channel.prototype._handle_message = function (message_event) {
  var points = JSON.parse(message_event.data)
  this.emit('data', points)
}

Channel.prototype._handle_error = function (error_event) {
  var data = error_event.data

  console.error('web socket error', data)
  this.emit('error', new Error(data))
}

Channel.prototype.close = function () {
  this.web_socket.close()
}

module.exports = Channel

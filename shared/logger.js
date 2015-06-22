var _ = require('underscore')

var winston = require('winston')
var Console = winston.transports.Console

var LEVELS = ['info', 'error', 'warn']

var env = process.env.NODE_ENV
var CONSOLE_DEFAULTS = {
  json: false,
  label: 'dodona',
  timestamp: true,
  prettyPrint: false,
  colorize: env !== 'production'
}

function Logger (opts) {
  this.logger = new winston.Logger({
    transports: [
      new Console(opts)
    ]
  })

  // .{level} function for each supported level
  this._bindLevels()
}

Logger.prototype._bindLevels = function () {
  var self = this
  _.each(LEVELS, function (level) {
    self[level] = function () {
      var args = [level].concat(Array.prototype.slice.call(arguments))
      return self.logger.log.apply(self.logger, args)
    }
  })
}

Logger.get = function (name) {
  var opts = {}
  _.extend(opts, CONSOLE_DEFAULTS, {
    label: name
  })
  return new Logger(opts)
}

module.exports = Logger

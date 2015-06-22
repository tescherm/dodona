var domain = require('domain')

var Logger = require('./logger')

module.exports = function (opts) {
  opts = opts || {}

  var name = opts.name

  var on_error = opts.on_error
  var main = opts.main

  var logger = Logger.get(name)

  var exit = function () {
    var exit_code = 1

    logger.error('exiting with status code', exit_code)
    process.exit(exit_code)
  }

  var die = function (err) {
    logger.error('encountered a fatal error', err)

    if (on_error) {
      on_error(err)
    } else {
      exit()
    }
  }

  var main_domain = domain.create()
  main_domain.on('error', die)

  main_domain.run(function () {
    try {
      main()
    } catch (err) {
      die(err)
    }
  })
}

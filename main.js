var Dodona = require('./dodona')
var MetricsReporter = require('./metrics/metrics-reporter')

var main_domain = require('./shared/main-domain')

var Logger = require('./shared/logger')
var logger = Logger.get('main')

var dodona = null
var reporter = new MetricsReporter()

var exit = function (code) {
  logger.info('dodona exiting...')
  process.exit(code)
}

function stop () {
  if (!dodona) {
    logger.warn('dodona never started')
    exit(1)
  }

  dodona.stop().done(function () {
    exit(0)
  }, function (err) {
    logger.error('dodona not cleanly stopped', err)
    exit(1)
  })
}

/**
 * start a metric collection timer
 */
function send_metrics () {
  setInterval(function () {
    reporter.send()
  }, 1000)
}

function start () {
  dodona = new Dodona()
  dodona.start().then(function () {
    send_metrics()
  }).done(null, function (err) {
    logger.error('dodona could not start', err)
    exit(1)
  })

  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

main_domain({
  name: 'dodona',
  main: function () {
    start()
  }
})

// uuids for the nouns in the system (dashboards, badges, etc.)
var uuid = require('../shared/uuid')

module.exports.dashboard = function () {
  return uuid({prefix: 'dash', terse: false})
}

module.exports.badge = function () {
  return uuid({prefix: 'badge', terse: false})
}

module.exports.target = function () {
  return uuid({prefix: 'target', terse: false})
}

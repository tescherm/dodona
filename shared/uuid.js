var uuid = require('uuid')

module.exports = function (opts) {
  opts = opts || {}

  var prefix = opts.prefix || 'id'
  var terse = opts.terse || true

  var uid = uuid.v4()

  if (terse) {
    uid = uid.substring(0, 8)
  }

  return prefix + '-' + uid
}

var key_mirror = require('keymirror')

module.exports = {
  Dashboards: key_mirror({
    // load all dashboards
    LOADING: null,

    // load dashboards succeeded
    LOAD_SUCCESS: null,

    // load dashboards failed
    LOAD_FAILED: null
  })
}

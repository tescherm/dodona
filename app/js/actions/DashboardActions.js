var _ = require('underscore')
var Dispatcher = require('../dispatcher/Dispatcher')
var Constants = require('../constants/Constants')

var ApiClient = require('../../../shared/api-client')

var Dashboards = Constants.Dashboards

var api_client = new ApiClient()

function dispatch (action, opts) {
  opts = opts || {}
  _.extend(opts, {actionType: action})

  Dispatcher.dispatch(opts)
}

var DashboardActions = {
  load: function () {
    dispatch(Dashboards.LOADING)

    api_client.list_dashboards().done(function (dashboards) {
      dispatch(Dashboards.LOAD_SUCCESS, {
        dashboards: dashboards
      })
    }, function (err) {
      console.log('loading dashboards failed', err)
      dispatch(Dashboards.LOAD_FAILED, {
        err: err
      })
    })
  }
}

module.exports = DashboardActions

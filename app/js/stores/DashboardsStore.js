var _ = require('underscore')
var EventEmitter = require('events').EventEmitter

var Dispatcher = require('../dispatcher/Dispatcher')
var Dashboards = require('../constants/Constants').Dashboards

var CHANGE_EVENT = 'change'

var _dashboards = []
var _loading = false
var _error = null

var DashboardStore = _.extend({}, EventEmitter.prototype, {

  isLoading: function () {
    return _loading
  },

  getError: function () {
    return _error
  },

  getAll: function () {
    return _dashboards
  },

  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback)
  },

  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback)
  },

  reset: function (dashboards) {
    _dashboards = dashboards
    this.emit(CHANGE_EVENT)
  }

})

Dispatcher.register(function (action) {

  switch (action.actionType) {
    case Dashboards.LOADING:
      _loading = true

      DashboardStore.reset([])
      break
    case Dashboards.LOAD_SUCCESS:
      _loading = false
      _error = null

      DashboardStore.reset(action.dashboards)
      break
    case Dashboards.LOAD_FAILED:
      _loading = false
      _error = action.err

      DashboardStore.reset([])
      break
    default:
    // no op
  }
})

module.exports = DashboardStore

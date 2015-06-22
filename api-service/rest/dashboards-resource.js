var _ = require('underscore')

var MOCK_DASHBOARDS = require('../misc/mock-dashboards')

function DashboardsResource () {
  _.bindAll(this,
    'list'
  )
}

DashboardsResource.prototype.list = function (req, res, next) {
  // simply returning the mock dashboards here. This could do more
  res.status(200).json(MOCK_DASHBOARDS)
}

module.exports = DashboardsResource

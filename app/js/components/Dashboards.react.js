var _ = require('underscore')
var React = require('react')

var Grid = require('react-bootstrap').Grid

var TabbedArea = require('react-bootstrap').TabbedArea
var TabPane = require('react-bootstrap').TabPane

var Alert = require('react-bootstrap').Alert

var Dashboard = require('./Dashboard.react')
var DashboardsStore = require('../stores/DashboardsStore')
var DashboardActions = require('../actions/DashboardActions')

var Loading = React.createClass({
  render: function () {
    return (
      <Alert bsStyle='info'>
        <h4>
          <i className='fa fa-circle-o-notch fa-spin'></i>
          &nbsp;Loading Dashboards...
        </h4>
      </Alert>
    )
  }
})

var LoadError = React.createClass({

  propTypes: {
    error: React.PropTypes.object
  },

  render: function () {
    return (
      <Alert bsStyle='danger'>
        <h4>Dashboards could not be loaded</h4>

        <p>{this.props.error.message}</p>
      </Alert>
    )
  }
})

var EmptyDashboards = React.createClass({

  render: function () {
    return (
      <Alert bsStyle='info'>
        No dashboards have been created yet. <a>Create one</a>
      </Alert>
    )
  }
})

var Dashboards = React.createClass({

  _getState: function () {
    return {
      loading: DashboardsStore.isLoading(),
      error: DashboardsStore.getError(),

      dashboards: DashboardsStore.getAll()
    }
  },

  getInitialState: function () {
    return this._getState()
  },

  render: function () {
    return (
      <Grid fluid={true}>
        {this._renderContent()}
      </Grid>
    )
  },

  _renderContent: function () {
    if (this.state.loading) {
      return (
        <Loading/>
      )
    }

    var error = this.state.error
    if (error) {
      return (
        <LoadError error={error}/>
      )
    }

    var dashboards = this.state.dashboards
    if (_.isEmpty(dashboards)) {
      return (
        <EmptyDashboards/>
      )
    }

    var activeId = _.first(dashboards).id

    return (
      <TabbedArea
        defaultActiveKey={activeId}
        animation={false}
        className='dashboard-nav'>
        {this._renderDashboards(dashboards)}
      </TabbedArea>
    )
  },

  _renderDashboards: function (dashboards) {
    return _.map(dashboards, function (dashboard) {
      return (
        <TabPane
          eventKey={dashboard.id}
          key={dashboard.id}
          tab={dashboard.label}>
          <Dashboard dashboard={dashboard}/>
        </TabPane>
      )
    })
  },

  componentWillMount: function () {
  },

  componentDidMount: function () {
    DashboardsStore.addChangeListener(this._onChange)
    DashboardActions.load()
  },

  componentWillUnmount: function () {
    DashboardsStore.removeChangeListener(this._onChange)
  },

  _onChange: function () {
    var state = this._getState()
    this.setState(state)
  }

})

module.exports = Dashboards

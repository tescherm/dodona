var React = require('react')

var Panel = require('react-bootstrap').Panel

var BadgeChannel = require('../BadgeChannel')
var BadgeChart = require('../charts/BadgeChart')

var LiveGaugeChart = require('../charts/LiveGaugeChart')
var LiveTimeSeriesChart = require('../charts/LiveTimeSeriesChart')

var Badge = React.createClass({

  propTypes: {
    badge: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {}
  },

  render: function () {
    var badge = this.props.badge

    return (
      <Panel className='badge-panel' header={this._renderHeading()}>
        <div id={badge.id}/>
      </Panel>
    )
  },

  _renderHeading: function () {
    var badge = this.props.badge

    return (
      <div>
        {badge.label}
      </div>
    )
  },

  componentDidMount: function () {
    var badge = this.props.badge

    this.channel = new BadgeChannel({
      badge: badge
    })

    var badge_chart = new BadgeChart(badge)

    var live_chart = null

    if (badge_chart.is_time_series) {
      live_chart = new LiveTimeSeriesChart(badge_chart)
    } else {
      live_chart = new LiveGaugeChart(badge_chart)
    }

    var flow = function (points) {
      live_chart.flow(points)
    }

    this._chart = live_chart

    this.channel.on('data', flow)
    this.channel.open()
  },

  componentDidUpdate: function () {
    this._chart.update()
  },

  componentWillUnmount: function () {
    this._chart.destroy()
  }

})

module.exports = Badge

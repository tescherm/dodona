var _ = require('underscore')
var React = require('react')

var Badge = require('./badge.react')

var Grid = require('react-bootstrap').Grid
var Row = require('react-bootstrap').Row
var Col = require('react-bootstrap').Col

var Dashboard = React.createClass({

  propTypes: {
    dashboard: React.PropTypes.object
  },

  getInitialState: function () {
    return {}
  },

  render: function () {
    var row_views = this._row_views()

    return (
      <Grid fluid>
        {row_views}
      </Grid>
    )
  },

  _row_views: function () {
    var dashboard = this.props.dashboard
    var rows = dashboard.rows

    return _.map(rows, function (row, index) {
      var badges = row.badges
      var badge_views = this._badge_views(badges)

      return (
        <Row key={index}>
          {badge_views}
        </Row>
      )
    }.bind(this))
  },

  _badge_views: function (badges) {
    return _.map(badges, function (badge) {
      var size = this._size_scale(badge.size)

      return (
        <Col key={badge.id} md={size}>
          <Badge badge={badge}/>
        </Col>
      )
    }.bind(this))
  },

  _size_scale: function (size) {
    switch (size) {
      case 'small':
        return 4
      case 'medium':
        return 6
      case 'large':
        return 12
      default:
        return 4
    }
  }
})

module.exports = Dashboard

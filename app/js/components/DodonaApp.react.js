var React = require('react')

var NavBar = require('./NavBar.react')
var Dashboards = require('./Dashboards.react')

var DodonaApp = React.createClass({
  displayName: 'Dodona',

  getInitialState: function () {
    return {}
  },

  render: function () {
    return (
      <div>
        <NavBar/>
        <Dashboards/>
      </div>
    )
  }
})

module.exports = DodonaApp

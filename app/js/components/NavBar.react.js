var React = require('react')

var Navbar = require('react-bootstrap').Navbar
var Nav = require('react-bootstrap').Nav

var NavBar = React.createClass({

  getInitialState: function () {
    return {}
  },

  render: function () {
    return (
      <Navbar fluid brand='Dodona'>
        <Nav/>
      </Navbar>
    )
  }

})

module.exports = NavBar

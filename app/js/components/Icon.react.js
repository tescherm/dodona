var React = require('react')

var Icon = React.createClass({

  propTypes: {
    icon: React.PropTypes.string.isRequired,
    size: React.PropTypes.number,
    scale: React.PropTypes.number,
    children: React.PropTypes.node
  },

  getDefaultProps: function () {
    return {
      scale: null,
      size: 1,

      // just cuz
      icon: 'coffee'
    }
  },

  render: function () {
    var classNames = 'fa'
    classNames += ' '
    classNames += 'fa-' + this.props.icon
    classNames += ' '
    classNames += 'fa-' + this.props.size

    if (this.props.scale) {
      classNames += ' '
      classNames += 'fa-' + this.props.scale
    }

    return (
      <i {...this.props} className={classNames}>
        {this.props.children}
      </i>
    )
  }
})

module.exports = Icon

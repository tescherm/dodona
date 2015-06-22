var uuids = require('../uuids')

var dashboards = []

var first_row = {
  badges: [
    {
      id: uuids.badge(),
      label: 'System Memory - Free vs Used',
      size: 'small',

      groups: [['free', 'used']],

      targets: [{
        type: 'area',
        metric: {
          unit: 'B',
          what: 'memory',
          type: 'used'
        }
      }, {
        type: 'area',
        metric: {
          unit: 'B',
          what: 'memory',
          type: 'free'
        }
      }]
    },
    {
      id: uuids.badge(),
      label: 'Load Average',
      size: 'small',

      targets: [{
        type: 'line',
        metric: {
          unit: 'Load',
          what: 'loadavg',
          type: 'one'
        }
      }, {
        type: 'line',
        metric: {
          unit: 'Load',
          what: 'loadavg',
          type: 'five'
        }
      },
        {
          type: 'line',
          metric: {
            unit: 'Load',
            what: 'loadavg',
            type: 'fifteen'
          }
        }
      ]
    },
    {
      id: uuids.badge(),
      label: 'Total CPU Usage',
      size: 'small',

      color: {
        pattern: ['#60B044', '#F6C600', '#F97600', '#FF0000'],
        threshold: {
          values: [30, 60, 90, 100]
        }
      },

      targets: [{
        type: 'gauge',
        metric: {
          unit: 'pct',
          what: 'total_cpu',
          type: 'used'
        }
      }]
    }

  ]
}

var second_row = {
  badges: [
    {
      id: uuids.badge(),
      label: 'CPU Load - By Core',
      size: 'large',

      targets: [{
        type: 'line',
        metric: {
          unit: 'pct',
          what: 'cpu',
          type: 'used',
          series: 'core'
        }
      }]
    }
  ]
}

var third_row = {
  badges: [
    {
      id: uuids.badge(),
      label: 'Disk Space - Free vs Used',
      size: 'medium',

      targets: [{
        type: 'donut',
        metric: {
          unit: 'B',
          what: 'disk_space',
          type: 'used'
        }
      }, {
        type: 'donut',
        metric: {
          unit: 'B',
          what: 'disk_space',
          type: 'free'
        }
      }]
    },
    {
      id: uuids.badge(),
      label: 'CPU Load',
      size: 'medium',

      groups: [['sys', 'user', 'idle']],

      targets: [{
        type: 'area',
        metric: {
          unit: 'pct',
          what: 'total_cpu',
          type: 'sys'
        }
      }, {
        type: 'area',
        metric: {
          unit: 'pct',
          what: 'total_cpu',
          type: 'user'
        }
      },
        {
          type: 'area',
          metric: {
            unit: 'pct',
            what: 'total_cpu',
            type: 'idle'
          }
        }
      ]
    }
  ]
}

dashboards.push({
  id: uuids.dashboard(),
  label: 'System Metrics',
  rows: [
    first_row,
    second_row,
    third_row
  ]
})

module.exports = dashboards

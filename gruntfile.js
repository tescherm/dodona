module.exports = function (grunt) {
  var pkg = grunt.file.readJSON('package.json')

  function distFiles () {
    var files = [
      {expand: true, src: 'main.js'},
      {expand: true, src: 'conf/**'},
      {expand: true, src: 'public/**'},
      {expand: true, src: 'ui-service/**'},
      {expand: true, src: 'firehose-service/**'},
      {expand: true, src: 'api-service/**'},
      {expand: true, src: 'shared/**'}
    ]

    // include dependencies (but exclude dev dependencies)
    var dependencies = pkg.dependencies
    for (var dependency in dependencies) {
      if (Object.hasOwnProperty.call(dependencies, dependency)) {
        var include = ['node_modules', dependency, '**'].join('/')
        files.push({expand: true, src: include})
      }
    }
    return files
  }

  // always enable stack traces
  grunt.option('stack', true)

  // project configuration.
  grunt.initConfig({
    pkg: pkg,

    // grunt-browserify config
    browserify: {
      main: {
        options: {
          debug: true,
          transform: ['reactify']
        },
        files: {
          'public/js/scripts.js': 'app/js/app.js'
        }
      }
    },

    // grunt-contrib-stylus config
    stylus: {
      main: {
        options: {
          paths: ['app/css'],
          'include css': true
        },
        files: {
          'public/css/styles.css': 'app/css/index.styl'
        }
      }
    },

    // grunt-contrib-copy config
    copy: {
      index: {
        expand: true,
        cwd: 'app',
        src: ['index.html'],
        dest: 'public/'
      },
      fonts: {
        expand: true,
        cwd: 'app/fonts',
        src: ['**'],
        dest: 'public/fonts/'
      },
      images: {
        expand: true,
        cwd: 'app/images',
        src: ['**'],
        dest: 'public/images/'
      }
    },

    // grunt-eslint config
    eslint: {
      options: {
        format: 'stylish'
      },
      server: {
        src: [
          'main.js',
          'dodona.js',
          'server/**/*.js'
        ]
      },
      app: {
        src: [
          'app/**/*.js'
        ]
      },
      test: {
        src: [
          'test/**/*.js'
        ]
      },
      misc: {
        src: [
          'gruntfile.js'
        ]
      }
    },

    // grunt-contrib-compress config
    compress: {
      source: {
        options: {
          mode: 'tgz',
          pretty: 'true',
          archive: 'artifacts/service-source.tar.gz',
          level: 1
        },
        files: [
          {dot: true, expand: true, src: '**/*'}
        ]
      },
      dist: {
        options: {
          mode: 'tgz',
          pretty: 'true',
          archive: 'artifacts/service.tar.gz',
          level: 1
        },
        files: distFiles()
      }
    },

    uglify: {
      main: {
        files: {
          'public/js/scripts.js': ['public/js/scripts.js']
        }
      }
    },

    // grunt-env config
    env: {
      dev: {
        NODE_ENV: 'development'
      },
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },

    // grunt-contrib-watch config
    watch: {
      app: {
        files: ['app/**/*', 'shared/**/*'],
        tasks: ['browserify'],
        options: {
          interrupt: true
        }
      },
      styles: {
        files: 'app/css/**/*',
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    },

    // grunt-nodemon config
    nodemon: {
      main: {
        script: 'main.js'
      },
      debug: {
        script: 'main.js',
        options: {
          nodeArgs: ['--debug']
        }
      }
    },

    // grunt-mocha-test config
    mochaTest: {
      options: {
        log: true,
        timeout: 3000,
        reporter: 'spec',
        ui: 'bdd',
        ignoreLeaks: false
      },
      all: {src: ['test/**/*.test.js']}
    },

    // grunt-clean config
    clean: {
      build: ['artifacts', 'public']
    },

    // grunt-concurrent config
    concurrent: {
      main: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      },

      debug: {
        tasks: ['nodemon:debug', 'watch', 'node-inspector'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // node inspector config
    'node-inspector': {
      main: {}
    }

  })

  // npm Tasks
  require('load-grunt-tasks')(grunt)

  // default tasks
  grunt.registerTask('default', ['build'])

  // compile task
  grunt.registerTask('compile', [
    'clean',
    'browserify',
    'stylus',
    'copy'
  ])

  // run lint tests
  grunt.registerTask('lint', [
    'eslint'
  ])

  // run mocha tests
  grunt.registerTask('test', [
    'env:test',
    'mochaTest'
  ])

  // build the project
  grunt.registerTask('build', [
    'clean',
    'compile',
    'lint',
    'test'
  ])

  // create build artifact
  grunt.registerTask('artifact', [
    'env:prod',
    'clean',
    'compile',
    'uglify',
    'compress:dist'
  ])

  // run npm-shrinkwrap
  grunt.registerTask('shrinkwrap', 'run npm-shrinkwrap', function () {
    var done = this.async()
    var npm_shrinkwrap = require('npm-shrinkwrap')

    grunt.log.writeln('writing npm-shrinkwrap.json...')

    npm_shrinkwrap({
      dirname: __dirname
    }, function (err, warnings) {
      if (err) {
        grunt.fail.fatal(err)
      }

      warnings.forEach(function (err) {
        grunt.log.warn(err.message)
      })

      grunt.log.ok('wrote npm-shrinkwrap.json')
      done()
    })
  })

  // start the server
  grunt.registerTask('server', [
    'env:dev',
    'compile',
    'concurrent'
  ])

  // start the server in debug mode
  grunt.registerTask('server:debug', [
    'env:dev',
    'compile',
    'concurrent:debug'
  ])
}

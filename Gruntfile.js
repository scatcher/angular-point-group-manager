'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: {
      // configurable paths
      src: 'src',
      dist: 'dist',
      demo: 'demo'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: [
          '{.tmp,<%= config.src %>}/**/*.js',
          '{.tmp,<%= config.demo %>}/**/*.js'
        ],
        tasks: [],
//                tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: []
//                tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '{.tmp,<%= config.src %>}/{dev,scripts,modules,views}/**/*.{js,html,xml}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= config.demo %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= config.src %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= config.dist %>'
        }
      }
    },



    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= config.dist %>/*'
            ]
          }
        ]
      },
      docs: 'docs',
      server: '.tmp'
    },

    ngtemplates: {
      app: {
        options: {
          module: 'angularPoint',
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true, // Only if you don't use comment directives!
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          },
          prefix: 'bower_components/angular-point-group-manager/'
        },
        src: '<%= config.src %>/*.html',
        dest: '.tmp/apGroupManager-templates.js'
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          '<%= config.src %>/*.js',
          '.tmp/apGroupManager-templates.js'
        ],
        dest: '<%= config.dist %>/apGroupManager.js'
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [
          {
            src: '<%= config.dist %>/apGroupManager.js'
          }
        ]
      }
    },

    uglify: {
      js: {
        src: ['<%= config.dist %>/apGroupManager.js'],
        dest: '<%= config.dist %>/apGroupManager.min.js'
      }
    },
    // Run some tasks in parallel to speed up the build process
//    concurrent: {
//      server: [
//        'copy:styles'
//      ],
//      test: [
//        'copy:styles'
//      ],
//      dist: [
//        'copy:styles',
//        'svgmin'
//      ]
//    },

    ngdocs: {
      options: {
        dest: 'docs',
        scripts: [
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.js',
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular-animate.min.js'
        ],
        html5Mode: false,
        analytics: {
          account: 'UA-51195298-1',
          domainName: 'scatcher.github.io'
        },
//                startPage: '/api',
        title: 'Angular-Point-Control Directive Docs'
      },
      api: {
        src: [
          '<%= config.src %>/*.js'
        ],
        title: 'angular-point tool to manage SharePoint users and groups.',
        api: false
      }
    },
    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: ['**']
    },
    'bump': {
      options: {
        files: ['package.json', 'bower.json'],
        commit: false,
        createTag: false,
        push: false
      }
    }
  });

  grunt.registerTask('demo', function (target) {
    grunt.task.run([
      'clean:server',
//            'bowerInstall',
//      'copy:styles',
//      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
//    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'uglify',
    'doc'
  ]);

  grunt.registerTask('doc', [
//        'clean:docs',
    'ngdocs'
  ]);

  grunt.registerTask('build-docs', [
    'doc',
    'gh-pages'
  ]);

  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};

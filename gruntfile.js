module.exports = function () {
  var grunt = this;

  grunt.initConfig({
    remove: {
      default_options: {
        trace: true,
        dirList: [
          'build',
          'dist',
        ],
      },
    },

    // this is so backwards
    run: {
      coverage: {
        cmd: 'npm',
        args: ['run','coverage','--silent'],
      },
      lint: {
        cmd: 'npm',
        args: ['run','lint','--silent'],
      },
      lintdev: { // allows console/debugger
        cmd: 'npm',
        args: ['run','lintdev','--silent'],
      },
    },

    // we only use this babel for manual inspection. not part of build chain.
    babel: {
      options: { // http://babeljs.io/docs/usage/options/
        // set from package.json (this way it's global, not just this grunt task)
      },
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js'],
            dest: 'build/src/',
          },
          {
            expand: true,
            cwd: 'tests/specs/',
            src: ['**/*.js'],
            dest: 'build/specs/',
          },
        ],
      },
    },

    jsdoc : {
      bare: { // out-of-the-box template. very basic.
        src: [
          // Sources only. Tests are not very relevant.
          'src/**/*.js',
          // Clone git@github.com:design-systems/ds-architecture.git into same dir
          // as your project (so not the project root! one dir up). Optional.
          '../ds-architecture/Types/**/*.js',
        ],
        options: {
          destination: 'build/jsdocs',
        },
      },
      dist : { // uses ink-docstrap. prettier than basic.
        src: [
          // Sources only. Tests are not very relevant.
          'src/**/*.js',
          // Clone git@github.com:design-systems/ds-architecture.git into same dir
          // as your project (so not the project root! one dir up). Optional.
          '../ds-architecture/Types/**/*.js',
        ],
        options: {
          destination: 'build/jsdocs',
          // this requires ink-docstrap in your package.json
          template : 'node_modules/ink-docstrap/template',
          configure : 'node_modules/ink-docstrap/template/jsdoc.conf.json',
        },
      },
    },

    watch: {
      files: [
        'src/**/*.js',
        'tests/**/*',
      ],
      tasks: [
        'browserify:dist',
        'uglify:dist',
      ],
    },

    mochaTest: {
      all: {
        src: ['tests/specs/**/*.spec.js'],
        options: {
          require: [
            'babel-core/register',  // translate es6 syntax to es5
            'babel-polyfill',       // babel only translates, doesnt add new libs
          ],
          // it appears that babel supports an option to redirect the rc but no idea here
          // for now it uses a default config inlined into package.json
          //babelrc: 'config/babelrc',
          timeout: 6000,
          reporter: 'spec',
        },
      },
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          // the `standalone` option allows browserified modules to
          // be imported through es6 import/babel (browser too). without
          // this the module would be private and inaccessible forever.
          standalone: 'module.exports',
          noParse: [
            // Include browserified dependency builds
            // Target the file name directly with absolute path (-> __dirname)
            __dirname + '/node_modules/gom/browser/gom.js',
            __dirname + '/node_modules/@the-grid/multiversejson/browser/Multiverse.js',

            // Note: This doesn't work properly in browserify yet but it may just be what we want.
            //       However in that case we should allow chai for phantomjs builds
            //function(absPath) {
            //  var nmPath = __dirname + '/node_modules';
            //  return absPath.slice(0, nmPath.length) === nmPath;
            //},
          ],
        },
        transform: [
          ['babelify', {presets: ['es2015'], sourceMaps: true}],
          //["reactify", {"es6": true}],
        ],
      },
      phantom: {
        files: {
          'build/finitedomain-browserified.js': 'src/index.js',
          // note: this will include chai and mocha and all that but that's fine (I think?) and workarounds are difficult with es6 static modules anyways
          'build/specs-browserified.js': 'tests/specs/**/*.spec.js',
        },
      },
      dist: {
        files: {
          'build/finitedomain-browserified.js': 'src/index.js',
        },
      },
    },

    mocha_phantomjs: {
      all: ['tests/mocha-runner.html'],
    },

    uglify: {
      dist: {
        options: {
          report: 'gzip', // false, 'none', 'min', 'gzip'. gzip is a little slower but not significant and good to see.
          sourceMap: true,
        },
        files: {
          'dist/finitedomain.dist.min.js': ['build/finitedomain-browserified.js'],
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-babel'); // we dont really need this but can be handy for debugging
  grunt.loadNpmTasks('grunt-browserify'); // used to build packages for testing in phantomjs
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-run'); // runs npm scripts
  grunt.loadNpmTasks('grunt-remove');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('clean', ['remove']);
  grunt.registerTask('build', ['clean', 'browserify:dist', 'browserify:phantom']);
  grunt.registerTask('dist', ['clean', 'run:lint', 'run:coverage', 'browserify:dist', 'uglify:dist']);
  grunt.registerTask('coverage', ['clean', 'run:coverage']);
  grunt.registerTask('test', ['clean', 'run:lintdev', 'mochaTest:all']);
  grunt.registerTask('testp', ['clean', 'run:lintdev', 'browserify:phantom', 'mocha_phantomjs']);

  grunt.registerTask('default', ['test']);
};


  //  concat: {
  //    options: {
  //      stripBanners: false,
  //      banner: 'FD = ((module? and module) or {}).exports = do ->\n\n',
  //      footer: // add external exports here
  //      '\n' +
  //      '  return {\n' +
  //      '    Solver\n' +
  //      '  }\n',
  //      separator: '\n\n',
  //      process(str, fname) {
  //        switch (fname) {
  //          // ignore some files
  //          case 'src/index.coffee':
  //            break;
  //          default:
  //            let m = str.match(/# BODY_START((?:.|\n|\r)*?)# BODY_STOP/)
  //            if (m[1]) {
  //              m = m[1];
  //            } else {
  //              console.log("Warning: ${fname} had no body start/stop, unable to include");
  //              m = str;
  //            }
  //            return " ###### file: ${fname} ######\n\n" + m
  //        }
  //      },
  //    },
  //    dist: {
  //      src: ['src/**/*.coffee'],
  //      dest: 'build/1.finitedomain.dist.coffee'
  //    }
  //  }
  //});

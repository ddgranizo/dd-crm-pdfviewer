// Karma configuration
// Generated on 2019-05-14

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      'src/thirds/js/pdf.js',
      'src/thirds/js/font-awesome.min.js',
      'src/thirds/js/jquery-3.3.1.slim.min.js',
      'src/thirds/js/popper.min.js',
      'src/thirds/js/bootstrap.min.js',
      'src/thirds/js/angular.min.js',
      './node_modules/angular-mocks/angular-mocks.js',
      'src/main.js',
      'test/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'ChromeDebugging'
    ],

    customLaunchers : {
      ChromeDebugging : {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333']
      }
    },

    // Which plugins to enable
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};

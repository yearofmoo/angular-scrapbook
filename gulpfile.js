// Include gulp
var gulp = require('gulp'); 
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var karma = require('gulp-karma');

gulp.task('copy-html-files', function() {
  gulp.src(['./app/**/*.html', './app/ttc-stations.json', '!./app/index.html'], {base: './app'})
    .pipe(gulp.dest('build/'));
});

gulp.task('usemin', function() {
  gulp.src('./app/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat', rev()],
      js: [uglify(), rev()]
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('connect', function() {
  connect.server({
    root: 'app/'
  });
});

gulp.task('test', function() {
  var files = [
    './app/bower_components/jquery/dist/jquery.js',
    './app/bower_components/underscore/underscore.js',
    './app/bower_components/angular/angular.js',
    './app/bower_components/angular-animate/angular-animate.js',
    './app/bower_components/angular-route/angular-route.js',
    './app/bower_components/angular-messages/angular-messages.js',
    './app/bower_components/angular-embedly/angular-embedly.js',
    './app/bower_components/angular-mocks/angular-mocks.js',
    './app/app.js',
    './app/scrapbook-entry-template.html',
    './app/scrapbook-embed-field-template.html',
    './test/appSpec.js'
  ];
  gulp.src(files)
    .pipe(karma({ configFile: 'karma.conf.js', action: 'watch' }));
});

// Default Task
gulp.task('default', ['connect']);
gulp.task('build', ['copy-html-files', 'usemin']);

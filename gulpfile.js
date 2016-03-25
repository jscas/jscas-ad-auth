'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

gulp.task('validate', () =>
  gulp.src('plugin.js')
    .pipe($.jscs())
    .pipe($.jscs.reporter('inline'))
    .pipe($.jscs.reporter('fail'))
);

gulp.task('test', ['validate'], () =>
  gulp.src('test/*.js').pipe($.mocha({ui: 'qunit', reporter: 'min'}))
);

gulp.task('default', ['test']);

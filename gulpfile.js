/*jshint globalstrict: true*/
/*global require*/

'use strict'

const gulp = require('gulp')
const connect = require('gulp-connect')
const jdists = require('gulp-jdists')
const uglify = require('gulp-uglify')
const rename = require("gulp-rename")
const replace = require('gulp-replace')

gulp.task('connect', function() {
  connect.server({
    port: 2017,
    livereload: true
  })
})

gulp.task('watch', function() {
  gulp.watch(['./example/*.html', './src/**/*.js'], ['build', 'reload'])
})

gulp.task('reload', function() {
  gulp
    .src(['./example/*.html', './src/**/*.js'], ['build', 'reload'])
    .pipe(connect.reload())
})

gulp.task('build', function() {
  gulp.src('./src/jnodes.js')
    .pipe(jdists({
      trigger: 'release'
    }))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(rename('jnodes.min.js'))
    .pipe(gulp.dest('./'))
})

gulp.task('default', ['build', 'connect', 'watch'])
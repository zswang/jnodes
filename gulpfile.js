/*jshint globalstrict: true*/
/*global require*/

'use strict'

const gulp = require('gulp')
const connect = require('gulp-connect')
const jdists = require('gulp-jdists')
const uglify = require('gulp-uglify')
const rename = require("gulp-rename")
const replace = require('gulp-replace')
const typescript = require('gulp-typescript')
const open = require('gulp-open')
const examplejs = require('gulp-examplejs')

const port = 20174;

gulp.task('example', function() {
  return gulp.src([
      'src/ts/**/*.ts',
      '!src/ts/Types.ts',
    ])
    .pipe(examplejs({
      header: `
global.jnodes = require('../jnodes.js');
global.ejs = require('ejs');
global.jhtmls = require('jhtmls');
global.adapter_jhtmls = require('../lib/Adapter/jhtmls').adapter_jhtmls;
global.adapter_ejs = require('../lib/Adapter/ejs').adapter_ejs;
      `
    }))
    .pipe(rename({
      dirname: './',
      extname: '.js',
    }))
    .pipe(gulp.dest('./test'))
})

gulp.task('open', function() {
  gulp
    .src(__filename)
    .pipe(open({
      uri: `http://localhost:${port}/example/`
    }))
})

gulp.task('connect', function() {
  connect.server({
    port: port,
    livereload: {
      prot: 35730
    }
  })
})

gulp.task('watch', function() {
  gulp.watch(['./example/*.html', './src/**/*.ts'], ['build', 'reload'])
})

gulp.task('reload', function() {
  gulp
    .src(['./example/*.html', './src/**/*.ts'])
    .pipe(connect.reload())
})

gulp.task('uglify', function() {
  gulp.src('./jnodes.js')
    .pipe(uglify())
    .pipe(rename('jnodes.min.js'))
    .pipe(gulp.dest('./'))
})

gulp.task('jdists', function() {
  gulp.src('./src/jnodes.jdists.js')
    .pipe(jdists({
      trigger: 'release'
    }))
    .pipe(rename('jnodes.js'))
    .pipe(gulp.dest('./'))
})

gulp.task('typescript', function () {
  gulp.src('./src/ts/*.ts')
    .pipe(jdists({
      trigger: 'typescript'
    }))
    .pipe(typescript({
      target: 'ES5'
    }))
    .pipe(gulp.dest('./src/js'))
})

gulp.task('adapter', function () {
  gulp.src('./src/ts/Adapter/*.ts')
    .pipe(jdists({
      trigger: 'typescript'
    }))
    .pipe(typescript({
      target: 'ES5'
    }))
    .pipe(gulp.dest('./lib/Adapter'))
})

gulp.task('build', ['typescript', 'adapter', 'jdists', 'example'])
gulp.task('dist', ['typescript', 'adapter', 'jdists', 'example', 'uglify'])
gulp.task('debug', ['typescript', 'adapter', 'jdists', 'connect', 'watch', 'open'])
'use strict'; // eslint-disable-line

var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc3');

// We do this over using include/exclude to make everything feel gulp-like!
gulp.task('doc', function (cb) {
    // let jsdoc = require('./index');

    // let config = require('./src/jsdocConfig');
    var config = {
        "opts": {
            "destination": "./public/docs/gen"
        }
    };
    gulp.src( ['README.MD', './api/**/controller.js'], {read: false})
        .pipe(jsdoc(config, cb));
});

gulp.task('default',['doc']);
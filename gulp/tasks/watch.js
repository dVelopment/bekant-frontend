"use strict";

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    config = require('../config');

gulp.task('watch', ['build'], function() {
    watch(config.styleBase + '/**/*.scss', function () {
        gulp.start('sass');
    });
    watch(config.scriptBase + '/**/*.js', function () {
        gulp.start('scripts');
    });
    watch(config.htmlBase + '/**/*.html', function () {
        gulp.start('html');
    });
    watch([config.localesBase + '/**/*.js', config.localesBase + '/**/*.json'], function () {
        gulp.start('locales');
    });
});

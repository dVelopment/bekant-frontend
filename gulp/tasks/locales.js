'use strict';

var gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify'),
    debug = require('../debug'),
    config = require('../config'),
    jsonminify = require('gulp-jsonminify'),
    async = require('async');

gulp.task('locales', function(done) {
    async.parallel([
        function(cb) {
            gulp.src(config.localesBase + '/**/*.js')
                .pipe(gulpIf(!debug, uglify()))
                .pipe(gulp.dest(config.distBase + '/angular/i18n'))
                .on('end', cb);
        },
        function(cb) {
            gulp.src(config.localesBase + '/**/*.json')
                .pipe(jsonminify())
                .pipe(gulp.dest(config.distBase + '/i18n'))
                .on('end', cb);
        }
    ], done);
});

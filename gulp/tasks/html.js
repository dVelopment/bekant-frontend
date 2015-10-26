var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    config = require('../config');

gulp.task('html', function() {
    return gulp.src([config.htmlBase + '/**/*.html'])
        .pipe(minifyHtml())
        .pipe(gulp.dest(config.distBase));
});

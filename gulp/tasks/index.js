require('./html');
require('./scripts');
require('./watch');
require('./locales');
require('./compile');

var gulp = require('gulp');

gulp.task('build', ['sass', 'scripts', 'html', 'locales']);

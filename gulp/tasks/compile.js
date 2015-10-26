'use strict';

var gulp = require('gulp'),
    spawn = require('child_process').spawn;

gulp.task('compile', ['build'], function (done) {
    var proc = spawn('ionic', ['build', 'ios'], {stdio: 'inherit'});

    proc.on('close', function() {
        // disable app transport security
        spawn('/usr/libexec/plistbuddy', [
            '-c',
            'add NSAppTransportSecurity:NSAllowsArbitraryLoads bool true',
            'platforms/ios/Bekant/Bekant-Info.plist'
        ], {stdio: 'inherit'}).on('close', function () {
            spawn('open', ['platforms/ios/Bekant.xcodeproj'], {stdio: 'inherit'}).on('close', function() {
                console.log('open close');
                done();
            });
        });
    });
});

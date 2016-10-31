var gulp = require('gulp'),
    browserSync = require('browser-sync');

gulp.task('server', function () {
    var port = 8083;
    browserSync.init({
        server: {
            baseDir: "./"
        },
        ui: {
            port: port + 1,
            weinre: {
                port: port + 2
            }
        },
        port: port
    });
});

gulp.task('default', function () {
    gulp.start('server');
});
var gulp = require('gulp'),
    yargs = require('yargs').argv,//获取运行gulp命令时附加的命令行参数
    clean = require('gulp-clean'),//清理文件或文件夹
    replace = require('gulp-replace-task'),//对文件中的字符串进行替换
    browserSync = require('browser-sync'),
    src = 'src',
    dist = 'dist',
    CONTEXT_PATH = 'blog/numerGrow/';

//清理
gulp.task('clean', function () {
    return gulp.src(dist, {read: false})
        .pipe(clean());
});

//html
gulp.task('html', function () {
    return gulp.src(src + '/html/**/*')
        .pipe(replace({
            patterns: [
                {
                    match: 'CONTEXT_PATH',
                    replacement: yargs.r ? CONTEXT_PATH : ''
                }
            ]
        }))
        .pipe(gulp.dest(dist + '/html/'));
});

//style
gulp.task('style', function () {
    return gulp.src(src + '/css/**/*')
        .pipe(gulp.dest(dist + '/css/'));
});

//scripts
gulp.task('script', function () {
    return gulp.src(src + '/js/**/*')
        .pipe(replace({
            patterns: [
                {
                    match: 'CONTEXT_PATH',
                    replacement: yargs.r ? CONTEXT_PATH : ''
                }
            ]
        }))
        .pipe(gulp.dest(dist + '/js/'));
});

gulp.task('build', ['clean'], function () {
    return gulp.start('style', 'script','html');
});

gulp.task('watch', function () {
    gulp.watch(src + '/js/**/*', ['script']);
    gulp.watch(src + '/html/**/*', ['html']);
    gulp.watch(src + '/css/**/*', ['style']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: 'dist/html/demo.html'
    });
});


/**
 * 参数说明
 * -w: 监听文件改变
 * -s: 启动browserAsync
 * -p: 指定端口
 * -r: 需要更新github上的demo时才会用到的参数
 *
 * 常用命令如下
 * 构建：gulp
 * 构建完，监听文件改变：gulp -w
 * 构建并启动browserAsync: gulp -s
 * 通过指定端口启动browserAsync: gulp -s -p=8081
 * 构建启动browserAsync，同时启动监听： gulp -sw
 */
gulp.task('default', ['build'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});
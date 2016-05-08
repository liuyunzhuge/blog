var gulp = require('gulp'),
    yargs = require('yargs').argv,//获取运行gulp命令时附加的命令行参数
    clean = require('gulp-clean'),//清理文件或文件夹
    autoprefixer = require('gulp-autoprefixer'),//自动添加CSS3的前缀
    less = require('gulp-less'),//编译less
    browserSync = require('browser-sync'),
    src = 'src',
    dist = 'dist';

//清理
gulp.task('clean', function () {
    return gulp.src(dist, {read: false})
        .pipe(clean());
});

//static
gulp.task('static', function () {
    return gulp.src([
        src + '/lib/**/*',
        src + '/fonts/**/*'
    ], {base: src})
        .pipe(gulp.dest(dist));
});

//style
gulp.task('style', function () {
    return gulp.src(src + '/css/**/*')
        .pipe(gulp.dest(dist + '/css/'));
});

//scripts
gulp.task('script', function () {
    return gulp.src(src + '/js/**/*')
        .pipe(gulp.dest(dist + '/js/'));
});

gulp.task('build', ['clean'], function () {
    return gulp.start('style', 'script', 'static');
});

gulp.task('watch', function () {
    gulp.watch(src + '/js/**/*', ['script']);
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
        startPath: 'demo/index.html'
    });
});


/**
 * 参数说明
 * -w: 监听文件改变
 * -s: 启动browserAsync
 * -p: 指定端口
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
var gulp = require('gulp'),
    yargs = require('yargs').argv,
    clean = require('gulp-clean'),
    replace = require('gulp-replace-task'),
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    gulpif = require('gulp-if'),
    plumber = require('gulp-plumber'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    src = './src',
    dist = './dist',
    option = {base: src},
    CONTEXT_PATH = '/blog/h5_demo/dist',
    replace_patterns = [
        {
            match: 'CONTEXT_PATH',
            replacement: yargs.g ? CONTEXT_PATH : ''
        }
    ];

//在plumber出错的时候终止task
function plumber_config(done) {
    return {
        errorHandler: function (err) {
            done(err);
        }
    }
}

gulp.task('clean', function () {
    return gulp.src(dist, {read: false})
        .pipe(clean());
});

//style
gulp.task('style', function (cb) {
    return gulp.src(src + '/less/mod/**/*', {base: src + '/less/mod'})
        .pipe(plumber(plumber_config(cb)))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulpif(yargs.r,minifycss()))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(browserSync.reload({stream: true}));
});

//images
gulp.task('image', function () {
    return gulp.src(src + '/img/**/*', option)
        .pipe(gulp.dest(dist));
});

//html
gulp.task('html', function () {
    return gulp.src(src + '/html/**/*', option)
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

//copy_js
gulp.task('script', function () {
    return gulp.src(src + '/js/**/*', option)
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

//final build
gulp.task('build', ['clean'], function (cb) {
    var task_seq = [['style', 'image', 'html', 'script'], cb];
    runSequence.apply(null, task_seq);
});

//watch file changes, can only used in develop environment
gulp.task('watch', function () {
    gulp.watch(src + '/html/**/*', ['html']);
    gulp.watch(src + '/js/**/*', ['script']);
    gulp.watch(src + '/less/**/*', ['style']);
});

gulp.task('server', function () {
    yargs.p = yargs.p || 8083;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: 'html/demo.html'
    });
});

/**
 * 参数说明
 * -w: 监听文件改变
 * -s: 启动browserAsync
 * -p: 指定端口
 * -r: 生产环境构建
 * -g: 构建到gh-pages
 */
gulp.task('default', function (cb) {
    var task_seq = ['build'];
    if (yargs.s) {
        task_seq.push('server');
    }
    if (yargs.w) {
        task_seq.push('watch');
    }
    task_seq.push(cb);
    runSequence.apply(null, task_seq);
});
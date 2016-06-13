var gulp = require('gulp'),
    yargs = require('yargs').argv,//获取运行gulp命令时附加的命令行参数
    clean = require('gulp-clean'),//清理文件或文件夹
    replace = require('gulp-replace-task'),//对文件中的字符串进行替换
    browserSync = require('browser-sync'),//启动静态服务器
    transport = require("gulp-seajs-transport"),//对seajs的模块进行预处理：添加模块标识
    concat = require("gulp-seajs-concat"),//seajs模块合并
    uglify = require('gulp-uglify'),//js压缩混淆
    merge = require('merge-stream'),//合并多个流
    src = 'src',
    dist = 'dist',
    CONTEXT_PATH = 'blog/seajs/',
    replace_patterns = [
        {
            match: 'CONTEXT_PATH',
            replacement: yargs.r ? CONTEXT_PATH : ''
        }
    ];

//清理构建目录
gulp.task('clean', function () {
    return gulp.src(dist, {read: false})
        .pipe(clean());
});

//拷贝src/html到dist/html
gulp.task('html', function () {
    return gulp.src(src + '/html/**/*')
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/html/'));
});

//拷贝模式：src/js到dist/js
gulp.task('script_copy', function () {
    return gulp.src(src + '/js/**/*', {base: src + '/js'})
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/js'));
});

//seajs合并模式
gulp.task("seajs", function () {
    return merge(
        gulp.src(src + '/js/!(lib)/**/*.js', {base: src + '/js'})
            .pipe(transport())
            .pipe(concat({
                base: src + '/js'
            }))
            .pipe(replace({
                patterns: replace_patterns
            }))
            .pipe(gulp.dest(dist + '/js')),

        gulp.src([src + '/js/lib/**/*.js', src + '/js/common.js'], {base: src + '/js'})
            .pipe(replace({
                patterns: replace_patterns
            }))
            .pipe(gulp.dest(dist + '/js'))
    );
});

//js压缩混淆，条件是生产环境下才会真正的压缩混淆
//另外它依赖于seajs或script_copy任务：
//生产环境执行seajs任务，开发环境执行script_copy任务
gulp.task('script_uglify', [yargs.r ? 'seajs' : 'script_copy'], function (cb) {
    if (yargs.r) {
        return gulp.src([
            dist + '/js/lib/**/*.js',
            dist + '/js/app/**/*.js'
        ], {base: dist + '/js'})
            .pipe(uglify({
                mangle: {
                    except: ['require', 'exports', 'module']//这几个变量不能压缩混淆，否则会引发seajs的一些意外问题
                }
            }))
            .pipe(gulp.dest(dist + '/js_tmp'));
    } else {
        cb();
    }
});

//前面一个任务将压缩后的代码都放到了dist/js_tmp下
//这个任务将压缩后的代码从dist/js_tmp还原到dist/js
gulp.task('script_restore', ['script_uglify'], function (cb) {
    if (yargs.r) {
        return gulp.src([
            dist + '/js_tmp/**/*'
        ], {base: dist + '/js_tmp'})
            .pipe(gulp.dest(dist + '/js'));
    } else {
        cb();
    }
});

//最终的script任务
gulp.task('script', ['script_restore'], function (cb) {
    if (yargs.r) {
        return gulp.src([dist + '/js_tmp'], {read: false})
            .pipe(clean());
    } else {
        cb();
    }
});

gulp.task('build', ['clean'], function () {
    return gulp.start('script', 'html');
});

gulp.task('watch', function () {
    gulp.watch(src + '/js/**/*', ['script']);
    gulp.watch(src + '/html/**/*', ['html']);
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
        startPath: 'dist/html/login.html'
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
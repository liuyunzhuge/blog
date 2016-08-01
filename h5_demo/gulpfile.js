var gulp = require('gulp'),
    yargs = require('yargs').argv,
    clean = require('gulp-clean'),
    gulpif = require('gulp-if'),
    merge = require('merge-stream'),
    replace = require('gulp-replace-task'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    transport = require("gulp-seajs-transport"),
    concat = require("gulp-seajs-concat"),
    minifycss = require('gulp-minify-css'),
    tap = require('gulp-tap'),
    less = require('gulp-less'),
    revReplace = require('gulp-rev-replace'),
    plumber = require('gulp-plumber'),
    rev = require('gulp-rev'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    path = require('path'),
    fs = require('fs'),
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
        .pipe(gulpif(yargs.r, minifycss()))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(browserSync.reload({stream: true}));
});

//images
gulp.task('image', function () {
    return gulp.src(src + '/img/**/*', option)
        .pipe(gulpif(yargs.r, imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant()]
        })))
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
gulp.task('copy_js', function () {
    return gulp.src(src + '/js/**/*', option)
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}));
});

//build js in release environment
gulp.task("release_js", function () {
    var uglify_js = function () {
        return gulpif(yargs.r, uglify({
            mangle: {
                except: ['require', 'exports', 'module']
            }
        }));
    };

    return merge(
        //concat all script file exclude those in folder /lib
        gulp.src(src + "/js/!(lib|conf)/**/*.js", {base: src + '/js'})
            .pipe(transport())
            .pipe(concat({
                base: src + "/js"
            }))
            .pipe(replace({
                patterns: replace_patterns
            }))
            .pipe(uglify_js())
            .pipe(gulp.dest(dist + "/js")),

        gulp.src([src + '/js/lib/**/*', src + '/js/conf/**/*.js'], {base: src + '/js'})
            .pipe(replace({
                patterns: replace_patterns
            }))
            .pipe(uglify_js())
            .pipe(gulp.dest(dist + "/js"))
    );
});

//build js's final task
gulp.task("script", [yargs.r ? 'release_js' : 'copy_js'], function (cb) {
    cb();
});

//create rev manifest
gulp.task('rev_manifest', function (cb) {
    return gulp.src([
        dist + '/css/**/*.css',
        dist + '/img/**/*',
        dist + '/js/app/**/*.js',
        dist + '/js/conf/**/*.js'
    ], {base: dist})
        .pipe(rev())
        .pipe(gulp.dest(dist + '/revTmp'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(dist));
});

//rev_replace
gulp.task('rev_replace', ['rev_manifest'], function () {
    var manifest = gulp.src(dist + '/rev-manifest.json');

    return gulp.src([
        dist + '/html/**/*.html',
        dist + '/css/**/*.css',
        dist + '/js/**/*.js'
    ], {base: dist})
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(dist));
});

//finish rev !
gulp.task('rev', ['rev_replace'], function (cb) {
    return gulp.src([
        dist + '/revTmp'
    ], {read: false})
        .pipe(clean());
});

//make file inline todo seajs main js inline
gulp.task('inline', function () {
    return gulp.src(dist + '/html/**/*', option)
        .pipe(tap(function (file) {
            var dir = __dirname;
            var contents = file.contents.toString();

            contents = contents.replace(/<link.+inline.+href="([^"']+)".*>|<script.+inline.+src="([^"']+)".*>\s*<\/script>/gi, function (match, $1, $2) {
                //console.log(match)
                var filename = $1 || $2;
                filename = path.join(dir, dist + filename.replace(CONTEXT_PATH, ''));
                var qIndex = filename.indexOf('?');

                if (qIndex > -1) {
                    filename = filename.substring(0, qIndex);
                }

                //console.log(filename);
                var content = fs.readFileSync(filename, 'utf-8');
                return $1 ? '<style type="text/css">\n' + content + '\n</style>' : '<script>' + content + '\n</script>';
            });
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest(dist));
});

//final build
gulp.task('build', ['clean'], function (cb) {
    var task_seq = [['style', 'image', 'html', 'script'], cb];
    if (yargs.r) {
        task_seq = [['style', 'image', 'html', 'script'], 'rev', 'inline', cb];
    }
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
        startPath: 'html/youku_summer.html'
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
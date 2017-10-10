const gulp = require('gulp');
const path = require('path');
const plugins = require('gulp-load-plugins'),
    $ = plugins();
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const traverse = require('through-gulp');
const mRollup = require('./rollup.config');
const glob = require('glob');

const rGetJsFile = (_dir) => {
    return glob.sync(_dir, { nodir: true, sync: true });
}
const fileEntry = rGetJsFile(path.resolve(__dirname, './dev/*/*.es6'));

gulp.task('js', () => {
    const jsTask = fileEntry.map((fileDir) => {
        let _dir = path.normalize(fileDir),
            _lastDir = _dir.split(path.sep).slice(-2, -1);
        return gulp.src(_dir)
            .pipe($.plumber({
                errorHandler: $.notify.onError("Error-img: <%= error %>")
            }))
            .pipe($.cached(`jsing`))
            .pipe($.rollup(mRollup(_dir)))
            .pipe($.rename({ extname: `.js` }))
            .pipe(gulp.dest(path.resolve(__dirname, `./dist/${_lastDir}/`)));
    });
    return jsTask;
});

gulp.task('img', () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/img/*.{png,jpg,gif,ico}`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error-img: <%= error %>")
        }))
        .pipe($.cached('imging'))
        .pipe(($.imageisux('../imgmin', false)))
});

gulp.task('css', ['img'], () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/*.scss`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error-css: <%= error %>")
        }))
        .pipe($.cached('cssing'))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss([
            cssnext({
                browsers: [
                    'last 2 versions',
                    '> 1%',
                    'ie >= 8',
                    'iOS >= 8',
                    'Android >= 4',
                ],
                warnForDuplicates: false
            }),
            // 避免cssnano优化项，压缩
            cssnano({
                safe: true
            })
        ]))
        .pipe($.cssBase64({
            baseDir: '',
            maxWeightResource: 6144,
            extensionsAllowed: ['.gif', '.jpg', '.png']
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `./dist/`)))
});

gulp.task('clean', function() {
    return gulp.src(path.resolve(__dirname, `./dist/*`))
        .pipe($.clean({ force: true }))
});

gulp.task('watch', function() {
    gulp.watch('./dev/**/*.scss', ['css'])
        .watch('./dev/**/*.es6', ['js'])
        .watch('./dev/**/img/*', ['img']);
});

gulp.task('default', $.sequence('clean', 'css', 'js'));
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const opn = require('opn');
const plugins = require('gulp-load-plugins'),
    $ = plugins();
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const traverse = require('through-gulp');
const mRollup = require('./rollup.config');

let fileEntry = [];
// const rGetFolder = (_dir) => {
//     return fs.readdirSync(_dir)
//         .filter((_file) => {
//             return fs.statSync(path.join(_dir, _file)).isDirectory()
//         })
// };

// const runPath = rGetFolder(path.resolve(__dirname, './dev'));
gulp.task('path', () => {
    gulp.src(path.resolve(__dirname, './dev/*/*.es6'))
        .pipe(traverse(function(file, enc, cb) {
            fileEntry.push(file.path);
            // console.log(path.resolve(__dirname))
            // fileEntry.push(path.resolve(__dirname, file.path));
            console.log(fileEntry)
            cb();
        }));
});
gulp.task('js', ['path'], () => {
    gulp.src(path.resolve(__dirname, './dev/*/*.es6'))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error-js: <%= error %>")
        }))
        .pipe($.cached('jsing'))
        .pipe($.rollup(mRollup(fileEntry)))
        .pipe($.rename({ extname: `.js` }))
        .pipe(gulp.dest(path.resolve(__dirname, `./dist/`)));
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
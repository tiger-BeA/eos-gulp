const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const opn = require('opn');
const plugins = require('gulp-load-plugins'),
    $ = plugins();
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const traverse = require('through2');

// const rollup = require('rollup');
// import babel from 'rollup-plugin-babel';
// import eslint from 'rollup-plugin-eslint';
// import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import replace from 'rollup-plugin-replace';
// import uglify from 'rollup-plugin-uglify';

// const rGetFolder = (_dir) => {
//     return fs.readdirSync(_dir)
//         .filter((_file) => {
//             return fs.statSync(path.join(_dir, _file)).isDirectory()
//         })
// };

// const runPath = rGetFolder(path.resolve(__dirname, './dev'));

gulp.task('jsmin', () => {
    gulp.src(path.resolve(__dirname, './dev/*/*.es6'))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error-jsmin: <%= error %>")
        }))
        .pipe($.cached('jsing'))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.jsImport({ hideConsole: true }))
        .pipe($.babel())
        .pipe($.rollupStream()) // 去除冗余代码
        .pipe($.rename({ extname: `.js` }))
        .pipe(gulp.dest(path.resolve(__dirname, `./dist/`)))
        // .pipe(traverse.obj(function(file, enc, cb) {
        //     rollup.rollup({
        //         entry: file.path,
        //         dest: path.resolve(__dirname, `./dist/`),
        //         // external: ['jquery'],
        //         // paths: {
        //         //     jquery: 'https://mimg.127.net/pub/common/js/jquery.min.js'
        //         // },
        //         plugins: [
        //             babel(),
        //             eslint(),
        //             commonjs(),
        //             resolve({
        //                 jsnext: true, //jsnext属性是为了帮助Node模块迁移到ES2015的一部分
        //                 // 下面两个帮助插件决定，哪个程序包应该被bundle文件使用
        //                 main: true,
        //                 browser: true
        //             }),
        //         ]
        //     })
        // }))
});

gulp.task('imgmin', () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/img/*.{png,jpg,gif,ico}`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe($.imageisux('../imgmin', false))
});

gulp.task('cssmin', ['imgmin'], () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/*.scss`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
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

gulp.task('default', $.sequence('clean', 'cssmin', 'jsmin'));
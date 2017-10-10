const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const eslint = require('rollup-plugin-eslint');

module.exports = function(params) {
    return {
        input: params,
        format: 'iife',
        plugins: [
            postcss({
                extensions: ['.css']
            }),
            // 以防加载node模块
            resolve({
                jsnext: true,
                main: true,
                browser: true
            }),
            // 以防加载node模块
            commonjs(),
            eslint(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }
};
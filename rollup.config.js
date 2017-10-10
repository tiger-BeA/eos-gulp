const babel = require('rollup-plugin-babel');
const eslint = require('rollup-plugin-eslint');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const postcss = require('rollup-plugin-postcss');

module.exports = function(params) {
    return {
        input: params,
        format: 'iife',
        plugins: [
            postcss({
                extensions: ['.scss']
            }),
            resolve({
                jsnext: true,
                main: true,
                browser: true
            }),
            commonjs(),
            eslint(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }
};
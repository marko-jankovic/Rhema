'use strict';

const Minifier = require('html-minifier');

module.exports = (options) => {
    return (data, html, next) => {
        next(null, data, Minifier.minify(html, options));
    };
};

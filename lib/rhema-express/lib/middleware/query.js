'use strict';

/**
 * Module dependencies.
 */

const merge = require('utils-merge');
const parseUrl = require('parseurl');
const qs = require('qs');

/**
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function query (options) {
    let opts = merge({}, options);
    let queryparse = qs.parse;

    if (typeof options === 'function') {
        queryparse = options;
        opts = undefined;
    }

    if (opts !== undefined && opts.allowPrototypes === undefined) {
    // back-compat for qs module
        opts.allowPrototypes = true;
    }

    return function query (req, res, next) {
        if (!req.query) {
            const val = parseUrl(req).query;
            req.query = queryparse(val, opts);
        }

        next();
    };
};

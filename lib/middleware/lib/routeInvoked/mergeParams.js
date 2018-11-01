'use strict';

const utils = require('../../../utils');

// Merge query and rest params in new request field queryAndParams
module.exports = (options) => {
    return (req, res, next) => {
        req.queryAndParams = {};

        if (typeof req.params === 'object' && typeof req.query === 'object') {
            req.queryAndParams = Object.assign({}, req.query, req.params);
            req.allParams = Object.assign({}, req.queryAndParams, req.body);

            if (options.blackList) {
                req.queryAndParams = utils.object.omit(req.queryAndParams, options.blackList);
                req.allParams = utils.object.omit(req.allParams, options.blackList);
            }
        }

        next();
    };
};

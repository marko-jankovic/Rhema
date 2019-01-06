'use strict';

const async = require('async');
const loadByAppPaths = require('@rhema/loader');
const utils = require('@rhema/utils');

module.exports = function Hooks (config) {
    const stack = [];

    Object.keys(config).forEach((type) => {
        stack[type] = [];
        // sort by priority
        const sortBy = utils.object.sortByProperty(config[type], 'order');

        sortBy.forEach((current) => {
            // load only active modules
            if (utils.env.isActive(current)) {
                const hook = loadByAppPaths(current.path);
                // push it to stack
                stack[type].push(hook(current.options || {}));
            }
        });
    });

    return type => (a, b, callback) => {
            // initial function for starting waterfall
        const fnStack = [next => next(null, a, b)].concat(stack[type]);

            // wrapp async with domain
        if (stack[type]) {
            logger.debug('Hook', type, 'stack started...');
            async.waterfall(utils.fn.asyncTryCatch(fnStack, `${type} Hook`), (err, x, y) => {
                logger.debug('Hook', type, 'finished.');
                callback(err, x, y);
            });
        } else {
            callback(new Error(`Hook ${type} is not defined in your config!`), a, b);
        }
    };
};

'use strict';

const registry = require('@rhema/registry');
const utils = require('@rhema/utils');

module.exports = {
    set (namespace, data) {
        // keep all beatle data in beatle registry namespace
        const beatleData = registry.get('beatle');

        // beatle namespace will be available only
        // if there is query req.query.beatle
        if (beatleData) {
            // add sub-namespace if it is not defined
            if (!beatleData[namespace]) {
                beatleData[namespace] = [];
            }

            if (Array.isArray(beatleData[namespace])) {
                // data will be pushed since
                // "beatle" namespace is an array
                beatleData[namespace].push(utils.object.deepClone(data));

                // set data to beatle
                registry.set('beatle', beatleData);
            }
        }
    },

    get (queryValue) {
        // get data from beatle
        // if there is query req.query.beatle
        const beatle = registry.get('beatle');
        // support dot format beatle=config.app.api
        return beatle ? (utils.object.getValue(beatle, queryValue) || beatle) : {};
    }
};

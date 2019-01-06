'use strict';

const beatle = require('@rhema/beatle');

// Attach Beatle data to viewmodel
module.exports = (options) => {
    return (data, req, next) => {
        // insert only if beatle query
        if (req.query.beatle) {
            const beatleData = {};
            // set beatleData at the top of json object
            beatleData.beatle = beatle.get(req.query.beatle);

            if (options.mergeWithData) {
                data = Object.assign(beatleData, data);
            } else {
                data = beatleData;
            }
        }

        next(null, data, req);
    };
};

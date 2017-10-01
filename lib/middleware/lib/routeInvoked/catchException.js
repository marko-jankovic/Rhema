'use strict';

const domain = require('domain');

// Domain emits 'error' when it's given an unhandled error
module.exports = () => {
    return (req, res, next) => {
        const middlewareDomain = domain.create();
        let isCalled = false;

        middlewareDomain.add(req);
        middlewareDomain.add(res);

        middlewareDomain.on('error', (error) => {
            // flag will prevent multiple emiting error
            // and properly redirect to internalError middlewere
            if (!isCalled) {
                isCalled = true;
                if (!error.statusCode) {
                    error.statusCode = 503;
                }

                next(error);
            }
        });

        middlewareDomain.run(next);
    };
};

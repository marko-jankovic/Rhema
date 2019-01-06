'use strict';

const beatle = require('@rhema/beatle');

// Set Request info to Beatle
module.exports = () => {
    return (req, res, next) => {
        if (req.query.beatle) {
            // set requst info to beatle
            beatle.set('request', {
                params: req.params,
                query: req.query,
                pageType: req.page,
                method: req.method,
                resHeaders: res._headers,
                reqHeaders: {
                    hostname: req.hostname || req.host,
                    'user-agent': req.getUserAgent(),
                    accept: req.headers.accept,
                    'accept-encoding': req.headers['accept-encoding'],
                    connection: req.headers.connection,
                    'cache-control': req.headers['cache-control'],
                    cookies: req.cookies
                },
                app: {
                    cacheBusters: req.app.locals.cacheBusters,
                    core: req.app.locals.core
                }
            });
        }

        next();
    };
};

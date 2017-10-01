'use strict';

const Controller = require('../baseController');

// route for getting $cache property inside service
class CacheController extends Controller {
    getAction (req, res) {
        let $cache = {};

        // Get the if-modified-since header from the request
        const reqModDate = req.headers['if-modified-since'];
        const modifiedSince = new Date(reqModDate);
        const now = new Date();

        // check if if-modified-since
        if (reqModDate && modifiedSince.getTime() > now.getTime()) {
            // send a 304 header without data (will be loaded by cache)
            res.status(304);
        } else if (req.params.type && req.params.category) {
            try {
                // everything we want to cache should be in gateway $cache
                // @TODO - should point on $fetchData method
                // which will return $cache or make a new api call
                $cache = this[`$${req.params.category}`][req.params.type].$cache;

                console.log(this[`$${req.params.category}`][req.params.type]);

                // cache response for 3 hours (180 min, 10800 sec)
                const future = new Date(now.setMinutes(now.getMinutes() + 180));
                res.setHeader('Cache-Control', 'public, max-age=10800');
                res.setHeader('Last-Modified', future.toUTCString());
            } catch (e) {
                // route doesn't exists
                res.status(404);
            }
        }

        this.json(null, $cache);
    }
}

module.exports = CacheController;

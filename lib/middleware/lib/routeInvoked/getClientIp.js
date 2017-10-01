'use strict';

// Get client IP from headers and set to request clientIP
module.exports = (options) => {
    return (req, res, next) => {
        // forceIP from query
        const forcedIP = (req.query && req.query.forceIP) || false;
        // check if there's reverse proxy between the clients and our app
        let ipThroughProxy = false;

        if (options.proxy && req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].indexOf(',') > 0) {
            ipThroughProxy = req.headers['x-forwarded-for'];
            logger.info('IP sent through reverse (proxy between the client and this app) proxy:', ipThroughProxy);
        }

        let ip = forcedIP ||
            ipThroughProxy ||
            req.headers['x-cluster-client-ip'] ||
            req.headers['X-Request-IP'] ||
            req.headers['x-forwarded-for'] ||
            req.headers['X-Forwarded-For'] ||
            req.headers['x-client-ip'] ||
            req.headers['x-real-ip'] ||
            req.headers['forwarded-for'] ||
            req.headers.forwarded ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress;

        // if there's comma in retrieved ip - we need to explode and convert to array:
        if (typeof ip === 'string') {
            ip = ip.split(',');

            // trim whitespaces:
            ip.forEach((value, key) => {
                ip[key] = value.trim();
            });
        }

        // if IP is array use first element
        ip = Array.isArray(ip) ? ip[0] : ip;

        if (!forcedIP && options.defaultIP) {
            // for local or alpha env use defaultIP
            // if there is no forced IP through forceIP url parameter
            ip = options.defaultIP;
        }

        // make sure it will work on localhost
        if (ip && ip.indexOf('127.0.0.1') !== -1) {
            ip = options.defaultIP || '';
        }

        req.clientIP = ip;

        next();
    };
};

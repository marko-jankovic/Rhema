'use strict';

const onHeaders = require('on-headers');

// Set timings to 'Server-Timing' header
// Disabled - Work in progress !!!
module.exports = (options) => {
    return (req, res, next) => {
        // onHeaders is wrapper around res.writeHead
        onHeaders(res, () => {
            res.setHeader('Server-Timing', timer.getTimings());
        });

        next();
    };
};

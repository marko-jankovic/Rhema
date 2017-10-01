'use strict';

/* eslint no-underscore-dangle: ["error", { "allow": ["_header"] }] */

// Handling Request Timeout
module.exports = (time) => {
    time = time || 30000;

    return (req, res, next) => {
        req.isTimeout = false;

        const timeout = setTimeout(() => {
            req.emit('timeout', time);
        }, time);

        res.on('close', () => {
            clearTimeout(timeout);
            return req.socket.destroy();
        });

        res.on('finish', () => {
            clearTimeout(timeout);
        });

        req.on('timeout', () => {
            if (res._header || res.headersSent) {
                clearTimeout(timeout);
                return req.socket.destroy();
            }

            if (!req.isTimeout) {
                req.isTimeout = true;
                const err = new Error('Response timeout!');

                err.timeout = time;
                err.status = '503';
                err.code = 'ETIMEDOUT';

                next(err);
            }
        });

        req.clearTimeout = () => {
            clearTimeout(timeout);
        };

        next();
    };
};

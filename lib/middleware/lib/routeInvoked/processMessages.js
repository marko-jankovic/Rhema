'use strict';

// Send message from Child process to Master
module.exports = (options) => {
    return (req, res, next) => {
        const type = req.query[options.queryName];

        if (type && process.send && options.queryWhiteList.includes(type)) {
            // Send message to Master process.
            process.send({
                msgFromWorker: {
                    type,
                    pid: process.pid
                }
            });
        }

        next();
    };
};

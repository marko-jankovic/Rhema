'use strict';

// Set headers defined in config
module.exports = (options) => {
    return (req, res, next) => {
        Object.keys(options).forEach((key) => {
            if (key === 'Expires') {
                options[key] = new Date(Date.now() + options[key]).toUTCString();
            }

            res.setHeader(key, options[key]);
        });

        next();
    };
};

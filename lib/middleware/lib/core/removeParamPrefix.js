'use strict';

// Remove injected param prefix
// added in order to ensure unique route params
module.exports = (params, paramPrefix) => {
    return (req, res, next) => {
        Object.keys(params || {}).forEach((key) => {
            if (req.params[paramPrefix + key] !== undefined) {
                req.params[key] = req.params[paramPrefix + key];
            }

            delete req.params[paramPrefix + key];
        });

        next();
    };
};

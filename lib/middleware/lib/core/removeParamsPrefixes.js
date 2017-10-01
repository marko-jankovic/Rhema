'use strict';

// removeParamsPrefixes
module.exports = (params) => {
    return (req, res, next) => {
        // remap params with prefix
        Object.keys(params || {}).forEach((key) => {
            if (req.params[key] && params[key].match(new RegExp(`^${key}-.+`))) {
                const regex = new RegExp(`${key}-`);
                req.params[key] = req.params[key].replace(regex, '');
            }
        });

        next();
    };
};

'use strict';

// Set page name to req and locals
// Page name is defined in router.json config
module.exports = (page) => {
    return (req, res, next) => {
        req.app.locals.core.page = page;
        req.page = page;
        next();
    };
};

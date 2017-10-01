'use strict';

// Attach query value to viewmodel and locals
module.exports = (options) => {
    return (data, req, next) => {
        options.queryWhiteList.forEach((q) => {
            if (req.query[q]) {
                data[q] = req.query[q] || true;
                req.app.locals.core[q] = req.query[q] || true;
            }
        });

        next(null, data, req);
    };
};

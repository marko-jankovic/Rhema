'use strict';

// Exlude only specific field from viewmodel
module.exports = (options) => {
    return (data, req, next) => {
        delete data[options.queryName];
        next(null, data, req);
    };
};

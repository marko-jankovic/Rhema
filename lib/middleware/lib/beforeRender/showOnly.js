'use strict';

const utils = require('@rhema/utils');

// Show only specific field in viewmodel
module.exports = (options) => {
    return (data, req, next) =>{
        if (req.query[options.queryName]) {
            data = utils.object.getValue(data, req.query[options.queryName]) || data;
        }

        next(null, data, req);
    };
};

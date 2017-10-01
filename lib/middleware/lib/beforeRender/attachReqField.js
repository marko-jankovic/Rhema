'use strict';

// Attach request field to viewmodel
module.exports = (options) => {
    return (data, req, next) => {
        if (Array.isArray(options.reqWhiteList)) {
            options.reqWhiteList.forEach((f) => {
                if (typeof req[f] === 'function') {
                    data[f] = req[f]();
                } else if (req[f]) {
                    data[f] = req[f];
                } else {
                    data[f] = null;
                }
            });
        }

        if (!Array.isArray(options.reqWhiteMap)) {
            Object.keys(options.reqWhiteMap).forEach((f) => {
                if (typeof req[f] === 'function') {
                    data[options.reqWhiteMap[f]] = req[f]();
                } else if (req[f]) {
                    data[options.reqWhiteMap[f]] = req[f];
                } else {
                    data[options.reqWhiteMap[f]] = null;
                }
            });
        }

        next(null, data, req);
    };
};

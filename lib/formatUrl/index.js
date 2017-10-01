'use strict';

const querystring = require('querystring');

const clone = function (obj = {}) {
    const copy = {};

    for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }

    return copy;
};

module.exports = function FormatUrl (options) {
    return function formatUrl (route, params, decode) {
        // prepare params keys for formating url
        // use config from options
        // make: 'mercedes_benz' => SRPmake: 'make-mercedes_benz'
        const addParamsPrefixes = function (params, options) {
            Object.keys(options.params).forEach((key) => {
                if (params[key] && options.params[key].match(new RegExp(`^${key}-.+`))) {
                    params[key] = `${key}-${params[key]}`;
                }
            });

            return params;
        };

        const formatter = function formatter (path, params) {
            // clone params because it will be modified
            if (typeof params === 'function') {
                params = params();
            }

            let newParams = params ? clone(params) : {};
            let queryString = {};

            if (newParams && typeof newParams === 'object') {
                Object.keys(newParams).forEach((key) => {
                    if (!newParams[key]) {
                        delete newParams[key];
                    }
                });
            }

            // add prefixes, example: make: mercedes_benz => make: make-mercedes_benz
            if (options[route].paramsPrefixes) {
                newParams = addParamsPrefixes(newParams, options[route]);
            }

            // replace path with params
            let newUrl = path.replace(/(:\w+\??)/g, (param) => {
                let newParam = '';
                param = param.replace(/[:?]/g, '');

                // param was find in path
                if (newParams && newParams[param]) {
                    newParam = newParams[param];

                    // delete params that we found
                    delete newParams[param];
                }

                return newParam;
            });

            // sort query params by order defined in route config
            if (options[route].query && Array.isArray(options[route].query.order)) {
                options[route].query.order.forEach((p) => {
                    if (newParams[p]) {
                        queryString[p] = newParams[p];
                        delete newParams[p];
                    }
                });
            }

            queryString = querystring.stringify(queryString);

            if (Object.keys(newParams).length !== 0) {
                queryString += queryString ? '&' : '';

                // all params that we didn't match are considered as query
                queryString += querystring.stringify(newParams);
            }

            // replace more than one back-slash with one slash
            newUrl = newUrl.replace(/\/+/g, '/');

            // remove trailing slash and hyphen
            if (newUrl !== '/') {
                newUrl = newUrl.replace(/[\/, -]+$/, '');
            }

            // attach query string to url
            if (queryString) {
                newUrl += `?${decodeURIComponent(queryString)}`;
            }

            if (decode === false) {
                return newUrl;
            } else {
                return decodeURIComponent(newUrl);
            }
        };

        // route does not exists
        if (!options[route] && !options[route].path) {
            return false;
        } else {
            return formatter(options[route].path, params);
        }
    };
};

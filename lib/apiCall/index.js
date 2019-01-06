'use strict';

const request = require('request');
const url = require('url');
const querystring = require('querystring');
const utils = require('@rhema/utils');
const beatle = require('@rhema/beatle');
const registry = require('@rhema/registry');
const Timer = require('@rhema/timer');

module.exports = function Request (defaultOptions = {}) {
    //
    return (namespace, moduleOptions = {}, callback, stream = false) => {
        callback = callback || function () {};
        return new Promise((resolve, reject) => {
            // immutable merge default and module options
            const options = utils.object.immutableDeepMerge(defaultOptions, moduleOptions);
            // get url object
            const parseUrl = url.parse(options.uri || options.url, true);
            // default method is GET
            const method = options.method ? options.method.toUpperCase() : 'GET';
            // query params based on query string from uri and values set in options
            const queryParams = Object.assign((options.qs || {}), (parseUrl.query || {}));
            // create query string
            const queryString = querystring.stringify(queryParams);
            // body params
            const bodyParams = (options.body && method === 'POST') ? options.body : '';
            // create full url with query string if method is GET
            const fullUrl = (method === 'GET' && queryString) ? `${parseUrl.protocol}//${parseUrl.hostname}${parseUrl.port ? `:${parseUrl.port}` : ''}${parseUrl.pathname}?${queryString}` : options.uri || options.url;

            // pass request id
            options.headers[options.xRequestIdName || 'x-request-id'] = registry.get('requestId') || '';

            // set json to false for POST
            options.json = bodyParams ? false : options.json;

            // set url data to beatle
            beatle.set('apiUrls', {
                [namespace]: {
                    url: fullUrl,
                    params: bodyParams || queryParams || {}, // handle POST and GET params
                    description: options.description
                }
            });

            const handleError = (error) => {
                if (!error) {
                    error = new Error('ApiCall Error!');
                }

                logger.error(`ApiCall ${namespace} Error! Request url - ${fullUrl}`, error.stack || error);
                metrics.increment(`ApiCall.${namespace}.500`);

                callback(error, null);
                reject(error);
            };

            const handleSuccess = (res, body) => {
                const responseSize = res.headers['content-length'] || false;
                const size = responseSize ? (` finished - response size ${utils.math.bytesToSize(responseSize, 2)}`) : 'finished ';
                const data = body === null ? res : body;

                if (res.timings && res.timingPhases) {
                    Object.keys(res.timingPhases).forEach((key) => {
                        metrics.timing(`ApiCall.${namespace}.Request.${key}`, res.timingPhases[key]);
                    });

                    Object.keys(res.timings).forEach((key) => {
                        metrics.timing(`ApiCall.${namespace}.Request.${key}`, res.timings[key]);
                    });
                }

                // stop timer for request
                Timer.end(`ApiCall.${namespace}.Request.Time`);
                logger.debug(`${namespace} ${size}`);

                beatle.set('rawApiData', { [namespace]: data });
                beatle.set('apiTimings', {
                    [namespace]: {
                        timingPhases: res.timingPhases,
                        timings: res.timings
                    }
                });

                // if status code is between 400 and 511
                if (res && res.statusCode >= 400 && res.statusCode <= 511) {
                    //
                    logger.info(`${namespace} : status code for url ${fullUrl} is ${res.statusCode} -  ${res.statusMessage}`);
                    metrics.increment(`ApiCall.${namespace}.${res.statusCode}`);

                    reject({
                        statusCode: res.statusCode,
                        message: (body ? (body.message || body.error || body) : '')
                    });
                    callback({
                        statusCode: res.statusCode,
                        message: (body ? (body.message || body.error || body) : '')
                    }, null);
                } else {
                    //
                    metrics.increment(`ApiCall.${namespace}.Success`);

                    // if stream is set to true,
                    // return "res"
                    resolve(data);
                    callback(null, data);
                }
            };

            // log start time
            Timer.start(`ApiCall.${namespace}.Request.Time`);

            logger.info(namespace, method, 'called:', fullUrl);
            logger.info(namespace, method, 'Params:', bodyParams || queryParams || {});

            if (stream) {
                const req = request(options);
                req.on('response', (res) => {
                    // callback will return "res" object which allow us
                    // to use steam pipe res.pipe()
                    // body won't be passed
                    handleSuccess(res, null);
                });

                req.on('error', (error) => {
                    handleError(error);
                });
            } else {
                request(options, (error, res, body) => {
                    // handle error
                    if (error || !res) {
                        handleError(error);
                    } else {
                        handleSuccess(res, body);
                    }
                });
            }
        });
    };
};

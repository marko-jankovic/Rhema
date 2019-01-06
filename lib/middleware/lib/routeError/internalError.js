'use strict';

/* eslint no-underscore-dangle: ["error", { "allow": ["_header"] }] */

const Ouch = require('ouch');
const utils = require('@rhema/utils');
const beatle = require('@rhema/beatle');

// Error handler for 50X errors - Always takes 4 arguments
// You must provide four arguments to identify it as an error-handling middleware function.
// Even if you don’t need to use the next object, you must specify it to maintain the signature.
// Otherwise, the next object will be interpreted as regular middleware and will fail to handle errors.
module.exports = (options) => {
    return (err, req, res, next) => {
        req.isError = true;

        if (req.clearTimeout) {
            req.clearTimeout();
        }

        // someone already responded
        // prevent - Error: Can't set headers after they are sent.
        // occurs when res.send or res.end already happend before
        if (res._header || res.headersSent) {
            return req.socket.destroy();
        }

        const ouch = new Ouch();
        // respect status code from other middlewares
        const status = err.status || err.statusCode || 503;
        const errorTemplate = (options && options.errorTemplate) ? options.errorTemplate : false;
        const jsonUrl = req.originalUrl.indexOf('.json') !== -1;
        const isJson = req.isJson() || err.jsonResponse || req.xhr || !errorTemplate || jsonUrl;

        let beatleData = null;

        if (req.query.beatle) {
            // set beatleData at the top of json object
            beatleData = beatle.get(req.query.beatle);
        }

        // General Error increment
        metrics.increment(`Middleware.Error.${status}`);
        // Error increment per Page
        metrics.increment(`Middleware.Error.${req.page}.${status}`);

        logger.error(`${status}: ${utils.string.capitalizeFirst(req.page)} Internal Error at url: ${req.getFullUrl()} - User-Agent: ${req.getUserAgent()} \n${err.stack}`);

        // Set 50x status code
        res.status(status);

        if (isJson) {
            const ouchJson = new Ouch.handlers.JsonResponseHandler(false, true, false);
            const ouchError = ouch.pushHandler(ouchJson);

            ouchError.handleException(err, req, res, (ouchOutput) => {
                // prevent sending header again
                if (!res._header) {
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    const jsonError = JSON.parse(ouchOutput).error;
                    res.json({
                        statusCode: status,
                        error: !utils.env.isProd() ? jsonError : { message: jsonError.message },
                        beatle: beatleData,
                        viewmodel: err.viewmodel || {}
                    });
                }
            });
        } else {
            if (utils.env.isLocal()) {
                const ouchPretty = new Ouch.handlers.PrettyPageHandler('blue', null, 'sublime');
                const ouchError = ouch.pushHandler(ouchPretty);

                ouchError.handleException(err, req, res, (ouchOutput) => {
                    // prevent sending header again
                    if (!res._header) {
                        res.send(ouchOutput);
                    }
                });
            } else {
                // Renders a {errorTemplate} and send the rendered HTML string to the client
                res.render(errorTemplate, { statusCode: status, error: err, viewmodel: err.viewmodel || {} }, (err, html) => {
                    // check if there is Error in error template
                    if (err) {
                        logger.error(`Render error - ${errorTemplate} template: ${err.message}`);
                        res.send('<h1>500 Internal Server Error. Sorry, something went wrong. </h1>');
                    } else {
                        res.send(html);
                    }
                });
            }
        }
    };
};

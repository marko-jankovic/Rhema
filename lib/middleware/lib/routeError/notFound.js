'use strict';

// Page not Found - Handling 404 Error
module.exports = (options) => {
    return (req, res, next) => {
        let isJson = (req.headers['content-type'] === 'application/json' || typeof options.errorTemplate === 'undefined');
        const userAgent = req.getUserAgent();
        const message = `404: Url Not Found! Cannot ${req.method} ${(req.url.pathname || req.url)} - User-Agent: ${userAgent}`;
        const model = {
            url: req.url.pathname,
            statusCode: 404,
            viewmodel: options.viewmodel || {},
            userAgent: userAgent
        };

        logger.error(message);
        metrics.increment('Middleware.Error.404');

        if (!isJson && req.originalUrl && req.originalUrl.indexOf('.json') !== -1) {
            isJson = true;
        }

        res.status(404);

        if (isJson) {
            model.err = message;
            res.send(model);
        } else {
            model.err = new Error(message);
            res.render(options.errorTemplate, model);
        }
    };
};

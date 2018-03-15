'use strict';

const utils = require('../../../utils');

// Mesure Request Time and send to Metrics
module.exports = function (options) {
    return (req, res, next) => {
        const page = req.page || 'unknown';
        const namespace = `Server.Request.${page}.Latency`;

        timer.start(namespace);

        logger.info(`Request to url: ${req.getFullUrl()} - ${utils.string.capitalizeFirst(page)} Route`);

        res.on('finish', () => {
            // set middleware latency to metrics
            if (req.middlewareLatency) {
                const latency = req.middlewareLatency.toFixed(2);

                logger.debug('Total Middlewares latency %s ms', latency);
                metrics.timing(`Middleware.${req.page}.Latency`, latency);
            }

            timer.end(namespace);
            timer.clearAll();
        });

        next();
    };
};
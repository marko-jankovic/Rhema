'use strict';

const utils = require('@rhema/utils');
const Timer = require('@rhema/timer');

// Mesure Request Time and send to Metrics
module.exports = function (options) {
    return (req, res, next) => {
        const page = req.page || 'unknown';
        const namespace = `Server.Request.${page}.Latency`;
        let isJson = req.headers['content-type'] === 'application/json' ? 'JSON' : '';

        Timer.start(namespace);

        logger.info(`${isJson} Request to url: ${req.getFullUrl()} - ${utils.string.capitalizeFirst(page)} Route`);

        res.on('finish', () => {
            // set middleware latency to metrics
            if (req.middlewareLatency) {
                const latency = req.middlewareLatency.toFixed(2);

                logger.debug('Total Middlewares latency %s ms', latency);
                metrics.timing(`Middleware.${req.page}.Latency`, latency);
            }

            Timer.end(namespace);
            Timer.clearAll();
        });

        next();
    };
};

'use strict';

const os = require('os');
const utils = require('../utils');

// Metrics module initiation
const Metrics = function (options) {
    let statsD = null;
    const isActive = utils.env.isActive(options);

    if (options.client && options.client.module) {
        let StatsD = require(options.client.module);
        const hostName = options.osHostName || os.hostname().replace(/\./g, '-');
        const prefix = `${options.namespace}.${process.env.NODE_ENV}.${hostName}.`;

        if (options.client.method) {
            StatsD = StatsD[options.client.method];
        }

        // Setting statsd as prototype of Metrics
        if (options.host && options.port) {
            statsD = new StatsD(options.host, options.port, prefix);

            statsD.socket.on('error', (error) => {
                logger.error('Error in StatsD socket: ', error);
            });
        }
    }
    // Events:
    //  Increment: Increments a stat by a value (default is 1)
    //  Decrement: Decrements a stat by a value (default is -1)
    //  Histogram: send data for histogram stat
    //  Gauge: Gauge a stat by a specified amount
    //  Timing: sends a timing command with the specified milliseconds
    //  Set: Counts unique occurrences of a stat (alias of unique)
    return new Proxy(this, {
        get (target, event) {
            if (isActive && statsD && statsD[event]) {
                // target.namespaces = target.namespaces || [];

                return function (namespace, value) {
                    if (namespace && !value) {
                        statsD[event](namespace, 1);
                    } else {
                        value = parseFloat(value);

                        if (!isNaN(value)) {
                            statsD[event](namespace, value);
                        }
                    }

                    // if (!target.namespaces.includes(namespace)) {
                    //     target.namespaces.push(namespace);
                    // }
                };
            } else {
                // do not do anything if
                // metrics config is not defined
                return function () {};
            }
        }
    });
};

module.exports = Metrics;

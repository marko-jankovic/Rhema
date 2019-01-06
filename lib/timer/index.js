'use strict';

const utils = require('@rhema/utils');
const registry = require('@rhema/registry');
let timings = Symbol('timings');

class Timer {
    // set start time to specific {namespace}
    static start (namespace, uniqueId) {
        const startTime = process.hrtime();
        const requestId = registry.get('requestId') || false;
        // passing uniqueId to avoid namespace conflict
        const uniqueNamespace = this.createNamespace(namespace, uniqueId);
        this[timings] = this[timings] || {};

        if (requestId) {
            if (this[timings][requestId]) {
                this[timings][requestId][uniqueNamespace] = startTime;
            } else {
                // destroy namespace object
                // setting timeout interval only once
                // clear all from namespace after 30sec if timeout is still active
                // ideally {timer.clearAll} should be executed and timeout
                // will be cleared in the same time as namespace
                this[timings][requestId] = {
                    [uniqueNamespace]: startTime,
                    timeout: setTimeout(() => {
                        delete this[timings][requestId];
                    }, 30000)
                };
            }
            //
        } else {
            this[timings][uniqueNamespace] = startTime;
        }

        return startTime;
    }

    // get timer from specific {namespace}
    // send time to metrics namespace
    // clear timings timeout and namespace data
    static end (namespace, uniqueId, level) {
        const requestId = registry.get('requestId') || false;
        const uniqueNamespace = this.createNamespace(namespace, uniqueId);
        let startTime = null;
        let endTime = null;

        if (requestId && this[timings][requestId]) {
            //
            startTime = this[timings][requestId][uniqueNamespace];
            delete this[timings][requestId][uniqueNamespace];
            //
        } else if (this[timings][uniqueNamespace]) {
            //
            startTime = this[timings][uniqueNamespace];
            delete this[timings][uniqueNamespace];
        }

        if (startTime) {
            const hrtime = utils.math.parseHrtime(startTime);

            logger[(level || 'debug')](`${namespace} - timer finished after ${hrtime.timeEnd}`);
            metrics.timing(namespace, hrtime.timeEndRaw);

            endTime = hrtime.timeEndRaw;
        }

        return endTime;
    }

    // clear all namespaces when request is finished
    static clearAll () {
        const requestId = registry.get('requestId') || '';

        if (this[timings][requestId]) {
            // clear timeout
            clearTimeout(this[timings][requestId].timeout);
            // clear timings data for current requestId
            delete this[timings][requestId];
        }
    }

    static createNamespace (namespace, uniqueId) {
        return uniqueId ? `${uniqueId}-${namespace}` : namespace;
    }
}

module.exports = Timer;

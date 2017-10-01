'use strict';

const utils = require('../utils');
const registry = require('../registry');

class Timer {
    constructor () {
        this.timings = {};
    }

    // set start time to specific {namespace}
    start (namespace, uniqueId) {
        const requestId = registry.get('requestId') || false;
        // passing uniqueId to avoid namespace conflict
        let uniqueNamespace = uniqueId ? `${uniqueId}-${namespace}` : namespace;

        if (requestId) {
            // put namespace inside requestId
            uniqueNamespace = `${requestId}.${uniqueNamespace}`;
            // destroy namespace object
            // setting timeout interval only once
            if (!this.timings[requestId]) {
                // clear all from namespace after 30sec if timeout is still active
                // ideally {timer.clearAll} should be executed and timeout
                // will be cleared in the same time as namespace
                const timeout = {
                    [requestId]: {
                        timeout: setTimeout(() => {
                            delete this.timings[requestId];
                        }, 30000)
                    }
                };

                this.timings = utils.object.deepMerge(this.timings, timeout);
            }
        }

        const startTime = process.hrtime();
        const setValue = utils.object.setValue(uniqueNamespace, startTime);
        this.timings = utils.object.deepMerge(this.timings, setValue);

        return startTime;
    }

    // get timer from specific {namespace}
    // send time to metrics namespace
    // clear timings timeout and namespace data
    end (namespace, uniqueId, level) {
        let uniqueNamespace = uniqueId ? `${uniqueId}-${namespace}` : namespace;
        const requestId = registry.get('requestId') || false;

        if (requestId) {
            uniqueNamespace = `${requestId}.${uniqueNamespace}`;
        }

        const startTime = utils.object.getValue(this.timings, uniqueNamespace);

        if (startTime) {
            const hrtime = utils.math.parseHrtime(startTime);

            logger[(level || 'debug')](`${namespace} - timer finished after ${hrtime.timeEnd}`);
            metrics.timing(namespace, hrtime.timeEndRaw);

            return hrtime.timeEndRaw;
        }

        return false;
    }

    // clear all namespaces when request is finished
    clearAll () {
        const requestId = registry.get('requestId') || '';

        if (this.timings[requestId]) {
            // clear timeout
            clearTimeout(this.timings[requestId].timeout);
            // clear timings data for current requestId
            delete this.timings[requestId];
        }
    }
}

module.exports = Timer;

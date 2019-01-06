'use strict';

const async = require('async');
const utils = require('@rhema/utils');
const services = require('@rhema/services');

module.exports = function Pipeline (options) {
    this.execute = (pipelines, params, callback) => {
        const steps = [];

        if (typeof params === 'function') {
            callback = params;
            params = {};
        }

        // Add stepBefore to current pipeline
        // Data object is defined inside current model
        steps.push((next) => next(null, params));

        pipelines.forEach((pipe) => {
            const pipeFunction = this.preparePipe(pipe);

            if (typeof pipeFunction === 'function') {
                steps.push(pipeFunction);
            } else {
                throw new TypeError(`Pipe ${pipe} is not a function!`);
            }
        });

        if (steps.length > 1) {
            async.waterfall(utils.fn.asyncTryCatch(steps, 'Pipeline'), (err, data) => {
                callback(err, data);
            });
        } else {
            callback(new Error('Pipeline or pipes are not defined in config!'));
        }
    };

    // Prepares single pipe and returns function ready to be executed
    this.preparePipe = (pipe) => {
        const services = services.instance();

        // when the object is an array, pipes from that array are to be
        // loaded and executed in parallel as one pipeline step
        if (Array.isArray(pipe)) {
            return this.prepareParallelPipes(pipe);
        } else {
            // create context namespace since async is applying null
            // we need to bind appropriate context
            const ctxNamespace = pipe.split('.').slice(0, 3).join('.');
            // find context
            const ctx = utils.object.getValue(services, ctxNamespace);
            // find service
            const pipeFn = utils.object.getValue(services, pipe);

            // return bounded function
            return pipeFn.bind(ctx);
        }
    };

    // Loads pipes and prepares single pipeline step that will execute them in parallel
    // Each pipe that is to be executed in parallel gets same data - data object passed by
    // previous pipeline step.
    this.prepareParallelPipes = (parallelPipipes) => {
        const pipes = [];

        // load all pipes that are to be executed in parallel
        parallelPipipes.forEach((pipe) => {
            pipes.push(this.preparePipe(pipe));
        });

        // prepare method as single pipeline step and
        // set contexts so pipes can execute
        return (results, next) => {
            const parallel = [];

            pipes.forEach((pipe) => {
                // prepare call
                parallel.push(async.apply(pipe, results));
            });

            async.parallel(parallel, (err) => next(err, results));
        };
    };
};

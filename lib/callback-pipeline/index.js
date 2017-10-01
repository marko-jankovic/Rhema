'use strict';

const async = require('async');
const loadByAppPaths = require('../loader');
const utils = require('../utils');
const DI = require('../di/injector');

class Pipeline {
    constructor (config) {
        this.config = config;
        this.steps = [];
    }

    // Executes pipeline prepared steps
    // Go through pipes and execute it with async waterfall
    execute (name, stepBefore, callback) {
        stepBefore = stepBefore || ((next) => next(null, {}));

        // Add stepBefore to current pipeline
        // Data object is defined inside current model
        this.addStep((data, next) => stepBefore(data, next));

        // if pipeline module is defined
        if (this.config && this.config[name]) {
            this.loadPipelines(this.config[name], name);
        }

        if (this.steps.length > 1) {
            async.waterfall(utils.fn.asyncTryCatch(this.steps, 'Pipeline'), (err, data) => {
                timer.end(`Pipeline.${name}.Timer`);

                callback(err, data);
            });
        } else {
            callback(new Error(`${name} Pipeline or pipes are not defined in config!`));
        }
    }

    // Adding step to steps stack
    addStep (pipe) {
        this.steps.push((data, next) => pipe(data, next));
    }

    // Loads pipelines as defined in pipeline configuration
    // Loads all pipe files for the pipeline and prepares the pipeline to be executed
    // Pipes can be defined as strings (pipe name), arrays (for parallel execution)
    loadPipelines (moduleOptions, name) {
        moduleOptions.pipes.forEach((pipeConfig) => {
            const pipeFunction = this.preparePipe(pipeConfig, moduleOptions.options, name);

            if (typeof pipeFunction === 'function') {
                this.addStep(pipeFunction);
            } else {
                throw new TypeError(`Pipe ${name} is not a function!`);
            }
        });
    }

    // Prepares single pipe and returns function ready to be executed
    preparePipe (pipeConfig, pipeOptions = {}, name) {
        let pipeFunction = null;

        // when the object is an array, pipes from that array are to be
        // loaded and executed in parallel as one pipeline step
        if (Array.isArray(pipeConfig)) {
            pipeFunction = this.prepareParallelPipes(pipeConfig, pipeOptions, name);
        } else {
            const filename = pipeConfig.match(/\//) ? pipeConfig : `${name}/${pipeConfig}`;
            const pipe = loadByAppPaths(filename, this.config.paths);

            // prepare call
            const $di = new DI();
            pipeFunction = $di.inject({
                fn: pipe,
                type: 'pipe',
                namespace: `pipeline.${pipeConfig}`,
                options: pipeOptions
            });
        }

        return pipeFunction;
    }

    // Loads pipes and prepares single pipeline step that will execute them in parallel
    // Each pipe that is to be executed in parallel gets same data - data object passed by
    // previous pipeline step.
    prepareParallelPipes (pipeConfig, pipeOptions, name) {
        const pipes = [];

        // load all pipes that are to be executed in parallel
        pipeConfig.forEach((singlePipeConfig) => {
            pipes.push({
                method: this.preparePipe(singlePipeConfig, pipeOptions, name),
                config: singlePipeConfig
            });
        });

        // prepare method as single pipeline step and
        // set contexts so pipes can execute
        return (results, next) => {
            const parallel = [];

            pipes.forEach((pipe) => {
                // prepare call
                parallel.push(async.apply(pipe.method, results));
            });

            async.parallel(parallel, (err) => next(err, results));
        };
    }
}

module.exports = Pipeline;

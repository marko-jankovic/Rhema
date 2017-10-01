'use strict';

const registry = require('../registry');
const utils = require('../utils');
const tracer = require('tracer');
const stackTrace = require('stack-trace');
const os = require('os');
const loadByAppPaths = require('../loader');

const Logger = function Logger (config) {
    // prepare message format
    config.settings.format = [
        config.settings.formats.default,
        { error: config.settings.formats.error }
    ];

    delete config.settings.formats;

    // tracer method for changing tags format
    this.preprocess = function preprocess (data) {
        data.path = '';
        data.requestId = registry.get('requestId') || '';
        data.namespace = (config.settings.namespace.trim()).replace(/\s+/g, '-').toLowerCase();
        data.hostname = (!utils.env.isLocal()) ? os.hostname() : '';
        data.title = data.title.toUpperCase();
        data.processId = process.pid;

        return data;
    };

    // execute prepared transports
    this.transport = (transports) => {
        const modules = [];
        const sortBy = utils.object.sortByProperty(transports, 'order');

        sortBy.forEach((transport) => {
            if (utils.env.isActive(transport)) {
                const module = loadByAppPaths(transport.path);
                if (module) {
                    modules.push(module.init(transport.options));
                }
            }
        });

        return (data) => {
            modules.forEach((module) => {
                try {
                    module(data);
                } catch (e) {
                    logger.error(e);
                }
            });
        };
    };

    // initialize logger, set tracer options and transports
    this.init = function init () {
        // tracer levels 'log':0, 'trace':1, 'debug':2, 'info':3, 'warn':4, 'error':5
        tracer.setLevel(config.settings.level || 'info');

        const traceLog = tracer[config.settings.strategy || 'console'](Object.assign({
            preprocess: this.preprocess,
            transport: this.transport(config.transports),
            methods: config.settings.methods,
            inspectOpt: utils.env.isLocal() ? (config.inspectOpt || { showHidden: false, depth: null }) : {}
        }, config.settings));

        // attach stack trace
        // we have more information from logger message
        // e.g. "...at Constraints.init (/app/services/gateway/constraints.js:80)"
        const getStackTrace = function getStackTrace (level) {
            let message = '';
            try {
                let callSite = stackTrace.get()[level];
                const callFileName = callSite.getFileName();
                const callFunctionName = callSite.getFunctionName();
                const fileName = callFileName.split('/').slice(-4).join('/');
                const functionName = callFunctionName ? `::${callFunctionName}` : '';

                message = `(/${fileName}:${callSite.getLineNumber()}${functionName})`;
                callSite = null;

                return message;
            } catch (e) {
                return message;
            }
        };

        return new Proxy(this, {
            get (target, name) {
                if (typeof traceLog[name] === 'function') {
                    return function () {
                        const args = utils.array.argsToArray(arguments);
                        args.push(getStackTrace(2));
                        return traceLog[name].apply(null, args);
                    };
                } else {
                    return target[name];
                }
            }
        });
    };

    return this.init();
};

module.exports = Logger;

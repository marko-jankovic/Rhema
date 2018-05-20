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

    // tracer method for changing tags format
    this.preprocess = () => {
        const namespace = (config.settings.namespace.trim()).replace(/\s+/g, '-').toLowerCase();
        const hostname = (!utils.env.isLocal()) ? os.hostname() : '';
        const env = utils.env.get('NODE_ENV');

        return (data) => {
            data.file = getStackTrace(4);
            data.requestId = registry.get('requestId') || '';
            data.processId = process.pid;
            data.title = data.title.toUpperCase();
            data.env = env;
            data.hostname = hostname;
            data.namespace = namespace;
        }
    };

    // execute prepared transports
    this.transport = (modules) => {
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
        const sortTransports = utils.object.sortByProperty(config.transports, 'order');
        const modules = [];

        // tracer levels 'log':0, 'trace':1, 'debug':2, 'info':3, 'warn':4, 'error':5
        tracer.setLevel(config.settings.level || 'info');

        sortTransports.forEach((transport) => {
            if (utils.env.isActive(transport)) {
                if (transport.path) {
                    const module = loadByAppPaths(transport.path);
                    if (module) {
                        modules.push(module(transport.options));
                    }
                } else {
                    throw new Error(`Logger transport must have defined path!`);
                }
            }
        });

        const traceLog = tracer[config.settings.strategy || 'console'](Object.assign({
            preprocess: this.preprocess(),
            transport: this.transport(modules),
            methods: config.settings.methods,
            stackIndex : 0, // get the specified index of stack as file information. It is userful for development package.
            inspectOpt: utils.env.isLocal() ? (config.inspectOpt || {
                showHidden: false, // if true then the object's non-enumerable properties will be shown too. Defaults to false
                depth: null // tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
            }) : {}
        }, config.settings));

        return new Proxy(this, {
            get(target, name) {
                if (typeof traceLog[name] === 'function') {
                    return traceLog[name];
                } else {
                    return target[name];
                }
            }
        });
    };

    return this.init();
};

module.exports = Logger;

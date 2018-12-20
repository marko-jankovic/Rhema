'use strict';

const _ = require('lodash');
const utils = require('../utils');
const Timer = require('../timer');

module.exports = function Latency (config) {
    // pipe wrapper
    this.pipe = function pipe (fn) {
        const wrapper = fn;
        const name = wrapper.name || '<anonimus>';

        if (!utils.env.isActive(config)) {
            return fn;
        }

        // dynamic setting pipe name
        return (data, next) => {
            const timerNamespace = `Latency.Pipe.${name}.Time`;

            Timer.start(timerNamespace);

            wrapper(data, (err, newData) => {
                // send times to metrics
                Timer.end(timerNamespace, null, 'debug');

                next(err, newData);
            });
        };
    };

    // middleware wrapper
    this.middleware = function middleware (fn, name) {
        const handlerWrapper = fn;
        const fnName = fn.name || name || '<anonimus>';

        if (!utils.env.isActive(config)) {
            return fn;
        }

        const nextWrapper = function nextWrapper (req, res, next, error) {
            const timerNamespace = `Latency.Middleware.${fnName}.Time`;
            req.middlewareLatency = req.middlewareLatency || 0;

            Timer.start(timerNamespace);

            const callback = function midlewareCallback (err) {
                const duration = Timer.end(timerNamespace, null, 'debug');
                // concat current time to req.middlewareLatency
                // so we can print total middlware latency at the end

                if (duration) {
                    req.middlewareLatency += parseFloat(duration);
                }

                next(err);
            };

            if (error) {
                // error middleware expected error as the first argument
                handlerWrapper.call(null, error, req, res, callback);
            } else {
                handlerWrapper.call(null, req, res, callback);
            }
        };

        // handle error middleware
        // which accepts 4 arguments
        if (fn.length === 4) {
            // dynamic setting fn name
            return (error, req, res, next) => {
                // pass error as last argument
                // so we don't have to handle error position
                // for normal non-errorr middlewares
                nextWrapper(req, res, next, error);
            };
        } else {
            return (req, res, next) => {
                nextWrapper(req, res, next, null);
            };
        }
    };

    // services wrapper
    this.services = function services (service, namespace, name, ctx) {
        let wrapperName = [];
        const wrapper = service;
        const indexOf = name ? config.ignore.includes(name) : false;

        if (!utils.env.isActive(config) || indexOf) {
            return service;
        }

        // create namespace
        if (namespace) {
            wrapperName.push(namespace);

            if (name) {
                wrapperName.push(name);
            }

            // check for default Function.name
            if (wrapper.name) {
                wrapperName.push(wrapper.name);
            }

            // prepare unique namespace string
            wrapperName = _.uniq(wrapperName);
            wrapperName = wrapperName.join('.');
        }

        // dynamic setting service name
        return function () {
            const randomInt = utils.math.getRandomInteger();
            const timerNamespace = `Latency.Service.${wrapperName}.Time`;

            Timer.start(timerNamespace, randomInt);
            const args = utils.array.argsToArray(arguments);

            // check for function in arguments
            // usually callback
            const hasFunction = args.filter((arg) => {
                if (typeof arg === 'function') {
                    return arg;
                }
            });

            // simply function without callback
            // execute function, stop timer and return data
            if (_.isEmpty(hasFunction)) {
                Timer.end(timerNamespace, randomInt, 'debug');
                const data = wrapper.apply(ctx || null, arguments);

                return data;
            } else {
                // if last argument is function <=> callback
                // wrap callback and after stopping timer
                // let callback execute toward
                if (_.isFunction(_.last(args))) {
                    const fn = args.pop();
                    const wrapperCallBack = function (err, data) {
                        Timer.end(timerNamespace, randomInt, 'debug');

                        fn(err, data);
                    };

                    args.push(wrapperCallBack);
                }

                wrapper.apply(ctx, args);
            }
        };
    };
};

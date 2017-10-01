'use strict';

const utils = require('../utils');
const async = require('async');
const DI = require('../di/injector');
const Latency = require('../latency');
const loadByAppPaths = require('../loader');
let instance = null;

// private properties
const initStack = Symbol('initStack');
const servicesStack = new Map();

class Services {
    constructor (config) {
        this[initStack] = {};
        this.config = config;
        this.servicesConfig = utils.object.deepFreeze(config.app.services, true);

        return this.proxify();
    }

    proxify () {
        // Proxy for magic method getter
        return new Proxy(this, {
            // arrow function for keeping context
            get: (target, name) => {
                let service = false;
                // allow getting all services with '$services' argument
                const services = (name === 'services') ? servicesStack : false;

                // looking for services..
                if (typeof name === 'string') {
                    // name could be with dolar notation '$helpers'
                    // or simple service name 'helpers', used by injector
                    const namespace = name.replace('$', '');

                    if (servicesStack.has(namespace)) {
                        service = servicesStack.get(namespace);
                    }
                }

                // return service or Service property
                return target[name] || service || services;
            }
        });
    }

    // exec {initialize} methods
    execInit (initStack, callback) {
        if (utils.env.isActive(this.initConfig)) {
            async[this.initConfig.strategy || 'series'](utils.fn.asyncTryCatch(initStack, 'Init Services'), callback);
        } else {
            // init services are disabled
            callback(null, {});
        }
    }

    // execute initial services
    attach () {
        const $di = new DI(this);
        const latency = new Latency(this.config.framework.latency);

        // create namespace to servicesStack
        // so we have it prepared for $di injector
        Object.keys(this.servicesConfig).forEach((namespace) => {
            if (!servicesStack.has(namespace)) {
                servicesStack.set(namespace, {});
            }
        });

        // build service
        Object.keys(this.servicesConfig).forEach((namespace) => {
            Object.keys(this.servicesConfig[namespace]).forEach((name) => {
                // service options
                const serviceConfig = this.servicesConfig[namespace][name];

                // path is mandatory
                if (!serviceConfig.path) {
                    throw new Error(`Service "${namespace}.${name}" must have defined "path" in services config!`);
                }

                // attach only active services
                if (utils.env.isActive(serviceConfig)) {
                    // require service
                    const Module = loadByAppPaths(serviceConfig.path);
                    // specific method as service
                    const method = serviceConfig.method;
                    const diOptions = {
                        fn: Module,
                        type: 'services',
                        namespace: `${namespace}.${name}`,
                        options: serviceConfig.options
                    };

                    // module.export return object, not constructor function
                    if (typeof Module !== 'function') {
                        if (method && typeof Module[method] === 'function') {
                            // module method
                            diOptions.fn = Module[method];
                        } else {
                            throw new Error(`
                                Service ${namespace}.${name}.${method} is not function! 
                                Method "${method}" does not exists or service module.exports is not defined!
                            `);
                        }
                    }

                    let service = $di.inject(diOptions);

                    // wrapp with latency module
                    if (typeof service === 'function') {
                        service = latency.services(service, namespace, name);
                        //
                    } else if (Object.keys(service).length) {
                        // wrapp each method with latency
                        Object.getOwnPropertyNames(service).forEach((method) => {
                            if (typeof service[method] === 'function') {
                                service[method] = latency.services(service[method], namespace, name, service);
                            }
                        });
                    }

                    if (!servicesStack.get(namespace)[name]) {
                        servicesStack.get(namespace)[name] = service;
                    }

                    // set initialize stack
                    // {initialize} method is MANDATORY for "init" services
                    if (service.initialize) {
                        this[initStack][name] = this.setInitialize(service, name, serviceConfig);
                    }
                }
            });
        });
    }

    use (name = 'default.value') {
        const namespace = name.replace('$', '');
        const services = namespace === 'services' ? servicesStack : false;

        // all services
        if (services) {
            return services;
            //
        } else if (servicesStack.has(namespace)) {
            // return specific service
            return servicesStack.get(name);
            //
        } else {
            throw new Error(`Service "${name}" does not exists!`);
        }
    }

    run (callback) {
        //
        this.attach();

        if (Object.keys(this[initStack]).length) {
            const init = utils.fn.asyncTryCatch(this[initStack], 'Init Services');
            // execute initial services
            async.series(init, callback);
        } else {
            callback(null);
        }
    }

    setInitialize (service, name, config) {
        // set to initStack
        // apply {service} context to {initialize} method
        const initialize = Function.prototype.bind.apply(service.initialize, [service]);

        // set refresh interval for services that has {refreshTime}
        if (config.refreshTime) {
            // execute init service after every options.refreshTime
            const initInterval = setInterval(() => {
                logger.info('%s Service - Auto Refresh Cache Started...', name);

                if (initialize) {
                    this.execInit([initialize], (err) => {
                        if (!err) {
                            logger.info('%s Service - Auto Refresh Cache Finished!', name);
                        }
                    });
                } else {
                    clearInterval(initInterval);
                }
            }, config.refreshTime);
        }

        return initialize;
    }
}

module.exports = {
    instance: () => instance,
    create: config => instance = new Services(config),
    use: (namespace = '') => {
        if (!instance) {
            instance = this.create();
        }

        return instance.use(namespace);
    }
};

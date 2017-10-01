'use strict';

// https://github.com/ash-framework/core/blob/master/src/classes/inject.js
const utils = require('../utils/index');
const servicesInstance = new Map();

class Di {
    constructor (Services) {
        if (Services) {
            // in-memory cache for Services instance
            // set once from Services.attach
            servicesInstance.set('instance', Services);
        }
    }

    // inject services as Module arguments
    inject (config) {
        let bindArgs = [];

        // Module must be a function
        if (typeof config.fn !== 'function') {
            // throw error
            throw new TypeError(`DI - ${config.namespace} is not function!`);
        }

        // set null as first argument to apply
        if (Array.isArray(config.options)) {
            const options = config.options.filter(Boolean).length ? config.options : [{}];
            // middlewares are passing options as array of arguments
            bindArgs = [null, ...options];
        } else {
            bindArgs = [null, config.options || {}];
        }

        // Get fn arguments
        // Check if {function} is annotated and use given service as parameter
        let functionArgs = this.getFunctionArgs(config.fn);

        // $di annotation is detected
        // and service is attached
        if (functionArgs.length) {
            bindArgs = bindArgs.concat(functionArgs);
        }

        // wrapp services that are using arrow functions
        if (!config.fn.prototype) {
            // save original
            const fn = config.fn;
            // create constructor wrapper
            config.fn = function (...args) {
                return fn.apply(config.ctx || null, args);
            };
        }

        // Function.prototype.bind.apply - applying services and options to each module
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
        // bind expect a function so first param must be {function}
        // second param are arguments that we want to apply to that {function}
        // {function} is expected to be constructor
        return new (Function.prototype.bind.apply(config.fn, bindArgs));
    }

    // read function arguments
    // if argument has dollar "$" notation
    // get injected service and set it's reference to diStack
    getFunctionArgs (module) {
        const diStack = [];
        // get all function arguments for current module
        const args = utils.fn.getArgs(module);

        // if arg has dollar notation
        // if service exists push it to stack
        args.forEach((arg) => {
            let diName = arg;
            let diService = null;
            const services = servicesInstance.get('instance');

            // detect dollar notation
            // e.g $formatter
            if (diName.includes('$')) {
                diName = diName.replace('$', '');
                // detect services that has default param
                // e.g $seo = 'helpers.seo'
                if (diName.includes('=')) {
                    // replace default arg definition e.g. $seo = 'helpers.seo'
                    // extract default value 'helpers.seo'
                    diName = diName.replace(/['\/]/g, '').match(/=(.*)$/)[1];
                    // check if there is dot notation
                    const dotName = diName.includes('.') ? diName.split('.') : diName;

                    diService = services[dotName[0]];

                    // 2 level find
                    // e.g 'helpers.seo' in services
                    if (diService && diService[dotName[1]]) {
                        diService = diService[dotName[1]];

                        // max depth 3 level find
                        // e.g 'helpers.seo.getDescription' in services
                        if (diService && dotName[2]) {
                            diService = diService[dotName[2]];
                        }
                    } else {
                        diService = services[dotName];
                    }
                } else {
                    diService = services[diName];
                }

                if (diService) {
                    diStack.push(diService);
                } else {
                    throw new Error(`Service "${diName}" does not exists!`);
                }
            }
        });

        return diStack;
    }
}

module.exports = Di;

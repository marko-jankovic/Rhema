'use strict';

const strUtils = require('./string');
const arrUtils = require('./array');
const objUtils = require('./object');

module.exports = {
    // function myCustomFn(arg1, arg2,arg3) {}
    // getArgs(myCustomFn); // ['arg1', 'arg2', 'arg3']
    getArgs (fn) {
        // Ensure no inline comments are parsed
        const reComments = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

        // First part match matche parens-less arrow functions
        // Second part matches the rest
        const reFnArgs = /^(?:async)?([^=()]+)=|\(([^)]+)\)/;

        const match = reFnArgs.exec(fn.toString().replace(reComments, ''));

        // Split the arguments string into an array comma delimited and trim space
        const args = match ? strUtils.removeWhiteSpace(match[1] || match[2]).split(',') : [];

        // Ensure no undefined are added
        return args.filter(Boolean);
    },

    getFnName (fn) {
        if (fn.name) {
            return fn.name;
        }

        return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
    },

    setFnName (fn, name) {
        return Object.defineProperty(fn, 'name', { value: name });
    },

    // Common use case
    //  function f(x, y, z) {}
    //  var args = [1, 2, 3];
    //  f.apply(null, args);
    //
    // spread(function(x, y, z) {})([1, 2, 3]);
    spread (callback) {
        return arr => callback(...arr);
    },

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    debounce (func, wait, immediate) {
        let timeout;
        return function (...args) {
            const that = this;

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                timeout = null;

                if (!immediate) {
                    func.apply(that, ...args);
                }
            }, wait);

            if (immediate && !timeout) {
                func.apply(this, args);
            }
        };
    },

    asyncTryCatch (fnStack, namespace) {
        const tryCatchStack = objUtils.isObject(fnStack) ? {} : [];
        const fnWrapper = (fn) => {
            return function () {
                let isFinished = false;
                // transform arguments
                const args = arrUtils.argsToArray(arguments);
                // last element is always callback
                const next = args.pop();

                // return proper error if callback is not set
                const timeout = setTimeout(() => {
                    if (!isFinished) {
                        next(new Error(`${namespace || ''} Async timeout!`));
                        logger.warn('There is no defined Async callback or your action takes too long.');
                    }
                }, 28000); // set to 28sec since request timeout is 30sec

                // wrapper just for setting isFinished flag
                const nextWrapper = function () {
                    isFinished = true;
                    clearTimeout(timeout);
                    next(...arguments);
                };

                try {
                    // ugly destructing but necessary
                    // it could be only callback as arguments
                    fn(...[...args, nextWrapper]);
                } catch (err) {
                    isFinished = true;
                    clearTimeout(timeout);
                    next(err);
                }
            };
        };

        if (objUtils.isObject(fnStack)) {
            Object.keys(fnStack).forEach((fn) => {
                if (typeof fnStack[fn] === 'function') {
                    tryCatchStack[fn] = fnWrapper(fnStack[fn]);
                }
            });
        } else {
            // convert to array, case if there is only one function
            fnStack = !Array.isArray(fnStack) ? [fnStack] : fnStack;

            fnStack.forEach((fn) => {
                if (typeof fn === 'function') {
                    tryCatchStack.push(fnWrapper(fn));
                }
            });
        }

        return tryCatchStack;
    },

    // Promise wrapper which handle success and error states
    ensureAsync (promise) {
        return promise
                .then(res => ({ err: null, res }))
                .catch(err => Promise.resolve({ err, res: null }));
    },

    once (fn) {
        let called = false;
        let value = null;

        return (...args) => {
            if (!called) {
                called = true;
                return (value = fn(...args));
            }

            return value;
        };
    },

    isPromise (obj) {
        return objUtils.isObject(obj) && typeof obj.then === 'function';
    }
};


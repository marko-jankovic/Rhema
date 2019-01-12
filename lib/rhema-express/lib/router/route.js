'use strict';

/**
 * Module dependencies.
 * @private
 */

const debug = require('debug')('express:router:route');
const flatten = require('array-flatten');
const Layer = require('./layer');
const methods = require('methods');

/**
 * Module variables.
 * @private
 */

const slice = Array.prototype.slice;
const toString = Object.prototype.toString;

/**
 * Module exports.
 * @public
 */

module.exports = Route;

/**
 * Initialize `Route` with the given `path`,
 *
 * @param {String} path
 * @public
 */

function Route (path) {
    this.path = path;
    this.stack = [];

    debug('new %o', path);

    // route handlers for various http methods
    this.methods = {};
}

/**
 * Determine if the route handles a given method.
 * @private
 */

Route.prototype._handles_method = function _handles_method (method) {
    if (this.methods._all) {
        return true;
    }

    let name = method.toLowerCase();

    if (name === 'head' && !this.methods.head) {
        name = 'get';
    }

    return Boolean(this.methods[name]);
};

/**
 * @return {Array} supported HTTP methods
 * @private
 */

Route.prototype._options = function _options () {
    const methods = Object.keys(this.methods);

    // append automatic head
    if (this.methods.get && !this.methods.head) {
        methods.push('head');
    }

    for (let i = 0; i < methods.length; i++) {
    // make upper case
        methods[i] = methods[i].toUpperCase();
    }

    return methods;
};

/**
 * dispatch req, res into this route
 * @private
 */

Route.prototype.dispatch = function dispatch (req, res, done) {
    let idx = 0;
    const stack = this.stack;
    if (stack.length === 0) {
        return done();
    }

    let method = req.method.toLowerCase();
    if (method === 'head' && !this.methods.head) {
        method = 'get';
    }

    req.route = this;

    next();

    function next (err) {
    // signal to exit route
        if (err && err === 'route') {
            return done();
        }

        // signal to exit router
        if (err && err === 'router') {
            return done(err);
        }

        const layer = stack[idx++];
        if (!layer) {
            return done(err);
        }

        if (layer.method && layer.method !== method) {
            return next(err);
        }

        if (err) {
            layer.handle_error(err, req, res, next);
        } else {
            layer.handle_request(req, res, next);
        }
    }
};

/**
 * Add a handler for all HTTP verbs to this route.
 *
 * Behaves just like middleware and can respond or call `next`
 * to continue processing.
 *
 * You can use multiple `.all` call to add multiple handlers.
 *
 *   function check_something(req, res, next){
 *     next();
 *   };
 *
 *   function validate_user(req, res, next){
 *     next();
 *   };
 *
 *   route
 *   .all(validate_user)
 *   .all(check_something)
 *   .get(function(req, res, next){
 *     res.send('hello world');
 *   });
 *
 * @param {function} handler
 * @return {Route} for chaining
 * @api public
 */

Route.prototype.all = function all () {
    const handles = flatten(slice.call(arguments));

    for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];

        if (typeof handle !== 'function') {
            const type = toString.call(handle);
            const msg = `Route.all() requires a callback function but got a ${type}`;
            throw new TypeError(msg);
        }

        const layer = Layer('/', {}, handle);
        layer.method = undefined;

        this.methods._all = true;
        this.stack.push(layer);
    }

    return this;
};

methods.forEach((method) => {
    Route.prototype[method] = function () {
        const handles = flatten(slice.call(arguments));

        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];

            if (typeof handle !== 'function') {
                const type = toString.call(handle);
                const msg = `Route.${method}() requires a callback function but got a ${type}`;
                throw new Error(msg);
            }

            debug('%s %o', method, this.path);

            const layer = Layer('/', {}, handle);
            layer.method = method;

            this.methods[method] = true;
            this.stack.push(layer);
        }

        return this;
    };
});

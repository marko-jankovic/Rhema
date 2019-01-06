'use strict';

const path = require('path');
const utils = require('@rhema/utils');
const loadByAppPaths = require('@rhema/loader');
const Latency = require('@rhema/latency');
const DI = require('@rhema/di');

class Middleware {
    constructor (config) {
        this.config = config;
        this.$di = new DI();
        this.latency = new Latency(config.framework.latency);
    }

    use (type) {
        let middlewaresStack = [];

        if (this.config.app.middlewares[type]) {
            // sort by "order" key
            const sortBy = utils.object.sortByProperty(this.config.app.middlewares[type], 'order');

            sortBy.forEach((middlewareConfig) => {
                const middlewares = this.middlewareFromConfig(middlewareConfig, Object.keys(this.config.app.router.routes));

                if (middlewares) {
                    // one by one middleware
                    if (typeof middlewares === 'function') {
                        middlewaresStack.push(middlewares);
                    } else {
                        // concat array of middleware functions with middlewaresStack
                        middlewaresStack = middlewaresStack.concat(middlewares);
                    }
                }
            });
        }

        if (middlewaresStack.length) {
            return middlewaresStack;
        } else {
            // app.use/router.use requires middleware functions
            // if config is empty or all middlewares are disabled
            // return empty middleware.
            return [(req, res, next) => next()];
        }
    }

    // get middleware based on config
    middlewareFromConfig (middlewareConfig, routes) {
        // only one middleware
        if (middlewareConfig.path && utils.env.isActive(middlewareConfig)) {
            // route middleware
            if (middlewareConfig.routes) {
                return this.routeHandler(middlewareConfig, routes);
            } else {
                return this.latency.middleware(
                    this.singleHandler(middlewareConfig),
                    path.basename(middlewareConfig.path)
                );
            }
        } else {
            return false;
        }
    }

    // load middleware and prepare route paths
    // paths define where will middleware be included
    routeHandler (middlewareConfig, routes) {
        // asterisk means all routes
        if (middlewareConfig.routes.includes('*')) {
            middlewareConfig.routes = routes;
        } else {
            const excludedPaths = [];

            // try to find
            middlewareConfig.routes.forEach((p) => {
                // excluded paths
                if (p.indexOf('!') !== -1) {
                    excludedPaths.push(p.replace('!', ''));
                }
            });

            if (excludedPaths.length !== 0) {
                middlewareConfig.routes = routes.filter(r => excludedPaths.indexOf(r) === -1);
            }
        }

        let args = Array.isArray(middlewareConfig.options) ? middlewareConfig.options : [middlewareConfig.options];

        if (middlewareConfig.protectArguments !== false) {
            args = utils.object.deepFreeze(args, true);
        }

        // require module by path - from lib or node_modules
        const middleware = loadByAppPaths(middlewareConfig.path);
        // if method is specified
        const methodDefined = middlewareConfig.method && middlewareConfig.method.length !== 0;

        return {
            handler: methodDefined ? middleware[middlewareConfig.method] : middleware,
            path: middlewareConfig.path,
            args,
            routes: middlewareConfig.routes
        };
    }

    // create single handler
    singleHandler (middlewareConfig) {
        // require module by path - from lib or node_modules
        const middleware = loadByAppPaths(middlewareConfig.path);
        let args = Array.isArray(middlewareConfig.options) ? [...middlewareConfig.options] : [middlewareConfig.options || {}];

        if (middlewareConfig.protectArguments !== false) {
            args = utils.object.deepFreeze(args, true);
        }

        // if method is specified
        if (middlewareConfig.method && middlewareConfig.method.length !== 0) {
            // apply arguments
            if (args) {
                return middleware[middlewareConfig.method].apply(null, args);
            } else {
                // arguments are not specified
                return middleware[middlewareConfig.method];
            }
        } else {
            // just pass arguments
            return this.$di.inject({
                fn: middleware,
                type: 'middleware',
                namespace: `middleware.${path.basename(middlewareConfig.path, '.js')}`,
                options: args.length === 0 ? [{}] : args
            });
        }
    }

    // prepare route invoked middlewares
    // method returns two object with "fn" and "routes"
    // which has relation through middleware indexes and allows as
    // easier and fast mapping from dispather
    routeInvoked () {
        const middlewaresMap = {
            routes: {},
            fn: {}
        };

        this.use('routeInvoked').forEach((routesMiddleware, middlewareKey) => {
            if (routesMiddleware && routesMiddleware.handler && routesMiddleware.args) {
                const middlewareName = path.basename(routesMiddleware.path, '.js');

                middlewaresMap.fn[middlewareKey] = this.latency.middleware(
                    this.$di.inject({
                        fn: routesMiddleware.handler,
                        type: 'middleware',
                        namespace: `routeInvoked.${middlewareName}`,
                        // ensure arguments order is the same
                        // if there is not arguments
                        // middleware options will be empty
                        options: !routesMiddleware.args.length ? [{}] : routesMiddleware.args
                    }),
                    middlewareName
                );

                routesMiddleware.routes.forEach((handlerName) => {
                    if (!middlewaresMap.routes[handlerName]) {
                        middlewaresMap.routes[handlerName] = [];
                    }

                    middlewaresMap.routes[handlerName].push(middlewareKey);
                });
            }
        });

        return middlewaresMap;
    }
}

module.exports = Middleware;

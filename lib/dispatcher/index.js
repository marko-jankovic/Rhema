'use strict';

const _ = require('lodash');
const utils = require('../utils');
const Combinatorics = require('js-combinatorics');
const urlGenerator = require('../formatUrl');
const pageType = require('../middleware/lib/core/pageType');
const reqData = require('../middleware/lib/core/reqData');
const removeParamPrefix = require('../middleware/lib/core/removeParamPrefix');
const removeParamsPrefixes = require('../middleware/lib/core/removeParamsPrefixes');
const requestTimeout = require('../middleware/lib/core/requestTimeout');

class RouteDispatcher {
    constructor (config) {
        this.config = _.clone(config, true);
    }

    // format route.path
    pathFormater (routePath, routeName) {
        // support {paramName} in config
        // replace with express :paramName
        if (routePath.indexOf('{') !== -1 && routePath.indexOf('}') !== -1) {
            routePath = routePath.replace(/\{([^}]+)}/g, ':$1');
        }

        if (routeName) {
            const paramPrefix = `:${routeName.replace('-', '_')}_`;
            // injected prefix to ensure unique params
            routePath = routePath.replace(/:/g, paramPrefix);
        }

        return routePath;
    }

    // extract params from route.path
    pathExtractor (path) {
        const parts = path.split('/');
        const params = [];
        const prefix = [];

        parts.forEach((part) => {
            if (part.indexOf(':') !== -1) {
                params.push(part.replace(/:/g, ''));
            } else {
                prefix.push(part);
            }
        });

        return {
            params,
            prefix
        };
    }

    // preparing rearrange paths
    rearrangePaths (route, path) {
        let perPaths = [];
        const routePath = path || route.path;
        const extracted = this.pathExtractor(routePath);
        const rearrangeParams = route.rearrangeParams;
        // if rearrangeParams is true, empty array or has only one element
        const rearrangeAll = rearrangeParams.length >= 2 ? false : true;
        const prefixPath = extracted.prefix.join('/');
        const paths = [];
        const fixed = [];

        if (!rearrangeAll) {
            perPaths = extracted.params.filter((param) => {
                if (rearrangeParams.indexOf(param) !== -1) {
                    return param;
                } else {
                    // prepare object with index and name
                    // values that are not in rearrangeParams
                    // will always be at the same place in path
                    fixed.push({
                        name: param,
                        index: extracted.params.indexOf(param)
                    });
                }
            });

            if (perPaths.length) {
                Combinatorics.permutation(perPaths, perPaths.length, (perPath) => {
                    fixed.forEach((el) => {
                        // insert elements to array at specific index
                        perPath.splice(el.index, 0, el.name);
                    });

                    // create full path
                    const fullPath = `${prefixPath}/:${perPath.join('/:')}`;

                    // add all paths that are not originPath
                    if (fullPath !== routePath) {
                        paths.push(fullPath);
                    }
                });
            }
        } else {
            Combinatorics.permutation(extracted.params, extracted.params.length, (perPath) => {
                const fullPath = `${prefixPath}/:${perPath.join('/:')}`;

                if (fullPath !== routePath) {
                    paths.push(fullPath);
                }
            });
        }

        return paths;
    }

    // create all combination of route paths by Permutation => Combination method
    // if dependencies object is defined, remove routes that don't fit config requirement
    permutationCombinationPaths (route, path) {
        const routePath = path || route.path;
        const extracted = this.pathExtractor(routePath);
        const paths = [];

        if (extracted.params.length) {
            const combinationMethod = route.paramsCombination.method;
            // allowed methods
            const allowed = ['power', 'combination', 'permutation', 'permutationCombination'];
            const method = (combinationMethod && allowed.includes(combinationMethod)) ? combinationMethod : 'power';

            Combinatorics[method](extracted.params, (perPath) => {
                if (perPath.length) {
                    paths.push(`${extracted.prefix.join('/')}/:${perPath.join('/:')}`);
                } else {
                    paths.push(extracted.prefix.join('/') || '/');
                }
            });
        }

        // "dependencies": {"srpModel": "srpMake"} means srpModel depends on srpMake
        // and if there is srpModel path without srpMake it will be ignored
        // e.g. for path /cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?
        // will exclude paths:
        //  - /cars/:SRPmodel
        //  - /cars/:SRPmodel/:SRPlocation
        //  - /cars/:SRPmodel/:SRPtype
        //  - /cars/:SRPtype/:SRPmodel
        //  - /cars/:SRPmodel/:SRPlocation/:SRPtype and any other path that does not has "srpModel"
        // "dependencies": {
        //     "SRPmodel": "SRPmake",
        //     "SRPlocation": "SRPmake"
        // }
        for (let i = paths.length - 1; i >= 0; i--) {
            _.each(route.paramsCombination.dependencies, (depParam, depKey) => {
                // perPath array has depKey (SRPmodel) and doesn't have depParam (SRPmake)
                if (paths[i].indexOf(depKey) !== -1 && paths[i].indexOf(depParam) === -1) {
                    paths.splice(i, 1);
                }
            });
        }

        return paths;
    }

    // all rearrange paths will be redirected to "main path"
    setRearrangeHandler (router, route, method, path) {
        const rearrangePaths = this.rearrangePaths(route, path);
        rearrangePaths.forEach((rearrangePath) => {
            const routeMethod = (method || (route.method || 'get')).toLowerCase();

            // redirect all rearrangePath to routePath
            router[routeMethod](rearrangePath, (req, res, next) => {
                _.each(req.params, (value, key) => {
                    // optional params will be empty/undefined
                    if (!value) {
                        delete req.params[key];
                    }
                });

                res.redirect(301, urlGenerator(this.config.routes)(route.pageType, req.params));
            });
        });
    }

    // validate query params
    // queryRegexParams is "query" object defined in router config for specific route
    // { "price": "(^[-0-9]{5}$)", "bedrooms": "(.+)", "bathrooms": "(.+)" }
    validateQuery (queryRegexParams) {
        // queryParams is req query object
        // { price: "1-222", bedrooms: "4-max", bathrooms: "3-max" }
        return (queryParams) => {
            // return true if every query is valid
            return Object.keys(queryRegexParams).every((queryName) => {
                //
                let regex = queryRegexParams[queryName];

                if (!(regex instanceof RegExp)) {
                    regex = new RegExp(regex);
                }

                const test = regex.test(queryParams[queryName]);

                // throw TypeError only in dev env
                if (utils.env.isDev() && !test) {
                    throw new TypeError(`Query param "${queryName}" is not valid. Expect "${queryParams[queryName]}" to pass "${regex}" regular expression!`);
                }

                return test;
            });
        }
    }

    // validation for each route param during request
    // setting valid params to req.params
    setRouteParamsValidator (router, routeName, paramName, regex, queryValidator) {
        // injected prefix to ensure unique params
        const paramPrefix = `${routeName.replace('-', '_')}_`;
        // convert paramRegex string to RegExp object
        if (!(regex instanceof RegExp)) {
            regex = new RegExp(regex);
        }

        // "param" is Express Router method
        router.param(paramPrefix + paramName, (req, res, next, paramValue) => {

            if (regex.test(paramValue)) {
                // only last param will have validator
                // in order to validate query params only once
                if (queryValidator && typeof queryValidator === 'function') {
                    const validateQuery = queryValidator(req.query);

                    // if route is not valid it will redirect to NotFound middleware
                    next(validateQuery ? null : 'route');
                } else {
                    next();
                }
            } else {
                if (utils.env.isDev()) {
                    throw new TypeError(`Param "${paramName}" is not valid. Expect "${paramValue}" to pass "${regex}" regular expression!`);
                }

                // 'route' is Router reserved word
                // it indicates that route is not found
                next('route');
            }
        });
    }

    // prepare route options, method and path
    // chech if method is valid, and if not set to 'get'
    prepareRouteOptions (route, method, path) {
        // Express supports the following routing methods
        // corresponding to the HTTP methods of the same names
        const allowedMethods = [
            'checkout', 'copy', 'delete', 'get', 'head', 'lock', 'merge', 'mkactivity',
            'mkcol', 'move', 'm-search', 'notify', 'options', 'patch', 'post', 'purge',
            'put', 'report', 'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'
        ];
        let routeMethod = (method || (route.method || 'get')).toLowerCase();
        let routePath = path || route.path;

        // if method is not valid
        if (!allowedMethods.includes(routeMethod)) {
            routeMethod = 'get';
        }

        // attach "format" param to path
        // we can add format/extension at the end of url
        // e.g. /cars/Acura-CL.json
        // and in combination with "formats" middleware
        // we can set propper content type and have
        // json response instead of rendering html
        if (Array.isArray(this.config.settings.formats) && routeMethod === 'get') {
            routePath = `${routePath}.:format(${this.config.settings.formats.join('|')})?`;
        }

        return {
            method: routeMethod,
            path: routePath
        };
    }

    // prepare route config
    // format path, set action and handler name
    prepareRouterConfig (routes, callback) {
        _.each(routes, (route, routeName) => {
            route.handler = route.handler || routeName;
            route.pageType = routeName;
            route.originalPath = route.path;
            route.path = this.pathFormater(route.path, routeName);
            route.action = false;

            if (route.handler.indexOf(':') !== -1) {
                const handlerAction = route.handler.split(':');
                route.action = utils.string.lowercaseFirst(handlerAction[1]);
                route.handler = utils.string.lowercaseFirst(handlerAction[0]);
            } else {
                route.handler = route.handler;
            }

            callback(route, routeName);
        });
    }

    setRoutes (router, routeInvoked, controllerResolver) {
        const setHandler = (route, method, path) => {
            const routeMethod = (method || (route.method || 'get')).toLowerCase();
            const routeOptions = this.prepareRouteOptions(route, routeMethod, path);
            const paramPrefix = `${route.routeName.replace('-', '_')}_`;
            const middlewares = [];

            middlewares.push(reqData());
            middlewares.push(pageType(route.pageType));
            middlewares.push(requestTimeout(route.timeout));

            // removeParamPrefix should remove injected prefix
            // that is added in order to ensure unique params
            if (route.params) {
                middlewares.push(removeParamPrefix(route.params, paramPrefix));
            }

            if (route.paramsPrefixes) {
                middlewares.push(removeParamsPrefixes(route.params));
            }

            if (routeInvoked.routes && routeInvoked.routes[route.pageType]) {
                _.each(routeInvoked.routes[route.pageType], (id) => {
                    middlewares.push(routeInvoked.fn[id]);
                });
            }

            // this is important for testing
            // @TODO figure out how to avoid this
            if (!controllerResolver) {
                router[routeMethod](
                    routeOptions.path, // regex route path
                    middlewares // middleware stack
                );
            } else {
                // require file and return function
                // calling that function will create new Controller instance and return Action
                const Controller = controllerResolver.get(route.handler);

                router[routeMethod](
                    routeOptions.path, // regex route path
                    middlewares, // middleware stack
                    (req, res, next) => {
                        // Create new Controller instance for each request
                        const controller = new Controller;
                        // req.method is set from express.methodOverride middleware
                        // when you want to send method that is not GET or POST
                        //
                        // <!-- enctype must be set to the type you will parse before methodOverride() -->
                        // <form method="POST" action="/resource" enctype="application/x-www-form-urlencoded">
                        //   <input type="hidden" name="_method" value="DELETE">
                        //   <button type="submit">Delete resource</button>
                        // </form>
                        const method = routeMethod || route.action || routeOptions.method;

                        // get Controller Action
                        const action = controller.use(method, route.pageType);

                        // pass Express arguments to Controller Action
                        return action(req, res, next);
                    }
                );
            }
        };

        // preparing mounted paths
        const setMountHandlers = (route, method, setHandler) => {
            this.config.settings.mountPaths.forEach((path) => {
                const routePath = (path + route.path).replace(/(\/\/)/g, '/');
                setHandler(route, method, routePath);

                // rearrangeParams and paramsCombination are not supposed to work at the same time
                if (route.paramsCombination && !route.rearrangeParams) {
                    const combinationPaths = this.permutationCombinationPaths(route, routePath);
                    // set all combination of route paths
                    combinationPaths.forEach((combinationPath) => {
                        setHandler(route, method, combinationPath);
                    });
                }

                if (route.rearrangeParams && !route.paramsCombination) {
                    this.setRearrangeHandler(router, route, method, routePath);
                }
            });
        };

        const setRoute = (route, method, routeName) => {
            if (this.config.settings.mountPaths && (route.mount !== false)) {
                setMountHandlers(route, method, setHandler);
            } else {
                setHandler(route, method);
                // rearrangeParams and paramsCombination are not supposed to work at the same time
                if (route.paramsCombination && !route.rearrangeParams) {
                    const combinationPaths = this.permutationCombinationPaths(route);
                    // set all combination of route paths
                    combinationPaths.forEach((combinationPath) => {
                        setHandler(route, method, combinationPath);
                    });
                }

                if (route.rearrangeParams && !route.paramsCombination) {
                    this.setRearrangeHandler(router, route, method);
                }
            }

            // create route table for client side router
            //router.routeTable = this.attachRouteTable(router, route);
        };

        this.prepareRouterConfig(this.config.routes, (route, routeName) => {
            if (utils.env.isActive(route)) {
                // extract params from route path
                const extractedParams = this.pathExtractor(route.path).params;

                route.routeName = routeName;

                // if {params} is not defined in config
                route.params = route.params || {};

                // path has params (:something) but param regex is not defined in route "params" config
                // example
                //
                // "attributes": {
                //   "method": "GET",
                //   "path": "/attributes/:type"
                // }
                extractedParams.forEach((paramName) => {
                    const param = paramName
                        .replace(`${routeName}_`, '') // remove prefix
                        .replace('\?', ''); // remove question mark

                    // set route param
                    if (!route.params[param]) {
                        route.params[param] = '(.+)';
                    }
                });

                const paramsKeys = Object.keys(route.params);
                const hasQueryRegex = route.query && Object.keys(route.query).length;

                // apply regex params to route path
                paramsKeys.forEach((paramName, key) => {
                    // catch last param
                    const isLast = key === (paramsKeys.length -1);
                    // pass query validator only for last element in order to have query validation only once
                    const queryValidator = isLast && hasQueryRegex ? this.validateQuery(route.query) : null;

                    this.setRouteParamsValidator(router, routeName, paramName, route.params[paramName], queryValidator);
                });

                // if one route path supports multiple methods
                if (Array.isArray(route.methods) && route.methods.length) {
                    route.methods.forEach((method) => {
                        setRoute(route, method);
                    });
                } else {
                    setRoute(route, route.method);
                }
            }
        });

        return router;
    }

    // create route table for client side router
    attachRouteTable (router, route) {
        router.routeTable = router.routeTable || {};

        const action = route.action || route.handler;

        if (!router.routeTable[action]) {
            router.routeTable[route.pageType] = {
                action,
                path: route.originalPath,
                paramsPrefixes: route.paramsPrefixes,
                params: route.params,
                query: route.query || {}
            };
        }

        return router.routeTable;
    }
}

module.exports = RouteDispatcher;

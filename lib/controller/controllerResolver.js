'use strict';

const loadByAppPaths = require('@rhema/loader');
const ModelResolver = require('@rhema/model/modelResolver');
const Hooks = require('@rhema/hooks');

class ControllerResolver {
    constructor (config) {
        this.config = config.app;

        // interceptor loader for beforeRender and afterRender
        this.interceptor = new Hooks({
            beforeRender: config.app.middlewares.beforeRender,
            afterRender: config.app.middlewares.afterRender
        });
    }

    get (handler) {
        const controllerName = handler + this.config.controllers.suffix;
        const getModel = new ModelResolver(this.config);
        let paths = this.config.controllers.paths;

        // merge {corePaths} with {paths}
        // we have core routes and controllers inside Rhema
        paths = paths.concat('../controller/handlers');

        const Controller = loadByAppPaths(controllerName, paths);

        return Function.prototype.bind.apply(Controller, [
            Controller,
            this.config,
            this.interceptor,
            this.get,
            getModel
        ]);
    }
}

module.exports = ControllerResolver;

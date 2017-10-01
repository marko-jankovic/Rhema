'use strict';

const express = require('express');
const Dispatcher = require('../dispatcher');
const Middleware = require('../middleware');
const services = require('../services');
const Request = require('../http/request');
const Response = require('../http/response');
const ControllerResolver = require('../controller/controllerResolver');
const Profiler = require('../profiler');
const Server = require('../server');
const utils = require('../utils');
const vhost = require('vhost');
const os = require('../os');

// Start Application
// Initialize Rhema Services
// Setup Express Router, Middlewares and Vhosts
// Load Rhema Controller
// Start Server after all {init} Services are executed
class App {
    constructor (config, appCallback) {
        let preboot = false;

        // initialize server
        const server = new Server(config);

        logger.debug('App initialization started..');

        // initialize services
        const servicesInstance = services.create(config[utils.env.get('NAME')]);
        const startServer = () => {
            // check for global variables
            // if 'use strict'; is not included
            utils.app.detectGlobalVarLeaks(config[utils.env.get('NAME')].app.globalVarLeakIgnore);

            preboot = true;

            // bootstrap Express app
            const app = this.bootstrapApp(config);

            // initialize profiler and start profiler
            const profiler = new Profiler(config[utils.env.get('NAME')].framework.profiler);

            server(app, (serverInstance, gracefulRestart) => {
                profiler.startProfiler((issue) => {
                    gracefulRestart(serverInstance, issue);
                });

                appCallback(app, config, servicesInstance);
            });
        };

        // initialize services and
        // run the server
        servicesInstance.run((err) => {
            if (err) {
                logger.error('Services initialization error', err.stack);
            } else {
                logger.debug('Services initialization successful!');
                startServer();
            }
        });

        // checking preboot and start server if preboot was not successful
        // case - if someone forgot to return any callback from services
        // services.init will not execute callback and server will not be started
        if (utils.env.isActive(config[utils.env.get('NAME')].framework.server.rebootApp)) {
            const rebootTimeout = setInterval(() => {
                if (!preboot) {
                    logger.debug('rebootTimeout: starting server again after %sms', config[utils.env.get('NAME')].framework.server.rebootApp.timeout);
                    startServer();
                }

                // server is started, clear interval
                clearInterval(rebootTimeout);
            }, config[utils.env.get('NAME')].framework.server.rebootApp.timeout);
        }
    }

    // Boostrap Express.js App
    // Set Router, Middlwares and Vhost
    bootstrapApp (config) {
        // extend express request and response
        express.request = new Request(express.request);
        express.response = new Response(express.response);

        const expressApp = express();
        // if env is not set express will set 'default'
        expressApp.set('env', utils.env.get('NODE_ENV'));
        // port is set in bootstrap
        expressApp.set('port', utils.env.get('PORT'));
        // disable cache only in development
        expressApp.set('view cache', !utils.env.isLocal());
        // disable express powered-by header
        expressApp.set('x-powered-by', false);
        // Set 'trust proxy' to non-falsy value
        // - req.hostname is derived from the value set in the X-Forwarded-Host header
        // which can be set by the client or by the proxy.
        // - X-Forwarded-Proto can be set by the reverse proxy to tell the app whether
        // it is https or http or even an invalid name. This value is reflected by req.protocol.
        // - req.ip and req.ips values are populated with the list of addresses from X-Forwarded-For
        expressApp.set('trust proxy', 1);
        expressApp.set('verbose errors', true);
        expressApp.set('query parser', 'extended');
        expressApp.set('etag', false);
        // set all data inside viewmodel object
        expressApp.set('viewmodel', true);

        // core object inside locals
        // for rhema settings
        expressApp.locals.core = {
            env: utils.env.get('NODE_ENV')
        };

        Object.keys(config).forEach((siteName) => {
            // site is valid only if has vhosts
            if (config[siteName].app.vhosts) {
                this.registerApps(expressApp, config[siteName]);
            }
        });

        return expressApp;
    }

    // for current app set:
    // middleware (preDispatch, routeInvoked, routeError), controller, router,
    // express mount path, express vhosts
    registerApps (expressApp, siteConfig) {
        // create new instance of middleware
        // it is possible to have different middlewares on different domains
        const middleware = new Middleware(siteConfig);
        const controllerResolver = new ControllerResolver(siteConfig);
        const mountPaths = siteConfig.app.router.settings.mountPaths || ['/'];

        // Configure {preDispatch} middlewares - triggered for all routes static and dynamic
        // mountPaths is array of paths
        expressApp.use(mountPaths, middleware.use('preDispatch'));

        // Initialize Dispatcher
        const dispatcher = new Dispatcher(siteConfig.app.router);

        // Express router
        let router = new express.Router(siteConfig.app.router.settings.expressRouter);

        // set route method, path and middlewares
        router = dispatcher.setRoutes(router, middleware.routeInvoked(), controllerResolver);

        // 404 and 500 middlewares (notFound and internalError)
        router.use(middleware.use('routeError'));

        // Attaching routeTable to locals
        expressApp.locals.core.routeTable = router.routeTable;

        // attach router to vhosts
        siteConfig.app.vhosts.forEach((value) => {
            // set vhost
            // vhost can't be used through midlleware config
            // since it depends on router instance
            expressApp.use(vhost(value, router));
        });

        // Set local IP address to vhost array - only on dev env
        // usefull for easier testing on mobile devices
        const hostAddress = os.getLocalIpAddress();

        if (hostAddress) {
            expressApp.use(vhost(hostAddress, router));
        }

        // Set vhosts to Router
        expressApp.use(siteConfig.app.vhosts, router);
    }
}

module.exports = App;

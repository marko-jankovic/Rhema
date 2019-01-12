'use strict';

const App = require('./');
const baseConfig = require('./baseConfig.json');
const Config = require('@rhema/config');
const Logger = require('@rhema/logger');
const Metrics = require('@rhema/metrics');
const Phoenix = require('@rhema/cluster');
const utils = require('@rhema/utils');

// Boostrap Application
// Initialize Config and Cluster for handling Master/Worker process
class Bootstrap {
    constructor (configSettings, appCallback) {
        // Set process.env.NODE_ENV
        // on alpha/beta/prod it will be set from "exports" command "process control system"
        utils.env.set('NODE_ENV');
        // Load synchronous app, env and subdomains configs
        // merge "APP" config with baseConfig
        const config = new Config(configSettings, baseConfig).build();

        // set name from env or from config
        utils.env.set('NAME', process.env.NAME || 'main');
        // set port from env or from config
        utils.env.set('PORT', process.env.PORT || config.apps[utils.env.get('NAME')].framework.server.port);
        // set 0.0.0.0 only for development to have local IP adress available, env and 127.0.0.1 for alpha/beta/prod
        utils.env.set('HOST', !utils.env.isLocal() ? (config.apps[utils.env.get('NAME')].framework.server.host) : '0.0.0.0');
        // set socket path e.g. "/var/run/nodejs/server.sock"
        utils.env.set('SOCKET_PATH', process.env.SOCKET_PATH || config.apps[utils.env.get('NAME')].framework.server.socketPath);

        global.logger = global.logger || new Logger(config.apps[utils.env.get('NAME')].framework.logger);
        global.metrics = global.metrics || new Metrics(config.apps[utils.env.get('NAME')].framework.metrics);

        // Cluster wrapper
        const phoenix = new Phoenix(config.apps[utils.env.get('NAME')].framework.cluster);

        // Master process is used only for forking
        // and monitoring child processes
        if (!phoenix.isMaster) {
            // Initialize App
            // appCallback is not mandatory but must be function
            return new App(config.apps, appCallback || function () {});
        }
    }
}

module.exports = Bootstrap;

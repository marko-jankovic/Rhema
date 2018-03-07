'use strict';

const os = require('../os');
const utils = require('../utils');
const path = require('path');

const Server = function Server (config) {
    const serverConfig = config[utils.env.get('NAME')].framework.server;

    const gracefulRestart = function gracefulRestart (serverInstance, issue, callback) {
        if (utils.env.isActive(serverConfig.gracefulRestart) && serverConfig.gracefulRestart.events.includes(issue)) {
            const timer = serverConfig.gracefulRestart.timeout || 30000;

            // make sure we close down within 30 seconds
            const killTimer = setTimeout(() => {
                logger.info('Graceful Restart: after %sms', timer, 'Kill process: ', process.pid);
                process.exit(1);
            }, timer);

            killTimer.unref();

            // stop taking new requests
            serverInstance.close();
        }

        if (typeof callback === 'function') {
            callback();
        }
    };

    // start server
    return function startServer (expressApp, callback) {
        const socketPath = utils.env.get('SOCKET_PATH');
        const port = utils.env.get('PORT');
        // socketPath is usualy created in /var/run folder.
        // nginx must be able to the write to socket file
        // make sure you have set file permissions and you have prepared nginx config e.g
        //
        // server {
        //     server_name HOST_NAME;
        //
        //     location / {
        //        proxy_pass 'http://unix:SOCKET_PATH';
        //     }
        // }
        const isSocket = socketPath && path.extname(socketPath) === '.sock';
        const serverArgs = isSocket ? [socketPath] : [port, utils.env.get('HOST')];

        // unlink old socket
        if (isSocket) {
            const unlinkFile = utils.fs.unlinkFile(socketPath);
            if (!unlinkFile) {
                logger.error(unlinkFile);
            }
        }

        logger.debug('Server arguments:', serverArgs);

        const serverInstance = expressApp.listen(...serverArgs, () => {
            logger.info('✔ Server started successfully.');

            if (isSocket) {
                logger.debug(`Server is listening on socket path "http://unix:${socketPath}". Make sure you have prepared nginx config`);
            }

            // print info for each vhost
            const vhosts = config[utils.env.get('NAME')].app.vhosts.map(vhost => `http://${vhost}${isSocket ? '' : ':' + process.env.PORT}`);
            const hostAddress = os.getLocalIpAddress();

            if (hostAddress) {
                vhosts.push(`${hostAddress}:${port}`);
            }

            logger.debug(
                '\n↳', (config[utils.env.get('NAME')].framework.server.name || '').toUpperCase(),
                `version (${utils.app.getVersion()})`,
                '\n ↳', 'vhosts:', vhosts, '\n'
            );

            callback(serverInstance, gracefulRestart);
        });

        return serverInstance;
    };
};

module.exports = Server;

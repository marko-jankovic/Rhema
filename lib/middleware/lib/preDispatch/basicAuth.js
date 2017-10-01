'use strict';

const utils = require('../../../utils');
const auth = require('basic-auth');

const checkAuth = (options, req, res) => {
    let hasCredentials = true;
    const password = options.password;
    const routes = options.routes;

    if (!password) {
        if (utils.env.isLocal()) {
            throw new Error('Password is not defined! Please see basicAuth security settings.');
        } else {
            res.end('Access denied!');
        }
    }

    Object.keys(routes).forEach((key) => {
        if (new RegExp(routes[key]).test(req.url)) {
            const credentials = auth(req);
            const isValid = !credentials || credentials.name !== key || credentials.pass !== password;

            if (isValid) {
                res.status(401);

                const realm = `Enter ${key} Admin username and password.`;
                res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);

                hasCredentials = false;
                res.end('Authorization Required. Access denied');
            }
        }
    });

    return hasCredentials;
};

// Basic Authentication
module.exports = (options) => {
    return (req, res, next) => {
        const hasCredentials = checkAuth(options, req, res);

        if (hasCredentials) {
            next();
        }
    };
};

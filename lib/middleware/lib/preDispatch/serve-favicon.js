'use strict';

/* eslint no-underscore-dangle: ["error", { "allow": ["_headers"] }] */

const etag = require('etag');
const fresh = require('fresh');
const fs = require('fs');
const ms = require('ms');
const parseUrl = require('parseurl');
const nativePath = require('path');
const resolve = nativePath.resolve;
const _ = require('lodash');

// Calculate the max-age from a configured value.
const calcMaxAge = function calcMaxAge (val) {
    const num = typeof val === 'string' ? ms(val) : val;
    const maxMaxAge = 60 * 60 * 24 * 365 * 1000; // 1 year

    return (num === null) ? maxMaxAge : Math.min(Math.max(0, num), maxMaxAge);
};

// Create icon data from Buffer and max-age.
const createIcon = function createIcon (buf, maxAge) {
    return {
        body: buf,
        headers: {
            'Cache-Control': `public, max-age=${Math.floor(maxAge / 1000)}`,
            ETag: etag(buf)
        }
    };
};

// Create EISDIR error.
const createIsDirError = function createIsDirError (path) {
    const error = new Error(`EISDIR, illegal operation on directory '${path}'`);

    error.code = 'EISDIR';
    error.errno = 28;
    error.path = path;
    error.syscall = 'open';

    return error;
};

// Send icon data in response to a request.
const send = function send (req, res, icon) {
    const headers = icon.headers;

    // Set headers
    const keys = Object.keys(headers);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        res.setHeader(key, headers[key]);
    }

    if (fresh(req.headers, res._headers)) {
        res.statusCode = 304;
        res.end();
        return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Length', icon.body.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.end(icon.body);
};

// @TODO refactor
module.exports = (path, options) => {
    if (!path) {
        throw new TypeError('path to favicon.ico is required');
    }

    const opts = options || {};
    let buf;
    let icon = {
        defaultFavicon: undefined
    }; // favicon cache
    const maxAge = calcMaxAge(opts.maxAge);

    if (Buffer.isBuffer(path)) {
        buf = new Buffer(path.length);
        path.copy(buf);

        icon = createIcon(buf, maxAge);
    } else if (typeof path === 'string') {
        path = resolve(path);
        fs.stat(path, (err, stat) => {
            if (err) {
                logger.error('Can not find favicon', path, 'file.', 'Please add site favicon to your public folder.');
            }

            if (stat && stat.isDirectory()) {
                throw createIsDirError(path);
            }
        });
    } else {
        throw new TypeError('path to favicon.ico must be string or buffer');
    }

    return (req, res, next) => {
        let subdomainFavicon = false;
        let subdomainPath = false;

        if (parseUrl(req).pathname !== '/favicon.ico') {
            next();
            return;
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.statusCode = req.method === 'OPTIONS' ? 200 : 405;
            res.setHeader('Allow', 'GET, HEAD, OPTIONS');
            res.setHeader('Content-Length', '0');
            res.end();
            return;
        }

        if (req.headers.host && opts.subdomainFolder) {
            const headersHost = _.clone(req.headers.host, true);
            const subdomain = headersHost.split('.').shift();

            // if subdomain favicon is not cached in icon
            if (!icon[subdomain]) {
                try {
                    // create favicon path
                    subdomainPath = `${opts.subdomainFolder}/${subdomain}.ico`;
                    const subdomainStat = fs.statSync(subdomainPath);
                    // check if favicon exists
                    if (subdomainStat.isFile()) {
                        // replace original path with subdomain path
                        subdomainFavicon = subdomain;
                    }
                } catch (e) {
                    subdomainPath = false;
                    subdomainFavicon = false;
                }
            }

            // if subdomain exist and it is cached in icon object
            if (icon[subdomain]) {
                return send(req, res, icon[subdomain]);
            } else if (!subdomainFavicon && icon.defaultFavicon) {
                return send(req, res, icon.defaultFavicon);
            }
        } else if (icon.defaultFavicon) {
            return send(req, res, icon.defaultFavicon);
        }

        fs.readFile(subdomainPath || path, (err, buf) => {
            if (err) {
                return next(err);
            }

            let newFavicon;

            if (subdomainFavicon) {
                newFavicon = icon[subdomainFavicon] = createIcon(buf, maxAge);
            } else {
                newFavicon = icon.defaultFavicon = createIcon(buf, maxAge);
            }

            send(req, res, newFavicon);
        });
    };
};

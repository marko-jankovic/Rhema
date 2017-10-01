'use strict';

const url = require('url');

const formatters = {
    forceWww: function forceWww (req) {
        const parsedUrl = url.parse(req.url);
        const host = parsedUrl.host && !parsedUrl.host.match(/^www/);
        const pathname = parsedUrl.pathname && !parsedUrl.pathname.match(/^www/);

        if (parsedUrl && (host || pathname)) {
            if (pathname && !host) {
                parsedUrl.pathname = `//www.${parsedUrl.pathname}`;
            } else {
                parsedUrl.host = `www.${parsedUrl.host}`;
            }

            // generate new url with www
            const newUrl = url.format(parsedUrl);

            logger.info('Force www url %s', newUrl);

            return newUrl;
        }

        return false;
    },

    trailingSlash: function trailingSlash (req) {
        const parsedUrl = url.parse(req.url);

        // match everything except home page
        if (parsedUrl.pathname.match(/\/$/) && parsedUrl.pathname.length > 1) {
            // remove trailing slash
            parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
            // generate new url without trailing slash
            const newUrl = url.format(parsedUrl);

            logger.info('Force url without trailing slash %s', newUrl);

            return newUrl;
        }

        return false;
    },

    forceSecure: function forceSecure (req) {
        const header = req.headers['x-forwarded-proto'] || req.headers.host;

        if (header && header !== 'https') {
            const parsedUrl = url.parse(req.url);
            parsedUrl.protocol = 'https:';
            // generate new url with https protocol
            const newUrl = url.format(parsedUrl);

            logger.info('Force url with https protocol %s', newUrl);

            return newUrl;
        }

        return false;
    }
};

// Handle redirection for case when we want forceSecure, trailingSlash and forceWww
// @TODO - forceWww is not working
module.exports = (options) => {
    return (req, res, next) => {
        const oldUrl = req.url;

        Object.keys(options).forEach((key) => {
            if (formatters[key] && options[key] === true) {
                // call formatter
                const formattedUrl = formatters[key](req);

                if (formattedUrl) {
                    req.url = formattedUrl;
                }
            }
        });

        if (oldUrl === req.url) {
            next();
        } else {
            res.redirect(301, req.url);
        }
    };
};

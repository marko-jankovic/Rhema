'use strict';

const url = require('url');

module.exports = {
    // Converts an absolute URL to a relative URL, e.g.:
    // 'http://domain.com/p/a/t/h?foo=bar' -> '/p/a/t/h?foo=bar'
    getRelativeUrl (absoluteUrl) {
        return url.parse(absoluteUrl).path;
    },

    // Converts an relative URL to a absolute URL
    // '/p/a/t/h?foo=bar' -> 'http://domain.com/p/a/t/h?foo=bar'
    getAbsoluteUrl (relativeUrl, request) {
        return `//${request.headers.host}${relativeUrl}`;
    },

    getHostname (path, keepWWW) {
        const parsedURL = url.parse(path);
        let hostname = parsedURL ? parsedURL.hostname : '';
        const wwwString = 'www.';

        if ((!keepWWW) && (hostname.indexOf(wwwString) === 0)) {
            hostname = hostname.substring(wwwString.length);
        }

        return hostname;
    },

    // Returns true for any relative variant.
    isRelativeUrl (url) {
        return !this.isAbsoluteUrl(url);
    },

    // Returns true for an absolute url.
    isAbsoluteUrl (url) {
        if (typeof url !== 'string') {
            return false;
        }

        return /^(?:\w+:)\/\//.test(url);
    },

    getFullUrl (req) {
        return url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl
        });
    },

    // Cleanup URL paths, like /foo////bar/// to /foo/bar.
    sanitizePath (path) {
        // strip out any //my//foo//bar///blah
        path = path.replace(/\/\/+/g, '/');

        // remove a trailing '/'
        if (path.lastIndexOf('/') === (path.length - 1) && path.length > 1) {
            path = path.substr(0, path.length - 1);
        }

        return path;
    }
};

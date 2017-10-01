'use strict';

// @TODO - this is temp solution
// - figure out how to extend and overwrite express methods,
// disable req.app and req.locals, create a new req storage
const url = require('url');
const useragent = require('useragent');

class Request {
    constructor (expressReq) {
        return Object.assign(expressReq, {
           // Request query params
            getQuery () {
                return Object.assign({}, this.query || {});
            },

            // Request rest params
            getParams () {
                return Object.assign({}, this.params || {});
            },

            getFullUrl () {
                return url.format({
                    protocol: this.protocol,
                    host: this.get('host'),
                    pathname: this.originalUrl
                });
            },

            getUserAgent () {
                const agent = useragent.parse(this.getHeader('user-agent'));
                return agent ? agent.toString() : null;
            },

            isJson () {
                // usually set in headers from SinglePageApp frameworks
                const jsonContentType = this.getHeader('content-type') === 'application/json';
                // json set as route param
                const jsonFormat = this.params.format === 'json';

                // remove "format" from params
                delete this.params.format;

                // set json format if content type is json
                return jsonContentType || jsonFormat || false;
            },

            getHeader (name) {
                return this.headers[name] || null;
            },

            setHeader (name, value) {
                this.headers[name] = value;
            },

            setSpaReferer () {
                const xReferer = this.headers['x-spa-referer'];
                const xRefererPage = this.headers['x-spa-referer-page'];

                if (xReferer) {
                    this.headers.referer = url.parse(xReferer).path;
                    delete this.headers['x-spa-referer'];
                }

                this.headers.refererPage = xRefererPage || null;
            },

            getCookie (cookieName) {
                return this.cookies ? this.cookies[cookieName] : null;
            },

            getClientIp (forcedIP) {
                const ip = forcedIP ||
                    this.getHeader('x-cluster-client-ip') ||
                    this.getHeader('X-Request-IP') ||
                    this.getHeader('x-forwarded-for') ||
                    this.getHeader('X-Forwarded-For') ||
                    this.getHeader('x-client-ip') ||
                    this.getHeader('x-real-ip') ||
                    this.getHeader('forwarded-for') ||
                    this.getHeader('forwarded') ||
                    this.connection.remoteAddress ||
                    this.socket.remoteAddress;

                return ip;
            }
        });
    }
}

module.exports = Request;

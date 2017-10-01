'use strict';

// @TODO - this is temp solution
// - figure out how to extend and overwrite express methods,
// disable res.app and res.locals, create a new res storage
const services = require('../services');
const onHeaders = require('on-headers');

class Response {
    constructor (expressRes) {
        const servicesInstance = services.instance();

        return Object.assign(expressRes, {
            onHeaders (callback) {
                onHeaders(this, callback);
            },

            setCookie (cookieName, value, cookieOptions) {
                if (this.cookie) {
                    this.cookie(cookieName, value, cookieOptions);
                }
            },

            deleteCookie (cookieName) {
                if (this.cookie) {
                    this.cookie(cookieName, '', { expires: new Date(1), path: '/' });
                }
            },

            // this.redirectToUrl('back');
            // this.redirectToUrl('/login');
            // this.redirectToUrl('http://google.com');
            redirectToUrl (redirectUrl, statusCode = 301) {
                this.redirect(statusCode, redirectUrl);
            },

            redirectBack () {
                this.redirect('back');
            },

            // Redirect to specific Route
            // this.redirectToRoute('search', { make: 'Acura' });
            redirectToRoute (routeName, params = {}, statusCode) {
                const url = servicesInstance.$helpers.formatUrl(routeName, params);
                this.redirectToUrl(url, statusCode);
            }
        });
    }
}

module.exports = Response;

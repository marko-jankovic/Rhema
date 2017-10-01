'use strict';

/* global it, describe, beforeEach */

const chai = require('chai');
const assert = chai.assert;

const Middleware = require('../index');
const DI = require('../../di/injector');

const redirect = require('../lib/routeInvoked/redirect');
const sanitizeRequest = require('../lib/preDispatch/sanitizeRequest');
const getClientIp = require('../lib/routeInvoked/getClientIp');
const removeParams = require('../lib/core/removeParamsPrefixes');
const cleanupViewmodel = require('../lib/beforeRender/cleanupViewmodel.js');
const removeParam = require('../lib/core/removeParamPrefix');

describe('# Middleware', () => {
    let middleware;

    beforeEach(() => {
        middleware = new Middleware({
            framework: { latency: {} },
            app: {
                router: {
                    routes: {
                        search: {},
                        detail: {},
                        home: {}
                    }
                },
                middlewares: {
                    preDispatch: {
                        compression: {
                            order: 1,
                            enabled: false,
                            path: 'compression',
                            options: { threshold: 9 }
                        },
                        'set-namespaces': {
                            order: 2,
                            path: './lib/middleware/lib/preDispatch/setNamespaces.js',
                            options: []
                        },
                        'generated-files': {
                            path: 'express',
                            method: 'static',
                            options: ['build', {
                                maxAge: '15d',
                                index: false,
                                etag: true,
                                dotfiles: 'deny',
                                lastModified: true,
                                redirect: false
                            }]
                        },
                        longcached: {
                            order: 3,
                            path: 'express'
                        },
                        shortcached: {
                            order: 1,
                            path: 'express'
                        }

                    },
                    routeInvoked: {
                        'request-timeout': {
                            order: 1,
                            routes: ['*'],
                            path: './lib/middleware/lib/core/requestTimeout.js',
                            options: {
                                time: 30000,
                                statusCode: 408,
                                errMessage: 'Response timeout'
                            }
                        },
                        'request-time': {
                            order: 2,
                            routes: ['detail'],
                            path: './lib/middleware/lib/routeInvoked/requestTime.js'
                        },
                        'set-headers': {
                            order: 3,
                            routes: ['!search'],
                            path: './lib/middleware/lib/routeInvoked/setHeaders.js',
                            options: {
                                'Cache-Control': 'no-cache, no-store',
                                'Content-Type': 'text/html; charset=utf-8'
                            }
                        }
                    }
                }
            }
        }, new DI());
    });

    it('Test Middleware:use', () => {
        const initial = middleware.use('preDispatch');
        const routeInvoked = middleware.use('routeInvoked');

        assert.lengthOf(initial, 4, 'should have 4 initial middlewares');
        assert.equal(initial[0].name, 'serveStatic', '"serveStatic" should be first middleware');
        assert.equal(initial[2].name, 'setNamespaces.js', '"setNamespaces" should be second middleware');

        assert.lengthOf(routeInvoked, 3, 'should have 1 route middleware');
        assert.equal(routeInvoked[0].path, './lib/middleware/lib/core/requestTimeout.js');

        assert.typeOf(routeInvoked[0].routes, 'array', '"routes" should be array');
        assert.typeOf(routeInvoked[0].handler, 'function', '"handler" should be function');
        assert.typeOf(routeInvoked[0].args, 'array', '"args" should be function');

        assert.include(routeInvoked[0].routes, 'search', 'should have "search"');
        assert.include(routeInvoked[0].routes, 'detail', 'should have "detail"');
        assert.include(routeInvoked[0].routes, 'home', 'should have "home"');

        assert.notInclude(routeInvoked[1].routes, 'search', 'should have "search"');
        assert.notInclude(routeInvoked[1].routes, 'home', 'should have "home"');

        assert.notInclude(routeInvoked[2].routes, 'search', 'should have "search"');
        assert.include(routeInvoked[2].routes, 'detail', 'should have "detail"');
        assert.include(routeInvoked[2].routes, 'home', 'should have "home"');
    });

    it('Test Middleware:routeInvoked', () => {
        const routeInvoked = middleware.routeInvoked();

        assert.lengthOf(Object.keys(routeInvoked.fn), 3, 'should have 3 invoked middlewares');
        assert.lengthOf(routeInvoked.routes.search, 1, 'should have 1 element');
        assert.lengthOf(routeInvoked.routes.detail, 3, 'should have 3 elements');
        assert.lengthOf(routeInvoked.routes.home, 2, 'should have 2 elements');

        assert.equal(routeInvoked.fn[0].name, 'requestTimeout');
        assert.equal(routeInvoked.fn[1].name, 'requestTime');
        assert.equal(routeInvoked.fn[2].name, 'setHeaders');
    });

    it('Test Middleware::redirect', (done) => {
        const redirectMiddleware1 = redirect({ forceWww: true, forceSecure: true, trailingSlash: true });
        const redirectMiddleware2 = redirect({ forceWww: false, forceSecure: true, trailingSlash: true });
        const redirectMiddleware3 = redirect({ forceWww: false, forceSecure: false, trailingSlash: true });
        const req = {
            url: 'blahstory.com/profiler/',
            headers: {
                'x-forwarded-proto': 'http'
            }
        };
        const res3 = {
            redirect: (status, url) => {
                try {
                    assert.equal(status, 301);
                    assert.equal(url, 'http://blahstory.com/profiler');
                } catch (e) {
                    return done(e);
                }

                done();
            }
        };
        const res2 = {
            redirect: (status, url) => {
                assert.equal(status, 301);
                assert.equal(url, 'https://blahstory.com/profiler');
                redirectMiddleware3(req, res3, done);
            }
        };
        const res1 = {
            redirect: (status, url) => {
                assert.equal(status, 301);
                assert.equal(url, 'https://www.blahstory.com/profiler');
                redirectMiddleware2(req, res2, done);
            }
        };

        redirectMiddleware1(req, res1, done);
    });

    it('Test Middleware::sanitizeRequest', (done) => {
        const req = {
            url: 'index.php?name=guest<script>alert(\'attacked\')</script>',
            body: {
                data: { attack: '<script>alert(\'attacked\')</script>' },
                '<script>alert</script>': 'alert',
                test: null
            }
        };

        const sanitizeMiddleware = sanitizeRequest({
            reqFields: ['url', 'params', 'query', 'body'],
            xssOptions: {}
        });

        sanitizeMiddleware(req, {}, () => {
            try {
                assert.equal(req.url, 'index.php?name=guest&lt;script&gt;alert(\'attacked\')&lt;/script&gt;');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::sanitizeRequest - should not modify', (done) => {
        const req = { body: { flag: true } };

        const sanitizeMiddleware = sanitizeRequest({
            reqFields: ['url', 'params', 'query', 'body'],
            xssOptions: {}
        });

        sanitizeMiddleware(req, {}, () => {
            try {
                assert.isTrue(req.body.flag);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::getClientIp', (done) => {
        const ipMiddleware = getClientIp({ proxy: true, defaultIP: '127.0.2.121' });
        const req = {
            headers: {
                'x-forwarded-for': '127.0.2.121'
            }
        };

        ipMiddleware(req, {}, () => {
            try {
                assert.equal(req.clientIP, '127.0.2.121');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::cleanupViewmodel', (done) => {
        const data = { page: 'home', csrf: '1234', mare: 'car' };

        cleanupViewmodel({ blackList: ['page', 'csrf'] })(data, {}, () => {
            try {
                assert.equal(data.mare, 'car');
                assert.equal(data.page, undefined);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::cleanupViewmodel', (done) => {
        const data = { viewmodel: { mare: 'car', sale: 'car' }, page: 'home', csrf: '1234' };

        cleanupViewmodel({ blackList: ['sale'] })(data, {}, () => {
            try {
                assert.equal(data.viewmodel.mare, 'car');
                assert.equal(data.viewmodel.sale, undefined);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::cleanupViewmodel', (done) => {
        const data = { viewmodel: { mare: 'car', sale: 'car', deep: { foo: 'bar', baz: 'fuzz' } }, page: 'home', csrf: '1234' };

        cleanupViewmodel({ blackList: ['deep.baz'] })(data, {}, () => {
            try {
                assert.equal(data.viewmodel.mare, 'car');
                assert.equal(data.viewmodel.sale, 'car');
                assert.equal(data.viewmodel.deep.foo, 'bar');
                assert.equal(data.viewmodel.deep.baz, undefined);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::removeParamsPrefixes', (done) => {
        const removeParamsMiddleware = removeParams({
            make: 'make-(([A-Za-z0-9](_)?)+)',
            model: 'model-(([0-9A-Za-z](_)?)+)',
            location: 'location-(.*)',
            type: 'type-(.*)'
        });
        const req = {
            params: {
                make: 'make-Acura',
                model: 'model-CL'
            }
        };

        removeParamsMiddleware(req, {}, () => {
            try {
                assert.equal(req.params.make, 'Acura');
                assert.equal(req.params.model, 'CL');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Middleware::removeParamPrefix', (done) => {
        const removeParamsMiddleware = removeParam({
            make: 'make-(([A-Za-z0-9](_)?)+)',
            model: 'model-(([0-9A-Za-z](_)?)+)',
            location: 'location-(.*)',
            type: 'type-(.*)'
        }, 'search_');
        const req = {
            params: {
                search_make: 'make-Acura',
                search_model: 'model-CL',
                make: 'make-Acura',
                model: 'model-CL'
            }
        };

        removeParamsMiddleware(req, {}, () => {
            try {
                assert.lengthOf(Object.keys(req.params), 2);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });
});

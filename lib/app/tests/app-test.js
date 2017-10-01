'use strict';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const App = require('../bootstrap');
const request = require('request');

describe('# App', () => {
    beforeEach(() => {
        global.logger = {
            info: sinon.spy(),
            error: sinon.spy(),
            debug: sinon.spy(),
            warn: sinon.spy()
        };

        global.timer = {
            start: sinon.spy(),
            end: sinon.spy(),
            clearAll: sinon.spy()
        };

        global.metrics = {
            increment: sinon.spy(),
            gauge: sinon.spy(),
            timing: sinon.spy()
        };
    });

    it('should run App', function (done) {
        this.timeout(15000);
        new App({
            rootPath: false,
            testConfig: {
                app: {
                    controllers: { paths: ['./lib/app/tests/controllers'] },
                    models: { paths: ['./lib/app/tests/models'] },
                    router: {
                        routes: {
                            cars: {
                                method: 'GET',
                                path: '/cars/:make',
                                params: { make: '(.*)' }
                            }
                        }
                    },
                    services: {
                        testHelper: {
                            timeOut: {
                                path: './lib/app/tests/services/timeOut.js'
                            }
                        }
                    }
                },
                framework: {
                    server: { name: 'test-test' }
                }
            }
        }, (app, config, services) => {
            try {
                assert.property(config, 'main');
                assert.property(config.main, 'framework');
                assert.property(config.main, 'app');
                assert.equal(config.main.framework.server.name, 'test-test');

                assert.property(services.$helpers, 'formatUrl');
                assert.property(services.$helpers, 'apiCall');

                assert.isFunction(services.run);
                assert.isFunction(services.attach);

                assert.property(app, '_router');
                assert.equal(app.mountpath, '/');
                assert.equal(app.locals.core.env, 'development');
                assert.equal(app.settings.port, '8080');

                request.get('http://localhost:8080/cars/Acura', (err, res, body) => {
                    try {
                        assert.equal(JSON.parse(body).viewmodel.ultraCar, 'MARE');
                        assert.equal(JSON.parse(body).page, 'cars');
                        assert.property(JSON.parse(body), 'csrf');
                    } catch (e) {
                        return done(e);
                    }

                    request.get('http://localhost:8080', (err, res, body) => {
                        try {
                            assert.equal(res.statusCode, 404);
                            assert.equal(JSON.parse(body).statusCode, 404);
                            assert.equal(JSON.parse(body).err, '404: Url Not Found! Cannot GET / - User-Agent: Other 0.0.0 / Other 0.0.0');
                        } catch (e) {
                            return done(e);
                        }

                        done();
                    });
                });
            } catch (e) {
                done(e);
            }
        });
    });
});

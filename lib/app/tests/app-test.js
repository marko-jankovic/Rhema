'use strict';

const assert = require('@rhema/testing').assert;
const App = require('../bootstrap');
const request = require('request');

describe('# App', () => {
    // TODO close server at the end
    it('should run App', function (done) {
        this.timeout(15000);
        // ne radi kada je cluster upaljen
        process.env.PORT = 9090;
        new App({
            rootPath: false,
            testConfig: {
                app: {
                    controllers: { paths: ['./tests/controllers'] },
                    models: { paths: ['./tests/models'] },
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
                                path: './tests/services/timeOut.js'
                            }
                        }
                    }
                },
                framework: {
                    server: { name: 'main', port: 9090 },
                    cluster: { disabled: true },
                    metrics: { disabled: true },
                    profiler: {
                        memory: { disabled: true },
                        cpu: { disabled: true }
                    }
                }
            }
        }, (app, config, services) => {
            try {
                assert.property(config, 'framework');
                assert.property(config, 'app');
                assert.equal(config.framework.server.name, 'main');

                assert.property(services.$helpers, 'formatUrl');
                assert.property(services.$helpers, 'apiCall');

                assert.isFunction(services.run);
                assert.isFunction(services.attach);

                assert.property(app, '_router');
                assert.equal(app.mountpath, '/');
                assert.equal(app.locals.core.env, 'development');
                assert.equal(app.settings.port, '9090');


                request.get('http://localhost:9090/cars/Acura', (err, res, body) => {
                    try {
                        assert.equal(JSON.parse(body).viewmodel.ultraCar, 'MARE');
                        assert.equal(JSON.parse(body).page, 'cars');
                        assert.property(JSON.parse(body), 'csrf');
                    } catch (e) {
                        return done(e);
                    }

                    request.get('http://localhost:9090', (err, res, body) => {
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
                done();
            }
        });
    });
});

const assert = require('@rhema/testing').assert;
const services = require('../index');

describe('# Service', () => {
    let instance = null;
    beforeEach(() => {
        instance = services.create({
            framework: {
                latency: {
                    silent: false,
                    envLevel: '<alpha',
                    ignore: []
                }
            },
            app: {
                services: {
                    formatters: {
                        seo: {
                            path: './tests/test-services/seo.js'
                        }
                    },
                    helpers: {
                        string: {
                            path: './tests/test-services/string.js'
                        }
                    },
                    gateway: {
                        initial: {
                            path: './tests/test-services/initial.js'
                        }
                    },
                    export: {
                        test1: {
                            path: './tests/test-services/export1.js',
                            method: 'get'
                        },
                        test2: {
                            path: './tests/test-services/export2.js',
                            method: 'get'
                        }
                    },
                    simple: {
                        test1: {
                            path: './tests/test-services/simple.js'
                        },
                        test2: {
                            path: './tests/test-services/simple2.js'
                        },
                        test3: {
                            path: './tests/test-services/simple3.js'
                        }
                    },
                    prototype: {
                        prototype1: {
                            path: './tests/test-services/prototype1.js'
                        },
                        prototype2: {
                            path: './tests/test-services/prototype2.js'
                        }
                    }
                }
            }
        });
    });

    it('Test Services builder', (done) => {
        instance.run((err) => {
            try {
                assert.typeOf(instance.$formatters.seo.title, 'function');
                assert.equal(instance.$formatters.seo.title('Title'), 'TITLEs');

                assert.typeOf(instance.$gateway.initial.saveToCache, 'function');
                assert.equal(instance.$gateway.initial.$cache, 'savedToCache');

                assert.typeOf(instance.$helpers.string.plural, 'function');
                assert.equal(instance.$helpers.string.plural('string'), 'strings');


                assert.typeOf(instance.prototype.prototype1.test1, 'function');
                assert.typeOf(instance.prototype.prototype1.test2, 'function');

                assert.typeOf(instance.prototype.prototype2.test1, 'function');
                assert.typeOf(instance.prototype.prototype2.test2, 'function');

                assert.equal(instance.simple.test2('tests'), 'testss');
                assert.equal(instance.simple.test3('tests'), 'testss');
                assert.equal(instance.simple.test1('simplee'), 'simplee');

                assert.equal(instance.export.test1('tralal'), 'tralal');
                assert.equal(instance.export.test2('bla'), 'blas');

                assert.property(instance.helpers.string, 'plural');
                assert.typeOf(instance.helpers.string.plural, 'function');
            } catch (e) {
                return done(e);
            }

            done(err);
        });
    });

    it('Test Use Services', () => {
        assert.isFunction(services.use('simple').test1);
    });

});

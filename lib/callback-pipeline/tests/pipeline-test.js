'use strict';

const testing = require('@rhema/testing');
const assert = testing.assert;
const mock = testing.mock;
const Pipeline = require('../index');

describe('# Pipeline', () => {
    let config = {};

    it('should throw error if pipelines is not defined', () => {
        config = null;

        try {
            const pl = new Pipeline(config, {});
            pl.execute('detail', null, (err, data) => {});
        } catch (err) {
            assert.exists(err.message);
        }
    });

    it('should add simple data property in pipe', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            setData: {
                pipes: ['setData']
            }
        };

        const pl = new Pipeline(config, {});

        pl.execute('setData', (next) => next(null, {}), (err, data) => {
            try {
                assert.equal(data.testData, 'testData');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should push 1,2,3 to an array in order', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            pushToArray: {
                pipes: [
                    'push1',
                    'push2',
                    'push3'
                ]
            }
        };

        const pl = new Pipeline(config, {});
        pl.execute('pushToArray', null, (err, data) => {
            try {
                assert.equal(data.testData, '1,2,3');
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should NOT push 1,2,3 to an array in order', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            pushToArray: {
                pipes: [
                    'push1',
                    'push3',
                    'push2'
                ]
            }
        };

        const pl = new Pipeline(config, {});
        pl.execute('pushToArray', null, (err, data) => {
            try {
                assert.notEqual(data.testData.join(','), '1,2,3');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('should run series before parallel tasks', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            pushToArray: {
                pipes: [
                    'push1',
                    [
                        'push2',
                        'push3'
                    ]
                ]
            }
        };

        const pl = new Pipeline(config, {});
        pl.execute('pushToArray', null, (err, data) => {
            try {
                assert.equal(data.testData[0], '1');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('should run all parallel tasks before series task', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            pushToArray: {
                pipes: [
                    [
                        'push2',
                        'push2',
                        'push2'
                    ],
                    'push1',
                    'push3'
                ]
            }
        };

        const pl = new Pipeline(config, {});
        pl.execute('pushToArray', null, (err, data) => {
            try {
                assert.equal(data.testData[0], '2');
                assert.equal(data.testData[1], '2');
                assert.equal(data.testData[2], '2');
                assert.equal(data.testData[3], '1');
                assert.equal(data.testData[4], '3');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test Pipeline::addStep - should return array of steps/functions', (done) => {
        config = {
            paths: ['./tests/test-pipelines'],
            pushToArray: {
                pipes: [
                    'push1',
                    'push2',
                    'push3'
                ]
            }
        };

        const pl = new Pipeline(config, {});
        const m = mock(pl);
        m.expects('addStep').exactly(5);

        pl.execute('pushToArray', null, (err, data) => {
            pl.addStep((next) => {
                next(null, {});
            });
            m.verify();
            done();
        });
    });

    it('Test Pipeline::preparePipe - should loads and prepare pipelines', () => {
        config = {
            paths: [
                './tests/test-pipelines'
            ],
            pushToArray: {
                pipes: [
                    'push1',
                    'push2',
                    'push3'
                ]
            }
        };

        const pl = new Pipeline(config, {});
        const push1 = pl.preparePipe('push1', {}, 'pushToArray');
        const push2 = pl.preparePipe('push2', {}, 'pushToArray');
        const push3 = pl.preparePipe('push3', {}, 'pushToArray');

        assert.equal(push1.name, 'push1', 'Pipe name should be "push1"');
        assert.equal(push2.name, 'push2', 'Pipe name should be "push2"');
        assert.equal(push3.name, 'push3', 'Pipe name should be "push3"');
    });
});

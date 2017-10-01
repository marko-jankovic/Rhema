'use strict';

const chai = require('chai');
const assert = chai.assert;
const Latency = require('../index');

describe('# Latency', () => {
    const latency = new Latency({
        silent: false,
        envLevel: '<alpha',
        ignore: []
    });

    it('should test pipe latency response', (done) => {
        const pipe = latency.pipe((data, next) => {
            data.mare = 'Care!!!';
            next(null, data);
        });
        pipe({}, (err, data) => {
            try {
                assert.equal(data.mare, 'Care!!!');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('should test middleware latency response', (done) => {
        const middleware = latency.middleware((req, res, next) => {
            next(null);
        });

        middleware({}, {}, (err) => {
            try {
                assert.isNull(err);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('should test middleware error latency response', (done) => {
        const middleware = latency.middleware((error, req, res, next) => next(error));

        middleware('ERROR', {}, {}, (err) => {
            assert.equal(err, 'ERROR');
            done();
        });
    });

    it('should test service latency response', (done) => {
        const serviceCallback = latency.services((data, callback) => {
            data.mare = 'Care!!!';
            callback(null, data);
        }, 'service', 'test');

        const service = latency.services(function simpleService (data) {
            return data + 'Care!!!';
        }, 'service', 'test');

        assert.equal(service('Mare'), 'MareCare!!!');

        serviceCallback({}, (err, data) => {
            try {
                assert.equal(data.mare, 'Care!!!');
            } catch (e) {
                return done(e);
            }

            done();
        });
    });
});

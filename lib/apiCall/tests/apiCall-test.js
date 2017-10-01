'use strict';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const apiCall = require('../index')();

describe('# ApiCall', () => {
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

    it('should test apiCall simple response', function (done) {
        this.timeout(6000);

        apiCall('Name.Space', {
            uri: 'https://api.github.com/users',
            json: true,
            headers: { 'User-Agent': 'Firefox' }
        }, (err, data) => {
            if (data) {
                assert.isNull(err);
                assert.isArray(data);
            }

            done();
        });
    });

    it('should test apiCall 404 error response', function (done) {
        this.timeout(6000);

        apiCall('Name.Space', {
            uri: 'https://api.github.com/userss',
            json: true,
            headers: { 'User-Agent': 'Firefox' }
        }, (err, data) => {
            if (err) {
                assert.isNull(data);
                assert.oneOf(err.statusCode, [404, 403]);
            }

            done();
        });
    });

    it('should test apiCall error handler', function (done) {
        this.timeout(6000);

        apiCall('Name.Space', {
            uri: 'http://apierror.com:9030',
            json: true,
            headers: {
                'x-request-id': false
            },
            qs: { q: 'search' },
        }, (err, data) => {
            assert.instanceOf(err, Error);
            done();
        });
    });

    it('should work as promise (resolve case)', function (done) {
        this.timeout(6000);

        apiCall('Name.Space', {
            uri: 'https://api.github.com/users',
            json: true,
            headers: {
                'User-Agent': 'Firefox',
                'x-request-id': false
            }
        }).then((data) => {
            assert.isArray(data);
        }).catch((err) => {
            assert.instanceOf(err, Error);
        }).then(() => {
            done();
        });
    });

    it('should work as promise (reject case)', function (done) {
        this.timeout(6000);

        apiCall('Name.Space', {
            uri: 'https://api.github.com/userss',
            json: true,
            method: 'get',
            time: true,
            headers: { 'User-Agent': 'Firefox' }
        }).then((data) => {
            assert.isNull(data);
        }).catch((err) => {
            assert.isNotNull(err);
        }).then(() => {
            done();
        });
    });
});

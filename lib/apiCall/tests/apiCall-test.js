'use strict';

const assert = require('@rhema/testing').assert;
const apiCall = require('../index')();

describe('# ApiCall', () => {
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
            uri: 'http://dadasdadadads.com:9030',
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
                'User-Agent': 'Chrome',
                'x-request-id': false
            }
        }).then((data) => {
            assert.isArray(data);
            done();
        }).catch((err) => {
            done();
        })
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
            done();
        }).catch((err) => {
            assert.isNotNull(err);
            done();
        })
    });
});

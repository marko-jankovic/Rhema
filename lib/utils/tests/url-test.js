'use strict';

const assert = require('@rhema/testing').assert;
const urlUtil = require('../lib/url');

describe('# Url Utils', () => {
    it('Test Url::getRelativeUrl', () => {
        assert.equal(urlUtil.getRelativeUrl('http://domain.com/p/a/t/h?foo=bar'), '/p/a/t/h?foo=bar');
    });

    it('Test Url::getAbsoluteUrl', () => {
        assert.equal(urlUtil.getAbsoluteUrl('/p/a/t/h', { headers: { host: 'domain.com' } }), '//domain.com/p/a/t/h');
    });

    it('Test Url::getHostname', () => {
        assert.equal(urlUtil.getHostname('http://www.domain.com/p/a/t/h', true), 'www.domain.com');
        assert.equal(urlUtil.getHostname('http://domain.com/p/a/t/h'), 'domain.com');
    });

    it('Test Url::isRelativeUrl', () => {
        assert.isTrue(urlUtil.isRelativeUrl('/p/a/t/h?foo=bar'));
        assert.isFalse(urlUtil.isRelativeUrl('http://www.domain.com/p/a/t/h'));
    });

    it('Test Url::sanitizePath', () => {
        assert.equal(urlUtil.sanitizePath('/p/a///t/h/'), '/p/a/t/h');
    });

    it('Test Url::isAbsoluteUrl', () => {
        assert.isFalse(urlUtil.isAbsoluteUrl('/p/a/t/h?foo=bar'));
        assert.isTrue(urlUtil.isAbsoluteUrl('http://www.domain.com/p/a/t/h'));
    });
});


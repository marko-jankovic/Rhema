'use strict';

const assert = require('@rhema/testing').assert;
const envUtil = require('../lib/env');

describe('# Env Utils', () => {
    const env = envUtil.get('NODE_ENV');

    it('Test Env::is && set', () => {
        envUtil.set('NODE_ENV', 'development');
        assert.isTrue(envUtil.isLocal());
        assert.isFalse(envUtil.isAlpha());
        assert.isFalse(envUtil.isBeta());
        assert.isFalse(envUtil.isProd());
        assert.equal(envUtil.get('NODE_ENV'), 'development');
        assert.equal(envUtil.get('test'), 'null');
    });

    it('Test Env::isActive', () => {
        assert.isTrue(envUtil.isActive({ envLevel: 'dev', enabled: true }));
        assert.isFalse(envUtil.isActive({ envLevel: '!dev', enabled: true }));
        assert.isFalse(envUtil.isActive({ envLevel: 'dev', enabled: false }));
        assert.isFalse(envUtil.isActive({ envLevel: 'dev', disabled: true }));
    });

    after(() => {
        envUtil.set('NODE_ENV', env);
    });
});


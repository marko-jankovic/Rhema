'use strict';

const chai = require('chai');
const assert = chai.assert;

const appUtil = require('../lib/app');

describe('# App Utils', () => {
    it('Test App::getVersion', () => {
        const version = appUtil.getVersion().split('.');
        assert.lengthOf(version, 3);
    });

    it('Test App::isValidExtension - should test extensions', () => {
        assert.isTrue(appUtil.isValidExtension(['.js', '.json'], '.json'));
        assert.isFalse(appUtil.isValidExtension(['.js', '.json'], 'json'));
        assert.isTrue(appUtil.isValidExtension('*', 'json'));
    });
});


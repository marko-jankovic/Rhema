'use strict';

const assert = require('@rhema/testing').assert;
const beatle = require('../index');

describe('# Beatle', () => {
    it('should test beatle response', () => {
        beatle.set('test', 'test');
        const get = beatle.get();
        assert.isObject(get);
    });
});

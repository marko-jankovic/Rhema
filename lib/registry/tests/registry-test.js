const chai = require('chai');
const assert = chai.assert;
const registry = require('../');

describe('# Registry', () => {
    it('Registry namespace', (done) => {
        registry.createNamespace('Test');
        const namespace = registry.getNamespace('Test');

        namespace.run(() => {
            namespace.set('test', 1337);
            registry.set('test1', 1337);
            try {
                assert.equal(namespace.get('test'), 1337);
                assert.equal(registry.get('test'), 1337);
                assert.equal(registry.get('test1'), 1337);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });
});

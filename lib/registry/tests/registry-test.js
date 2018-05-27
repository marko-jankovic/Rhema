const assert = require('chai').assert;

const registry = require('../index.js');

describe('# Registry', () => {
    let namespaceTest;

    before(() => {
        namespaceTest = registry.createNamespace('test');
    });

    it('async state propagation', (done) => {
        const namespace = registry.createNamespace('Test');
        assert.exists(process.namespaces.Test);

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

    it('name is required', () => {
        assert.throws(() => registry.createNamespace());
    });

    it('namespace is returned upon creation', () => {
        assert.exists(namespaceTest);
    });

    it('namespace lookup works', () => {
        assert.exists(registry.getNamespace('test'));
        assert.equal(registry.getNamespace('test'), namespaceTest);
    });

    it('namespace is available from global', () => {
        registry.createNamespace('another');
        assert.exists(process.namespaces.another);
    });
});

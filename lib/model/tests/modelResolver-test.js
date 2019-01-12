const assert = require('@rhema/testing').assert;
const modelResolver = require('../modelResolver');
const DI = require('@rhema/di');

describe('# ModelResolver', () => {
    it('should find homeModel', () => {
        const model = new modelResolver({
            models: {
                paths: ['./tests/models'],
                suffix: 'Model'
            }
        }, new DI({}));

        assert.property(model('home'), 'fetch');
        assert.equal(model.name, 'getModel');
    });
});

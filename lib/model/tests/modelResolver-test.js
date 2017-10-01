const chai = require('chai');
const assert = chai.assert;
const modelResolver = require('../modelResolver');
const DI = require('../../di/injector');

describe('# ModelResolver', () => {
    it('should find homeModel', () => {
        const model = new modelResolver({
            models: {
                paths: ['./lib/model/tests/models'],
                suffix: 'Model'
            }
        }, new DI({}));

        assert.property(model('home'), 'fetch');
        assert.equal(model.name, 'getModel');
    });
});

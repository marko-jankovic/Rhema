const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

const Timer = require('../index');

describe('# Timer', () => {
    beforeEach(() => {
        global.logger = {
            info: sinon.spy(),
            error: sinon.spy(),
            debug: sinon.spy(),
            warn: sinon.spy()
        };

        global.metrics = {
            increment: sinon.spy(),
            gauge: sinon.spy(),
            timing: sinon.spy()
        };
    });

    it('Test timer start/end', () => {
        const timerStart = Timer.start('Pipeline.Timer');
        const timerEnd = Timer.end('Pipeline.Timer');

        assert.typeOf(timerEnd, 'number');
        assert.typeOf(timerStart, 'array');

        assert.typeOf(timerStart[0], 'number');
        assert.typeOf(timerStart[1], 'number');
    });
});

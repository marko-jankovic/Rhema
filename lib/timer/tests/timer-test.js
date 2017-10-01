const chai = require('chai');
const assert = chai.assert;

const Timer = require('../index');

describe('# Timer', () => {
    const timer = new Timer();

    it('Test timer start/end', () => {
        const timerStart = timer.start('Pipeline.Timer');
        const timerEnd = timer.end('Pipeline.Timer');

        assert.typeOf(timerEnd, 'number');
        assert.typeOf(timerStart, 'array');

        assert.typeOf(timerStart[0], 'number');
        assert.typeOf(timerStart[1], 'number');
    });
});

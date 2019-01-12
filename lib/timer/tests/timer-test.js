const assert = require('@rhema/testing').assert;
const Timer = require('../index');

describe('# Timer', () => {
    it('Test timer start/end', () => {
        const timerStart = Timer.start('Pipeline.Timer');
        const timerEnd = Timer.end('Pipeline.Timer');

        assert.typeOf(timerEnd, 'number');
        assert.typeOf(timerStart, 'array');

        assert.typeOf(timerStart[0], 'number');
        assert.typeOf(timerStart[1], 'number');
    });
});

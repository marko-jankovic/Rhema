const assert = require('@rhema/testing').assert;
const syslog = require('../lib/syslog');

describe('# Syslog trasport', () => {
    it('should transport data to UDP', () => {
        const data = {
            timestamp: 'Aug 03 20:44:02',
            message: 'Finished pipeline   - timer finished after 1.432 ms  (/lib/logger/tests/logger-test.js:113)',
            title: 'INFO',
            level: 3,
            args: {
                0: 'Finished pipeline ',
                1: ' - timer finished after 1.432 ms  (/lib/logger/tests/logger-test.js:113)'
            },
            file: '',
            pos: '',
            line: '',
            path: '',
            method: '',
            requestId: '',
            namespace: 'mast-blahstory-autos',
            hostname: 'Markos-MacBook-Pro-4.local',
            processId: 67424,
            output: 'Aug 03 20:44:02 Markos-MacBook-Pro-4.local mast-blahstory-autos: INFO  Finished pipeline   - timer finished after 1.432 ms  (/lib/logger/tests/logger-test.js:113) (#pid 67424)'
        };
        const transport = syslog({
            blackList: [],
            port: 514,
            facility: 17,
            tag: '@rhema/test'
        });

        assert.isTrue(transport(data));
    });
});

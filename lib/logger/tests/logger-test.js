const assert = require('@rhema/testing').assert;
const Logger = require('../index');

describe('# Logger', () => {
    let logger = null;
    beforeEach(() => {
        logger = new Logger({
            settings: {
                formats: {
                    default: '{{timestamp}} {{hostname}} {{namespace}}: {{title}} {{requestId}} {{message}} (#pid {{processId}})',
                    error: '{{timestamp}} {{hostname}} {{namespace}}: {{title}} {{requestId}} {{message}} {{path}} (#pid {{processId}})\nCall Stack:\n{{stack}}'
                },
                dateformat: 'mmm dd HH:MM:ss',
                strategy: 'console',
                level: 'log',
                methods: [
                    'log', 'trace', 'debug', 'info', 'warn', 'error'
                ],
                namespace: 'Mast Blahstory Autos'
            },
            transports: {
                beatle: {
                    path: './lib/logger/lib/beatle.js',
                    envLevel: 'prod',
                    options: {
                        blackList: []
                    }
                },
                syslog: {
                    path: './lib/logger/lib/syslog.js',
                    envLevel: '!dev',
                    options: {
                        blackList: [],
                        port: 514,
                        facility: 17,
                        tag: 'Mast Blahstory Autos'
                    }
                },
                console: {
                    path: './lib/logger/lib/console.js',
                    enabled: false,
                    options: {
                        name: 'Mast Blahstory Autos'
                    }
                }
            }
        });
    });

    it('Test Logger:info', () => {
        const info = logger.info('info');
        assert.equal(info.message, 'info');
        assert.equal(info.level, '3');

        assert.equal(info.namespace, 'mast-blahstory-autos');
    });

    it('Test Logger:error', () => {
        const error = logger.error('error');
        assert.equal(error.message, 'error');
        assert.property(error, 'stack', 'Should have {stack} property');
        assert.equal(error.namespace, 'mast-blahstory-autos');
    });
});

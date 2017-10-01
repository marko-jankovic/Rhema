const chai = require('chai');
const assert = chai.assert;
const baseConfig = require('../../app/baseConfig.json');

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
        process.env.NODE_ENV = 'alpha';
    });

    it('Test Logger:info', () => {
        const info = logger.info('info');
        assert.equal(info.message, 'info (/lib/logger/tests/logger-test.js:55::it)');
        assert.equal(info.level, '3');

        assert.equal(info.namespace, 'mast-blahstory-autos');
    });

    it('Test Logger:error', () => {
        const error = logger.error('error');
        assert.equal(error.message, 'error (/lib/logger/tests/logger-test.js:63::it)');
        assert.property(error, 'stack', 'Should have {stack} property');
        assert.equal(error.namespace, 'mast-blahstory-autos');
    });

    it('Test Logger:preprocess', () => {
        const os = require('os');
        const preprocess = logger.preprocess({
            timestamp: 'Jul 19 17:32:58',
            message: '',
            title: 'info',
            level: 3,
            args: {
                0: 'info',
                1: ' (/lib/logger/tests/logger-test.js:17)'
            }
        });
        assert.equal(preprocess.hostname, os.hostname());
        assert.property(preprocess, 'processId');
    });
});

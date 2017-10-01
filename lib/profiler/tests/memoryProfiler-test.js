const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const MemoryProfiler = require('../lib/memoryProfiler');

describe('# Memory Profiler', () => {
    const memoryProfiler = new MemoryProfiler({
        envLevel: 'alpha',
        thresholdIndex: 600,
        thresholdIncrement: 50,
        upperBounds: 1000,
        pollInterval: 15000,
        generateFlame: true,
        export: {
            main: 'build/profiler/heapsnapshot'
        }
    });

    it('Test MemoryProfiler::pidUsage', function (done) {
        this.timeout(5000);

        const pidInterval = memoryProfiler.pidUsage(2000, (data) => {
            try {
                assert.property(data, 'cpu');
                assert.property(data, 'memory');
                clearInterval(pidInterval);
            } catch (e) {
                return done(e);
            }

            done();
        });
    });

    it('Test MemoryProfiler::createHeapdumpPath', function (done) {
        this.timeout(3000);

        memoryProfiler.createHeapdumpPath({ name: 'interval', pathPrefix: ['400Mb'] }, (err, dumpPath) => {
            assert.isString(dumpPath);
            assert.isNull(err);

            memoryProfiler.createHeapdumpPath('dump', (err, dumpPath) => {
                assert.isString(dumpPath);
                assert.isNull(err);
                done();
            });
        });
    });
});

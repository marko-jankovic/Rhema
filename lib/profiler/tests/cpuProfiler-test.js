const assert = require('@rhema/testing').assert;
const fs = require('fs');
const CpuProfiler = require('../lib/cpuProfiler');

describe('# CPU Profiler', () => {
    const cpuProfiler = new CpuProfiler({
        envLevel: 'alpha',
        profilingTime: 500,
        timeOutInterval: 500,
        export: {
            main: 'build/profiler/cpuprofile'
        }
    });

    it('Test CPU Profiler::startProfiling', function (done) {
        this.timeout(5000);

        cpuProfiler.startProfiling((err, filePath) => {
            try {
                if (!err) {
                    cpuProfiler.cancelProfiling();
                    const stat = fs.statSync(filePath);

                    if (stat) {
                        assert.isTrue(stat.isFile(), 'file should be created!');
                    }
                }
            } catch (e) {
                return done(e);
            }

            done();
        });
    });
});

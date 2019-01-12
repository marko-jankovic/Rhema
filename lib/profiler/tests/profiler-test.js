const assert = require('@rhema/testing').assert;
const fs = require('fs');
const path = require('path');
const Profiler = require('../index');

describe('# Profiler', () => {
    let profiler;

    beforeEach(() => {
        profiler = new Profiler({
            memory: {
                envLevel: 'prod',
                thresholdIndex: 600,
                thresholdIncrement: 50,
                upperBounds: 1000,
                pollInterval: 15000,
                generateFlame: true,
                export: {
                    main: 'build/profiler/heapsnapshot'
                }
            },
            cpu: {
                envLevel: 'prod',
                profilingTime: 5000,
                timeOutInterval: 60000,
                export: {
                    main: 'build/profiler/cpuprofile'
                }
            },
            testDir: {
                export: {
                    main: 'build/profiler/testDir'
                }
            }
        });

        profiler.startProfiler();
    });

    it('Test Profiler::startProfiler', function (done) {
        this.timeout(5000);
        const pid = String(process.pid);
        const filePath = path.resolve(process.cwd(), 'build/profiler/heapsnapshot/', pid, 'start');

        setTimeout(() => {
            const stat = fs.statSync(filePath);
            if (stat) {
                assert.isTrue(stat.isDirectory(), 'folder should be created!');
            }
            done();
        }, 2000);
    });

    it('Test Profiler::prepareDir', function (done) {
        this.timeout(5000);
        const pid = String(process.pid);
        const filePath = path.resolve(process.cwd(), 'build/profiler/testDir/', pid);

        profiler.prepareDir('testDir', () => {
            try {
                const stat = fs.statSync(filePath);
                if (stat) {
                    assert.isTrue(stat.isDirectory(), 'folder should be created!');
                }
            } catch (e) {
                return done(e);
            }

            done();
        });
    });
});

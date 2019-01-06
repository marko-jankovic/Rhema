'use strict';

const utils = require('@rhema/utils');
const path = require('path');
const mkdirp = require('mkdirp');
const CpuProfiler = require('./lib/cpuProfiler');
const MemoryProfiler = require('./lib/memoryProfiler');

// Allow easier Memory and CPU performance profiling by creating snapshots and detecting memory leaks
// All snapshots can be imported and compare in Chrome Profiler
// - {v8-profiler} provides binding for v8 profiler and methods for HEAP Snapshot and CPU Profile
// - {memwatch-next} (node-memwatch fork since it is abandoned from Mart 2013) provides leak and stats events
// - {pusage} provides CPU and Memory use for current pid in percentage
const Profiler = function Profiler (options) {
    // Started at the same time as Server
    this.startProfiler = function startProfiler (callback) {
        const cpuProfiler = new CpuProfiler(options.cpu);
        const memoryProfiler = new MemoryProfiler(options.memory);

        if (utils.env.isActive(options.memory)) {
            this.prepareDir('memory', () => {
                memoryProfiler.trackMemoryUsage((err, event) => {
                    if (!err && event.type) {
                        logger.warn('Profiler detect', event.type, 'issue!');
                        // cancel cpu profiling
                        cpuProfiler.cancelProfiling();
                        // emit {memoryLeak} or {memoryUpperBound}
                        callback(event.type);
                    } else {
                        logger.error(err);
                    }
                });
            });
        }

        if (utils.env.isActive(options.cpu)) {
            this.prepareDir('cpu', () => {
                setTimeout(() => {
                    cpuProfiler.startProfiling();
                }, 10000);
            });
        }
    };

    // remove old folders (delete all cpu and heap files)
    // and create new folders
    this.prepareDir = function prepareDir (type, calback) {
        const folderPath = path.resolve(process.cwd(), options[type].export.main);
        const fullPath = `${folderPath}/${process.pid}`;

        logger.info('Preparing profiler "%s" dir...', type);

        // Recursively mkdir
        mkdirp(fullPath, (err) => {
            if (err) {
                logger.error('Error: Profiler "%s" dirs did not created', type, err.stack);
            } else {
                logger.info('Profiler "%s" dir created', type, fullPath);

                // delete folders older than 5min
                // we can't delete folders immediately because
                // each worker will delete folders from previous instace
                if (utils.env.isLocal()) {
                    utils.fs.prune(options[type].export.main, { olderThan: `300 seconds` }, (err, paths) => {
                        if (err) {
                            logger.error('Error: Profiler "%s" did not remove old files!', type, err.stack);
                        }
                    });
                }
            }

            calback(err);
        });
    };
};

module.exports = Profiler;

'use strict';

const v8profiler = require('v8-profiler-next');
const utils = require('@rhema/utils');
const memwatch = require('@airbnb/node-memwatch');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const mkdirp = require('mkdirp');
const pusage = require('pidusage');
const hostname = require('os').hostname();

// @TODO - need refactoring
// For better understanding how to analize Heap Snapshots and what are:
// Shallow Size, Retained Size or Retaining Paths - you should read those posts
// https://developers.google.com/web/tools/chrome-devtools/memory-problems/memory-101
// https://developer.chrome.com/devtools/docs/memory-analysis-101
// https://developer.chrome.com/devtools/docs/heap-profiling
// https://blog.jetbrains.com/webstorm/2015/07/node-js-profiling-in-webstorm-part-2-memory-profiling/
// https://addyosmani.com/blog/taming-the-unicorn-easing-javascript-memory-profiling-in-devtools/

// * Shallow size - The size of memory that is held by the object itself
// * Retained size - The size of memory that is freed once the object itself
// is deleted along with its dependent objects that were made unreachable from GC roots
const MemoryProfiler = function MemoryProfiler (options) {
    // Track Memory usage and detect leaks
    // Prepare memory directory, and initial HEAP Snapshot
    // Initial Snaphot is important for later comparing in Chrome Profiler tool
    // Check Memory usage every pollInterval seconds and if RSS is bigger that memThreshold,
    // create snapshot and increase memThreshold for thresholdIncrement
    // if RSS is upperBounds, there is probably Memory Leak,
    // create snapshot and emit 'memoryUpperBound' event for Gracefully Restart in Server
    this.trackMemoryUsage = function trackMemoryUsage (callback) {
        logger.info('Profiler: Started Memory Profiling...');

        const MB = 1024 * 1024;
        const increment = MB * parseInt(options.thresholdIncrement);
        const upperBounds = MB * parseInt(options.upperBounds);
        let memThreshold = MB * parseInt(options.thresholdIndex);

        // create dump initially
        this.createSnapshot('start');

        // create dump on memory leaks
        this.runMemwatch(callback);

        // get memory size for current process.pid
        const pidInterval = this.pidUsage(options.pollInterval, (data) => {
            const rss = parseInt(data ? data.memory : 0);
            const rssMb = utils.math.bytesToSize(rss, 2);

            metrics.gauge('Server.Profiler.Memory.Rss', rss);

            // create heapdump if rss i bigger than memThreshold
            if (rss > memThreshold) {
                // memory upper bound
                // emit event so we can gracefully
                // restart worker
                if (rss > upperBounds) {
                    logger.info('RSS Memory usage is Upper Bounds: %s, Create Snapshot...', rssMb);
                    clearInterval(pidInterval);

                    callback(null, { type: 'memoryUpperBound' });
                } else {
                    // set memThreshold to be as rss
                    // this will decrease number of snapshots
                    // if RSS jumps too fast
                    memThreshold = rss;
                    logger.info('RSS Memory usage is higher than %s, RSS %s Create Snapshot...', utils.math.bytesToSize(memThreshold), rssMb);
                }

                this.createSnapshot({ name: 'interval', pathPrefix: [rssMb] });

                // increase memThreshold
                memThreshold += increment;
            }
        });
    };

    // keep an eye on your memory usage, and discover and isolate leaks.
    // createSnapshot HEAP snapshots if Leak is detected and emit event
    // which we are using for Gracefully Restart in Server
    // for local testing we can force leak
    // setInterval(function () {
    //     memwatch.emit('leak', {"mare": "care"});
    // }, 5000);
    this.runMemwatch = function runMemwatch (callback) {
        // By default leaks are defined as 5 consecutive calls
        // to the garbage collector that result in an increase of memory.
        if (memwatch.set_consecutive_growth_limit) {
            memwatch.set_consecutive_growth_limit(options.mwConsecutiveGrowthLimit || 5);
        }

        // Two different algorithms are used to determine leak detections.
        // One is used for initial startup when memory is being allocated
        // for loading modules and the other is for when Node.js is in a standard
        // running state where memory allocations are less frequent.
        // set_recent_period method is used to set how many garbage compactions are triggered
        // on startup before switching from the first leak detection algorithm to the second.
        if (memwatch.set_recent_period) {
            memwatch.set_recent_period(options.mwRecentPeriod || 10);
        }

        // Algorithm that detect leaks uses a moving window over a period of garbage
        // compactions with a decaying weight applied to older garbage compactions.
        // Set the number of garbage compactions used in the moving window
        if (memwatch.set_ancient_period) {
            memwatch.set_ancient_period(options.mwAncientPeriod || 120);
        }

        // The min and max stats report the most extreme values we've seen for
        // base heap size and are only recorded after the first 3 GC's, by default.
        if (memwatch.set_extremes_period) {
            memwatch.set_extremes_period(options.mwExtremesPeriod || 3);
        }

        const infoPath = `${options.export.main}/${process.pid}`;
        let snapshotTaken = false;
        let heapDiff = null;
        let leakCounter = 0;
        const profileData = {
            lastGC: null,
            lastLeak: null,
            firstDiff: null,
            lastDiff: null
        };

        // diff object {
        //  "before": { "nodes": 11625, "size_bytes": 1869904, "size": "1.78 mb" },
        //  "after":  { "nodes": 21435, "size_bytes": 2119136, "size": "2.02 mb" },
        //  "change": { "size_bytes": 249232, "size": "243.39 kb", "freed_nodes": 197,
        //  "allocated_nodes": 10007,
        //  "details": [
        //    { "what": "String",
        //      "size_bytes": -2120, "size": "-2.07 kb",  "+": 3, "-": 62
        //    },
        //    { "what": "LeakingClass",
        //      "size_bytes": 239952, "size": "234.33 kb", "+": 9998, "-": 0
        //    }
        //  ]
        // }
        // When V8 performs a garbage collection
        // full GC with heap compaction,
        // memwatch will emit a stats event.
        // stats object {
        //  "num_full_gc": 17,
        //  "num_inc_gc": 8,
        //  "heap_compactions": 8,
        //  "estimated_base": 2592568,
        //  "current_base": 2592568,
        //  "min": 2499912,
        //  "max": 2592568,
        //  "usage_trend": 0
        // }
        // Memwatch splits its results into two Periods.
        // RECENT_PERIOD which takes 10 consecutive GCs and the
        // ANCIENT_PERIOD which is 120 consecutive GCs.
        // "estimated_base" - Heap Size after 10 consecutive GCs have been executed => RECENT_PERIOD.
        // "current_base" - Heap size exactly after a GC.
        // "min" - min value recorded for the Heap size for the given period.
        // "max" - max value recorded for the Heap size for the given period.
        // "usage_trend" - if it is consistently positive, it indicates
        // that your base heap size is continuously growing and you might have a leak.
        memwatch.on('stats', (stats) => {
            profileData.lastGC = stats;
            stats.timestamp = moment().format('llll');

            // create diff
            if (!snapshotTaken) {
                heapDiff = new memwatch.HeapDiff();
                snapshotTaken = true;
            }

            Object.keys(stats).forEach((key) => {
                // send stats to metrics
                if (typeof stats[key] === 'number') {
                    metrics.gauge(`Server.Profiler.GC.${key}`, stats[key]);
                }
            });
        });

        // listen for memory leak event
        // info object {
        //  start: Fri, 29 Jun 2012 14:12:13 GMT,
        //  end: Fri, 29 Jun 2012 14:12:33 GMT,
        //  growth: 67984,
        //  reason: 'heap growth over 5 consecutive GCs (20s) - 11.67 mb/hr'
        // }
        memwatch.on('leak', (info) => {
            logger.error('Memory Leak Detected!');

            if (snapshotTaken && leakCounter < options.mwMaxSnapshots) {
                // create snapshot as soon as posible
                // save max 10 leak shapshots
                leakCounter++;

                this.createSnapshot('leak');

                let diff = heapDiff ? heapDiff.end() : null;
                const diffFile = path.resolve(process.cwd(), infoPath, 'gc-diff.json');

                info.timestamp = diff.timestamp = moment().format('llll');
                profileData.lastLeak = info;

                // sort diff details and take only first 5
                diff.change.details = utils.object.sortBy(diff.change.details, (a, b) => b['+'] - a['+']).splice(0, 5);

                if (!profileData.firstDiff) {
                    profileData.firstDiff = diff;
                } else {
                    profileData.lastDiff = diff;
                }

                if (Object.keys(diff).length !== 0) {
                    fs.writeFile(diffFile, utils.json.safeStringify(profileData), (error) => {
                        if (!error) {
                            logger.info('Heap Diff', diffFile, 'Created');
                        }
                    });

                    // reset data
                    diff = null;
                    heapDiff = null;
                    snapshotTaken = false;

                    callback(null, { type: 'memoryLeak' });
                }

                metrics.increment('Server.Profiler.Memory.Leak');
            }
        });
    };

    // Create and export HEAP Snapshot
    this.createSnapshot = function createSnapshot (fileOptions) {
        let snapshot = v8profiler.takeSnapshot(`heapSnapshot-${process.pid}`);
        let infoExports = { [hostname]: { heapSnapshots: {} } };

        logger.info('Profiler: Snapshot taken! Exporting in progress...');

        this.createHeapdumpPath(fileOptions, (err, dumpPath) => {
            const exportDone = (err) => {
                if (err) {
                    logger.error('Heap Snapshot Error:', err.stack);
                } else {
                    logger.info('Heap Snapshot', dumpPath, 'Created');

                    if (options.export.info) {
                        infoExports[hostname].heapSnapshots[process.pid] = [{
                            file: dumpPath.split('/').slice(-5).join('/'),
                            date: moment().format('MMM D HH:MM:ss')
                        }];

                        const infoPath = path.resolve(process.cwd(), options.export.info);
                        utils.json.updateFile(infoPath, infoExports, 'servers', (err) => {
                            if (!err) {
                                infoExports = null;
                                logger.info('Profiler: Updated info.json file!');
                            }
                        });
                    }
                }

                // reset data
                snapshot.delete();
                snapshot = null;
            };

            // Export snapshot to file stream
            snapshot.export()
                .on('error', exportDone)
                .pipe(fs.createWriteStream(dumpPath))
                .on('error', exportDone)
                .on('finish', exportDone);
        });
    };

    // create HEAP path
    this.createHeapdumpPath = function createHeapdumpPath (fileOptions, callback) {
        let pathPrefix = [];
        const heapdumpName = `time-${Date.now()}`;
        // it could be in json format if we want
        const extension = options.extension || '.heapsnapshot';
        let name = '';

        if (typeof fileOptions !== 'object') {
            name = fileOptions;
        } else {
            name = fileOptions.name;
            pathPrefix = pathPrefix.concat(fileOptions.pathPrefix);
        }

        pathPrefix = pathPrefix.concat(heapdumpName);

        const folderPath = path.resolve(options.export.main, String(process.pid), name);
        const filePath = `${folderPath}/${pathPrefix.join('-')}${extension}`;

        // Recursively mkdir
        mkdirp(folderPath, (err) => {
            callback(err, filePath.replace(/\s+/, '-'));
        });
    };

    // return process memory usage
    this.pidUsage = function pidUsage (interval, callback) {
        return setInterval(() => {
            // @todo - upgrade pidusage
            pusage.stat(process.pid, (err, stat) => {
                callback(err ? null : stat);
            });
            // Unmonitor process
            pusage.unmonitor(process.pid);
        }, interval); // check pid usage every intervalTime
    };

    // Receive messages from the Master process.
    process.on('message', (message) => {
        if (message.msgFromMaster.type === options.processMessage) {
            logger.info('Profiler: Manual Heap Snapshot...');

            const pidInterval = this.pidUsage(options.pollInterval, (data) => {
                clearInterval(pidInterval);
                const rss = parseInt(data ? data.memory : 0);
                const rssMb = utils.math.bytesToSize(rss, 2);

                this.createSnapshot({ name: 'manual', pathPrefix: [rssMb] });
            });
        }
    });
};

module.exports = MemoryProfiler;

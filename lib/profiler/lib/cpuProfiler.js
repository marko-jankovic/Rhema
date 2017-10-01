'use strict';

const v8profiler = require('@risingstack/v8-profiler');
const utils = require('../../utils');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const hostname = require('os').hostname();

// https://blog.jetbrains.com/webstorm/2015/05/node-js-profiling-in-webstorm-part-1-cpu-profiling/
// *** Additonal profiling is done with v8 --pref
//  - node arguments are added in cluster setupMaster.execArgv": ["--prof", "--logfile=build/profiler/v8.log","--log-timer-events"]
//  - for parsing v8 logs use "node --prof-process grep build/profiler/*v8.log > build/profiler/prof.txt"
const CpuProfiler = function CpuProfiler (options) {
    let gracefulRestart = false;

    // Start CPU profiling with unique namespace based
    // and Stop profiling after profilingTime interval
    this.startProfiling = function startProfiling (callback) {
        const profileName = `cpu-profile-${process.pid}`;

        // Queue the function behind I/O events callbacks that are already in the event queue
        v8profiler.startProfiling(profileName, options.generateFlame);

        logger.info('Profiler: Started CPU Profiling...');

        // profilingTime interval ensure we won't stuck CPU
        const timeout = setTimeout(() => {
            try {
                const cpuProfiler = v8profiler.stopProfiling(profileName);

                if (cpuProfiler) {
                    this.exportProfile(cpuProfiler, callback);
                } else {
                    v8profiler.deleteAllProfiles();

                    if (callback) {
                        callback(null, null);
                    }
                }
            } catch (e) {
                v8profiler.deleteAllProfiles();

                logger.error('CPU Profile Error:', e.stack);

                if (callback) {
                    callback(e, null);
                }
            }
        }, options.profilingTime);

        timeout.unref();
    };

    // Export CPU profiling and create asynchronously a cpuprofile in static folder
    // Start again after timeOutInterval
    // Rembember only last 10 profiles
    // File name is unique, based on current time and it is inside /{pid} folder
    this.exportProfile = function exportProfile (cpuProfiler, callback) {
        logger.info('Profiler: Stoping CPU Profiling...');
        // it could be also in json format if we want
        const extension = options.extension || '.cpuprofile';
        // profiler path based on process pid
        const profileFolder = path.resolve(process.cwd(), options.export.main, String(process.pid));
        // profile name is current time + extension
        const profileName = `time-${Date.now()}${extension}`;
        // clearTime determine what are "old files" - files older than {clearTime} seconds
        const clearTime = ((options.profilingTime + options.timeOutInterval) / 100);
        // full profile path
        const profilePath = path.resolve(profileFolder, profileName);
        // object for temp keeping cpu info before it is exported
        const infoExports = { [hostname]: { cpuProfiles: {} } };
        // const numberOfFiles = 10;

        // save latest 10 files
        utils.fs.prune(options.export.main, { olderThan: `${clearTime} seconds` }, () => {
            logger.info('Profiler: FindRemove old files is finished.');

            const exportDone = (err) => {
                if (err) {
                    logger.error('CPU Profile Error:', err.stack);
                } else {
                    logger.info('CPU Profile', profilePath, 'Created');

                    // start profiling again after timeOutInterval
                    // interval ensure we won't stuck CPU
                    const timeout = setTimeout(() => {
                        if (!gracefulRestart) {
                            this.startProfiling();
                        }
                    }, options.timeOutInterval);

                    timeout.unref();

                    if (options.export.info && !gracefulRestart) {
                        infoExports[hostname].cpuProfiles[process.pid] = [{
                            file: profilePath.split('/').slice(-4).join('/'),
                            date: moment().format('MMM D HH:MM:ss')
                        }];

                        const infoPath = path.resolve(process.cwd(), options.export.info);

                        utils.json.updateFile(infoPath, infoExports, 'servers', (updateErr) => {
                            if (!updateErr) {
                                logger.info('Profiler: Updated info.json file!');
                            }
                        });
                    }
                }

                // delete old profile
                cpuProfiler.delete();
                // reset profiler
                cpuProfiler = null;

                if (callback) {
                    callback(err, profilePath);
                }
            };

            // Export cpu profile to file stream
            cpuProfiler.export()
                .on('error', exportDone)
                .pipe(fs.createWriteStream(profilePath))
                .on('error', exportDone)
                .on('finish', exportDone);
        });
    };

    this.cancelProfiling = function cancelProfiling () {
        gracefulRestart = true;
    };
};

// not implemented yet
// https://github.com/dhruvramani/Parsed-V8-Node-Memory-Profiler/blob/master/V8NodeProfiler.js
// Profiler.prototype.convertProfNode = function convertProfNode (node) {
//     var data = {
//         functionName: node.functionName,
//         lineNumber: node.lineNumber,
//         callUID: node.callUID,
//         hitCount: node.hitCount,
//         url: node.url,
//         children: []
//     };
//
//     for (var i = 0; i < node.children.length; i++) {
//         data.children.push(this.convertProfNode(node.children[i]));
//     }
//
//     return data;
// };

// simplify cpu profile repsonse, not implemented yet
// Profiler.prototype.prof2cpuprofile = function prof2cpuprofile (prof) {
//     return {
//         head: this.convertProfNode(prof.head),
//         startTime: prof.startTime,
//         endTime: prof.endTime
//     };
// };

module.exports = CpuProfiler;

'use strict';

const fs = require('fs');
const path = require('path');
const toMs = require('../app').toMs;
const pathUtils = require('./path');

// @todo extension, blackList, whiteList, biggerThan, write tests
exports.prune = (mainPath, options, callback) => {
    this.getPaths = (currentPath, options, iterator, pathsToDelete = []) => {
        // get full path
        mainPath = path.resolve(process.cwd(), mainPath);

        // async read dir
        fs.readdir(currentPath, (readdirErr, filesInDir) => {
            if (readdirErr) {
                return iterator(readdirErr);
            }

            if (!filesInDir.length) {
                return iterator(null, pathsToDelete);
            }

            // wrapp current callback
            const next = this.wrappedCallback(filesInDir.length, iterator);

            filesInDir.forEach((file) => {
                // create full path
                const subPath = path.join(currentPath, file);

                // async stat, return file informations
                fs.stat(subPath, (statErr, fileStats) => {
                    if (fileStats.isDirectory()) {
                        // unshift to pathsToDelete
                        // lastest folder should be first element in array
                        // and he will be deleted first
                        if (this.shouldDelete(subPath, options, fileStats, 'dir')) {
                            pathsToDelete.unshift({ type: 'dir', path: subPath });
                        }

                        if (options.recursive !== false) {
                            this.getPaths(subPath, options, next, pathsToDelete);
                        } else {
                            return next(statErr, pathsToDelete);
                        }
                    } else {
                        // unshift to pathsToDelete
                        // lastest file should be first element in array
                        // and he will be deleted first
                        if (this.shouldDelete(subPath, options, fileStats, 'file')) {
                            pathsToDelete.unshift({ type: 'file', path: subPath });
                        }

                        return next(statErr, pathsToDelete);
                    }
                });
            });
        });
    };

    // async series
    // iterate through array of functions, starting from first
    // execute next function when current function returns callback
    this.seriesCallback = (arrOfFunctions, callback) => {
        const length = arrOfFunctions.length;
        const iterator = (index) => {
            // run current function
            arrOfFunctions[index]((err) => {
                if (err) {
                    return callback(err);
                }

                if (index < length - 1) {
                    setImmediate(iterator, index + 1);
                } else {
                    // last function return final callback
                    return callback(null);
                }
            });
        };

        iterator(0);
    };

    // return callback when async iterations is done
    this.wrappedCallback = (filesLength, callback) => {
        let i = 0;
        let done = false;

        return (err, file) => {
            if (done) {
                return;
            }

            if (err) {
                done = true;
                callback(err, null);
            }

            i++;
            if (i === filesLength) {
                callback(err, file || true);
            }
        };
    };

    // calculate current file/folder age
    this.isOlderThan = (currentPath, options, fileStats, type) => {
        const ctime = fileStats.ctime.getTime();
        const ms = toMs(options);
        const age = ms ? ctime + ms : false;

        if (age) {
            return age < new Date().getTime();
        }

        return false;
    };

    this.isInRemoveList = (currentPath, options, fileStats, type) => {
        if (type === 'dir') {
            const dirName = pathUtils.getDirName(currentPath, 2);

            return options.directories.includes(dirName);
            //
        } else {
            //
            const fileName = pathUtils.getFileName(currentPath).toLowerCase();
            const extName = pathUtils.getExtName(currentPath);

            const removeExtension = options.extensions.includes(extName);
            const removeFile = options.files.includes(fileName);

            return removeExtension || removeFile;
        }
    };

    this.shouldDelete = (currentDir, options, fileStats, type) => {
        if (options.olderThan) {
            return this.isOlderThan(currentDir, options.olderThan, fileStats, type);
            //
        } else if (options.removeList) {
            return this.isInRemoveList(currentDir, options.removeList, fileStats, type);
        }

        return false;
    };

    // prepare steps and trigger final callback
    this.getPaths(mainPath, options, (err, paths = []) => {
        const steps = [];

        // err or folder is empty
        if (err || !paths.length) {
            callback(err, []);
        } else {
            // prepare steps
            paths.forEach(file => {
                if (file.type === 'file') {
                    // Asynchronous delete file
                    steps.push(next => fs.unlink(file.path, next));
                } else {
                    // Asynchronous delete folder
                    steps.push(next => fs.rmdir(file.path, next));
                }
            });

            // execute steps tasks one after another
            // delete file and folders in series
            this.seriesCallback(steps, err => callback(err, paths));
        }
    });
};

// https://github.com/pingyhq/nm-prune/blob/master/default-prune.json
// utils.fs.prune(path.resolve(process.cwd(), 'node_modules'), {
//     removeList: {
//       "files": [
//         "makefile",
//         "gulpfile.js",
//         "gruntfile.js",
//       ],
//       "directories": [
//         "__tests__",
//         "test",
//         "tests",
//         "powered-test"
//       ],
//       "extensions": [".md", ".ts", ".jst", ".coffee", "*.1", "*.patch", "*~"]
//     }
// }, (err, paths) => {
//     console.log(paths, '----------')
// });
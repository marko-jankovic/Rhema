'use strict';

const fs = require('fs');
const path = require('./path');
const fn = require('../function');
const mkdirp = require('mkdirp');
const { promisify } = require('util');

module.exports = {
    // Check if file exists
    fileExistsSync (filePath) {
        return fs.existsSync(filePath) ? true : false;
    },

    // Return {true} if the filePath is a directory.
    isDirSync (filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (e) {
            return false;
        }
    },

    // True if the filePath is a file.
    isFileSync (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    },

    // Read a file synchronously
    readFileSync (options) {
        let fullPath = path.resolve(options.path);

        if (options.dirname) {
            fullPath = path.resolve(options.dirname, options.path);
        }

        try {
            return fs.readFileSync(fullPath, options.encoding || 'utf8');
        } catch (e) {
            throw e;
        }
    },

    readdirSync (filePath) {
        return fs.readdirSync(path.resolve(filePath));
    },

    // Asynchronously create dirs and any intermediate dirs
    async mkdir (dirPath) {
        const mkdir = promisify(mkdirp);
        return await fn.ensureAsync(mkdir(dirPath));
    },

    // type can be isFile or isDirectory
    checkStatType (type, path, callback) {
        fs.stat(path, (statErr, fileStats) => {
            if (fileStats && fileStats[type] && fileStats[type]()) {
                callback(statErr, true, fileStats);
            } else {
                callback(statErr, false);
            }
        });
    },

    unlinkFile (filePath, callback) {
        if (callback) {
            // check for filePath
            fs.stat(filePath, (statErr) => {
                if (statErr) {
                    callback(statErr);
                } else {
                    // unlink filePath
                    fs.unlink(filePath, unlinkErr => callback(unlinkErr));
                }
            });
        } else {
            try {
                // unlink filePath
                fs.unlinkSync(filePath);
                return true;
            } catch (err) {
                return err;
            }
        }
    },

    async createWriteStream (dest, options) {
        const dir = path.getDirName(dest);
        const fsStat = promisify(fs.stat);

        const stats = await fn.ensureAsync(fsStat(dir));

        if (stats.res) {
            return fs.createWriteStream(dest, options);
        } else {
            const createDir = await this.mkdir(dir);

            if (createDir) {
                return fs.createWriteStream(dest, options);
            }
        }
    },

    writeFile (dest, data, options, callback) {
        const dir = path.getDirName(dest);

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        fs.stat(dir, (err) => {
            if (err && err.code !== 'ENOENT') {
                callback(err);
            } else if (!err) {
                fs.writeFile(dest, data, options, callback);
            } else {
                mkdirp(dir, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        fs.writeFile(dest, data, options, callback);
                    }
                });
            }
        });
    }
};

'use strict';

const path = require('path');
const arr = require('../array');
const str = require('../string');

// https://github.com/oss6/path-util/blob/master/lib/index.js
// https://github.com/jblas/path-utils/blob/master/path-utils.js
// https://github.com/ivan-kleshnin/pathz/blob/master/index.js

module.exports = {
    // Directory path excluding filename.
    getDirName (filePath, level = 0) {
        if (level && str.count(filePath, '/') > 0) {
            const parts = filePath.split('/');

            let index = parts.length - level;

            if (index < 0) {
                index = 0;
            }

            return parts.splice(index, level).join('/');
        } else {
            return path.dirname(filePath) || false;
        }
    },

    getParentDirName (url = '', level = 1) {
        const dirName = this.getDirName(url);
        const parts = dirName.split('/').filter(segment => segment !== '' && segment !== '.');

        if (parts.length > 0) {
            let index = parts.length - level;

            if (index < 0) {
                index = 0;
            }

            url = parts.splice(index, level).join('/');
        }

        return url;
    },

    // Get extension name
    getExtName (filePath) {
        return path.extname(filePath) || false;
    },

    removeExt (filePath) {
        const extLength = this.getExtName(filePath).length;
        return filePath.slice(0, -extLength);
    },

    // File name
    getFileName (filePath) {
        if (!filePath) {
            return null;
        }

        return path.basename(filePath);
    },

    // Normalize file path.
    normalizePath (filePath) {
        // Remove slash
        return path.normalize(filePath).replace(/[\/]$/, '');
    },

    // Resolve a filepath, also normalizes and removes trailing slashes.
    resolve () {
        const paths = path.resolve(...arr.argsToArray(arguments));
        return this.normalizePath(paths);
    }
};

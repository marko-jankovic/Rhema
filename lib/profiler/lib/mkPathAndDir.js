'use strict';

const mkdirp = require('mkdirp');
const path = require('path');

module.exports = (folderPath, fileName, callback) => {
    folderPath = Array.isArray(folderPath) ? folderPath.map(fp => String(fp)).join('/') : folderPath;
    const filePath = path.resolve(process.cwd(), folderPath, fileName);

    // Recursively mkdir
    mkdirp(folderPath, (err) => {
        callback(err, filePath);
    });
};

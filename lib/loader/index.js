'use strict';

const utils = require('@rhema/utils');
const path = require('path');
const fs = require('fs');
// setting paths (application and rhema) for easier module loading
// for core modules defined in baseConfig or "APP" config
// we only need to set lib paths e.g. ./lib/utils/index.js and it will try to find module
// first in rhema and than in application root
const appPaths = [
    process.cwd(), // returns the current working directory of the Node process
    path.resolve(__dirname, '../../'), // rhema path
    `${process.cwd()}/node_modules`,
    'node_modules'
];

// require modules by app paths
module.exports = function LoadByAppPaths (fileName, paths) {
    const staticExt = ['.html', '.css', '.txt', '.log'];
    let target = null;
    let fullPaths = [];

    if (!fileName) {
        throw new Error('File name is not defined!');
    }

    paths = paths || appPaths;

    paths.forEach((path) => {
        if (!path.startsWith('./') && !fileName.startsWith('./')) {
            fullPaths.push(`${path}/${fileName}`);
        }

        const resolved = utils.fs.resolve(path, fileName);
        if (!fullPaths.includes(resolved)) {
            fullPaths.push(resolved);
        }
    });

    // try to find module in "paths"
    fullPaths.some((filePath) => {
        try {
            if (staticExt.includes(path.extname(filePath))) {
                target = fs.readFileSync(filePath, 'utf8');
            } else {
                target = require(filePath);
            }

            fullPaths = [];
            return target;
        } catch (e) {
            // case 'MODULE_NOT_FOUND' is valid
            // since we are trying to find file on different paths
            // IF file EXIST BUT require module that not exists (Cannot find module)
            if (e.code === 'MODULE_NOT_FOUND' || e.code === 'ENOENT') {
                if (e.message.indexOf('Cannot find module') !== -1) {
                    // extract file path from error message
                    // e.g for message "Error: Cannot find module '../apiCall'"
                    // it will return just "../apiCall"
                    const cannotFindModulePath = e.message.match(/'(.*?)'/g).map(val => val.replace(/'/g, '')).join();

                    // it {path} and {cannotFindModulePath} are not equal
                    // module A with {path} exists but error is caused by
                    // requiring module B that not exists inside A
                    if (filePath !== cannotFindModulePath) {
                        e.message += ` required in ${filePath}`;
                        throw e;
                    }

                    fullPaths = [];
                }
            } else {
                // module A with VALID path
                // BUT has some SyntaxError
                throw e;
            }
        }
    });

    if (!target) {
        target = require(fileName);
    }

    return target;
};

'use strict';

const resolve = require('./path').resolve;

// Safe require
exports.safeRequire = (modulePath, dontCatchError) => {
    try {
        // forwardslash means that path is local
        // not in node_modules
        if (modulePath.indexOf('/') !== -1) {
            modulePath = resolve(modulePath);
        }

        return require(modulePath);
    } catch (err) {
        if (dontCatchError) {
            return false;
        } else {
            throw new Error(err);
        }
    }
};

'use strict';

const utils = require('../../../utils');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// if `file` flag is passed it will try to read file
// type should be md5 or sha1
const hash = (filePath, type) => {
    const cripter = crypto.createHash(type);
    let toHash;

    try {
        toHash = fs.readFileSync(path.normalize(process.cwd() + filePath));
    } catch (e) {
        toHash = filePath;
    }

    return cripter.update(toHash).digest('hex');
};

// Creating cache buster from (buld.json || package.json)
module.exports = (options) => {
    const version = utils.app.getVersion();
    const files = options.files || [];
    const cacheBusters = {};

    files.forEach((filePath) => {
        const name = path.parse(filePath).name;
        const ext = utils.string.capitalizeFirst(path.parse(filePath).ext.replace('.', ''));
        const cacheBuster = hash(filePath, 'md5');

        cacheBusters[`${name}${ext}Md5`] = cacheBuster;
        cacheBusters[`${name}${ext}`] = `?v=${cacheBuster}`;
    });

    return (req, res, next) => {
        // create random cacheBusters for each request
        // in order to avoid browser caching only on dev env
        // this is importan if you are using task managers
        // and live reload or watch tasks for compiling files
        if (utils.env.isLocal()) {
            Object.keys(cacheBusters).forEach((key) => {
                cacheBusters[key] = `?v=only-on-dev-${utils.math.getRandomInteger(1, 10000)}`;
            });
        }

        cacheBusters.buildVersion = `?v=${version}`;
        cacheBusters.version = version;

        res.locals.cacheBusters = cacheBusters;
        req.app.locals.cacheBusters = cacheBusters;

        next();
    };
};

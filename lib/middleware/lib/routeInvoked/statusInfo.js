'use strict';

const fs = require('fs');

// creating chache buster from (buld.json || package.json)
module.exports = (options) => {
    return function statusInfo (req, res, next) {
        const filePath = `${process.cwd()}/${options.path}`;

        fs.readFile(filePath, 'utf-8', (err, info) => {
            if (!err && info) {
                try {
                    info = JSON.parse(info);
                } catch (e) {
                    info = {};
                }
            }

            req.data.set({ statusInfo: info });
            next();
        });
    };
};


'use strict';

const utils = require('@rhema/utils');
const path = require('path');
const Timer = require('@rhema/timer');

// Static files timers and info
module.exports = () => {
    return (req, res, next) => {
        const fullUrl = req.getFullUrl();
        const parsePath = path.parse(fullUrl);
        // allowed file extensions
        const extensions = ['.js', '.txt', '.png', '.jpg', '.gif', '.css', '.svg', '.ico'];
        // replace cache buster
        const pathExtName = parsePath.ext.replace(/\?.*/g, '');
        const pathName = parsePath.name;

        // if extension is matched it is static file
        // create namespace based on file and extension name e.g 'logoPng' or 'styleCss'
        if (pathExtName && extensions.includes(pathExtName)) {
            const pageType = `static.${pathName}${utils.string.capitalizeFirst(pathExtName.replace('.', ''))}`;
            const namespace = `Server.Request.${pageType}.Latency`;
            Timer.start(namespace);

            logger.info(`Request to asset: ${fullUrl}`);

            res.on('finish', () => {
                Timer.end(namespace);
                Timer.clearAll();
            });
        }

        next();
    };
};

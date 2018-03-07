'use strict';

const chalk = require('chalk');
const inspect = require('util').inspect;
const utils = require('../../utils');

module.exports = (options) => {
    Object.assign(inspect.defaultOptions, options);

    // should be visible only on Dev Env
    return (data) => {
        const matchUrl = utils.regex.matchAll('url', data.message);
        const title = (data.title || 'info').toLowerCase();
        const groups = {
            info: 'green',
            log: 'green',
            trace: 'green',
            error: 'red',
            debug: 'blue',
            warn: 'yellow'
        };
        const color = groups[title];

        if (Array.isArray(matchUrl)) {
            matchUrl.forEach((url) => {
                data.message = data.message.replace(url, chalk.hex('#81a2be').underline(url));
            });
        }

        console.log(`${chalk[color](title)}: ${data.message}\n`);
    };
};

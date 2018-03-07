'use strict';

const utils = require('../../utils');

module.exports = (options) => {
    return (data) => {
        if (options.blackList && !options.blackList.includes(data.title.toLowerCase())) {
            // white list
            const keys = ['timestamp', 'title', 'level', 'namespace', 'message', 'requestId', 'processId', 'env', 'stack'];

            // stringify message
            const output = utils.json.safeStringify(utils.object.pick(data, keys));

            // in the background node will do process.stdout.write(message + '\n');
            console.log(output);
        }
    };
};

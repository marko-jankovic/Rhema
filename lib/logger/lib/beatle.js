'use strict';

const beatle = require('../../beatle');

// it will be triggered for every logger message;
module.exports = {
    init (options) {
        return function setBeatle (data) {
            if (!options.blackList.includes(data.title.toLowerCase())) {
                // attach each message to syslog
                beatle.set('syslog', {
                    [data.title.toLowerCase()]: data.output.replace(/\s+/g, ' ')
                });
            }
        };
    }
};

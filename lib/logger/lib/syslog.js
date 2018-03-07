'use strict';

const Ain2 = require('ain2');

module.exports = (options) => {
    // Syslog logging using User Datagram Protocol (UDP)
    const log = new Ain2(options);

    // overwrite ain2.setMessageComposer
    log.setMessageComposer((message, severity) => {
        message = message.replace(/\s+/g, ' ');

        return new Buffer(`<${options.facility * 8 + severity}>${message}`);
    });

    return (data) => {
        if (!options.blackList.includes(data.title.toLowerCase())) {
            log.info(data.output);
        }

        return !!data;
    };
};

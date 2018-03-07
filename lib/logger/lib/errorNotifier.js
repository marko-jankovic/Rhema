'use strict';

const notifier = require('node-notifier');

module.exports = (options) => {
    return (data) => {
        if (options.whiteList.includes(data.title.toLowerCase())) {
            notifier.notify({
                sound: false,
                message: data.message,
                title: `${options.title} Error!`
            });
        }
    };
};

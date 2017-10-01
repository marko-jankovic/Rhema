'use strict';

const utils = require('../../../utils');
const loadByAppPaths = require('../../../loader');
const _ = require('lodash');

// Insert Error Handler in HTML
module.exports = (options) => {
    // create template
    const template = _.template(loadByAppPaths(options.template));

    return (data, html, next) => {
        // insert at the and of BODY
        html = utils.string.insert(
            html, html.indexOf('<\/body>'),
            template({ routePath: options.routePath })
        );

        next(null, data, html);
    };
};

'use strict';

const utils = require('../../../utils');
const formatjson = require('json-markup');
const loadByAppPaths = require('../../../loader');
const _ = require('lodash');

// Insert Beatle template in HTML
module.exports = (options) => {
    // create template
    const template = _.template(loadByAppPaths(options.template));

    return (data, html, next) => {
        // insert only if beatle query
        if (data.beatle) {
            // format each field with json-markup
            Object.keys(data.beatle).forEach((key) => {
                data.beatle[key] = formatjson(data.beatle[key]);
            });

            // insert at the and of BODY
            html = utils.string.insert(
                html, html.indexOf('</body>'), template({
                    beatle: data.beatle,
                    viewmodel: formatjson(data.viewmodel)
                })
            );
        }

        next(null, data, html);
    };
};

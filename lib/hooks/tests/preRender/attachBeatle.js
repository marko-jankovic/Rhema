'use strict';

// preRender
module.exports = function (options) {
    return function (data, html, next) {
        data.mare = 'Care';
        next(null, data, html);
    };
};

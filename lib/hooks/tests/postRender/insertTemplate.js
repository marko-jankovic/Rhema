'use strict';

// preRender
module.exports = function (options) {
    return function (data, html, next) {
        html = '<test></test>';
        data.mare = 'Care!!!';
        next(null, data, html);
    };
};

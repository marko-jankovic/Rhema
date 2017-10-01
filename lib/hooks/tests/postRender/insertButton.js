'use strict';

// preRender
module.exports = function (options) {
    return function (data, html, next) {
        html = '<button></button>';
        data.bozo = 'Care!!!';
        next(null, data, html);
    };
};

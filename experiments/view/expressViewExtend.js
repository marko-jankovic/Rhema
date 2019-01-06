'use strict';

/**
 * Extend default express View function
 *
 * We need to override the lookup and render functions,
 * since we are rendering precompiled Vue pages
 */

const ExpressView = require('express/lib/view');

/**
 * Create custom View function for handling Vue template rendering
 * @param {String} name     template name
 * @param {Object} data     page data
 */
const View = function (name, data) {
    return ExpressView.call(this, name, data);
};

/**
 * Extend custom View.prototype
 */
Object.assign(View.prototype, ExpressView.prototype);

/**
 * Override default ExpressView.lookup function
 * @param  {String} name
 * @return {String}
 */
View.prototype.lookup = function () {
    return this.name;
};

/**
 * Override default ExpressView.render function
 * @param  {Object}   data
 * @param  {Function} next
 * @return {void}
 */
View.prototype.render = function (data, next) {
    this.engine(this.name, data, next);
};

module.exports = View;

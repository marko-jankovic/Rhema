'use strict';

const Expresso = require('expresso');
const prepareEngine = require('./webpack/viewEngine/vueEngine');
const View = require('./webpack/viewEngine/expressViewExtend');

module.exports = new Expresso.App(configSettings, (app, config) => {
    app.engine('vue', prepareEngine());
    app.set('view engine', 'vue');
    app.set('view', View);
});

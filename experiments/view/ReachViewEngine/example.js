'use strict';

const Expresso = require('expresso');
const Engine = require('./app/viewEngine/reactEngine');
const View = require('./app/viewEngine/expressViewExtend');

// Initializing Expresso app
new Expresso.App(configSettings, (app, config, services) => {
    app.engine('jsx', Engine);
    app.set('views', './client/pages');
    app.set('view engine', 'jsx');
    app.set('view', View);
});

'use strict';

module.exports = {
    App: require('./lib/app/bootstrap'),
    Config: require('./lib/config').Config,
    Controller: require('./lib/controller/baseController'),
    Model: require('./lib/model/baseModel'),
    Utils: require('./lib/utils'),
    Services: require('./lib/services'),
    Beatle: require('./lib/beatle')
};

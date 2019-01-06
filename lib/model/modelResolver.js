'use strict';

const loadByAppPaths = require('@rhema/loader');
const BaseModel = require('./baseModel');

const ModelResolver = function ModelResolver (config) {
    const cache = {};
    // find model module
    // create Model instance
    // pass config and services
    // return instance
    return function getModel (name) {
        const modelName = name + config.models.suffix;

        try {
            const Model = cache[modelName] || loadByAppPaths(modelName, config.models.paths);
            // caching loaded Model
            // model will be loaded on demand
            cache[modelName] = cache[modelName] || Model;

            // return new instance
            return new Model(name, config);
        } catch (e) {
            return new BaseModel(name, config);
        }
    };
};

module.exports = ModelResolver;

'use strict';

const Pipeline = require('@rhema/callback-pipeline');
const services = require('@rhema/services');

class BaseModel {
    constructor (name, config) {
        this.name = name;
        this.config = config;

        // protect services
        const servicesInstance = services.instance();

        // Proxy for magic method getter
        return new Proxy(this, {
            get: (target, name) => {
                // return service or BaseModel property
                return target[name] || servicesInstance[name];
            }
        });
    }

    // params - initial data set passed to first pipe
    // callback - function returned to current Model
    pipeline (name, params, callback) {
        const pl = new Pipeline(this.config.pipelines);

        if (arguments.length === 1) {
            callback = name;
            name = this.name;
            params = {};
        }

        if (arguments.length === 2) {
            callback = params;
            params = name;
            name = this.name;
        }

        pl.execute(name, (next) => next(null, params), callback);
    }
}

module.exports = BaseModel;

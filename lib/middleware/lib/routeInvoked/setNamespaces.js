'use strict';

const uuid = require('uuid');
const registry = require('@rhema/registry');

// Set Namespaces that will be used for set/get data for continuation local storage
module.exports = (options) => {
    // set registry namespace
    registry.createNamespace('App');

    return (req, res, next) => {
        registry.run((namespace) => {
            req.requestId = options.xRequestIdName || req.headers['x-request-id'] || req.headers['request-id'] || uuid.v4();

            namespace.bindEmitter(req);
            namespace.bindEmitter(res);

            // jsonBeatle for easier json beatle reponse
            req.query.beatle = req.query.jsonBeatle || req.query.beatle;
            req.params.format = req.query.jsonBeatle ? 'json' : req.params.format;
            delete req.query.jsonBeatle;

            // beatle object could be very big so we are
            // not setting data to namespace for each request
            // only if beatle query exists
            if (req.query.beatle) {
                namespace.set('beatle', {});
            }

            // set requestId on the namespace, makes it
            // available for all continuations
            namespace.set('requestId', req.requestId);

            next();
        });
    };
};

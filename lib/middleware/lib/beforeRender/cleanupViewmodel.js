'use strict';

const utils = require('@rhema/utils');

// Remove fields from viewmodel
module.exports = (options) => {
    return (data, req, next) => {
        options.blackList.forEach((field) => {
            if (field.indexOf('.') !== -1) {
                const keys = field.split('.');
                const toDelete = keys.pop();
                const toFind = `${data.viewmodel ? 'viewmodel.' : ''}${keys.join('.')}`;
                const model = utils.object.getValue(data, toFind);

                if (model && model[toDelete]) {
                    delete model[toDelete];
                }
            } else if (data.viewmodel && data.viewmodel[field]) {
                delete data.viewmodel[field];
            } else if (!data.viewmodel && data[field]) {
                delete data[field];
            }
        });

        next(null, data, req);
    };
};

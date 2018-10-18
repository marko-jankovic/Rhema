'use strict';

const xss = require('xss');
const utils = require('../../../utils/index');

const runXss = (field, options) => {
    if (typeof field === 'string') {
        return xss(field, options)
    } else {
        return field;
    }
};

// clean up data from xss attempts
// examples
//      ?condition=eccde}}}})&</script><script>alert(document.cookie)</script>d2a61
//      ?condition=eccde}}}});%3C/script%3E%3Cscript%3Ealert(1)%3C/script%3Ed2a61
const cleanUp = (data, options) => {
    if (typeof data === 'object') {
        Object.keys(data).forEach((field) => {
            const cleanField = runXss(field, options);

            // iterate recursively over arrays/objects
            if (data[field] && typeof data[field] === 'object') {
                data[cleanField] = cleanUp(data[field], options);
            } else {
                data[cleanField] = runXss(data[field], options);
            }

            // delete bad params
            if (cleanField !== field) {
                delete data[field];
            }
        });
    } else {
        data = runXss(data, options);
    }

    return utils.object.removeEnumerable(data);
};

// Sanitize Request from XSS
module.exports = (options) => {
    return (req, res, next) => {
        options.reqFields.forEach((field) => {
            if (typeof req[field] !== 'undefined') {
                req[field] = cleanUp(req[field], options.xssOptions);
            }
        });

        next();
    };
};

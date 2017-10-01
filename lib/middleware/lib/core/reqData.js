'use strict';

// Save data to req cache which will be injected in Controller Action as argument
// This is created in order to avoid setting data to req.locals
module.exports = () => {
    return (req, res, next) => {
        let cache = {};
        req.data = {
            set (data) {
                cache = Object.assign(cache, data);
            },
            get () {
                return cache;
            },
            remove (key) {
                if (cache[key]) {
                    delete cache[key];
                }
            }
        };

        next();
    };
};

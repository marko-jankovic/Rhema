
module.exports = function (config) {
    return function (data, next) {
        data.testData = 'testData';

        next(null, data);
    };
};

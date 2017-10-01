module.exports = function push3 (options) {
    return function push3 (data, next) {
        data.testData.push('3');
        next(null, data);
    };
};

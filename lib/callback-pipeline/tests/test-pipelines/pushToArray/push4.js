module.exports = function push3 (options) {
    return function push4 (data, next) {
        data.testData.push('4');
        next(null, data);
    };
};

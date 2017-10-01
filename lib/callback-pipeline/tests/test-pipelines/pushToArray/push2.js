module.exports = function push2 (options) {
    return function push2 (data, next) {
        if (data.testData) {
            data.testData.push('2');
        } else {
            data.testData = ['2'];
        }
        next(null, data);
    };
};

module.exports = function Push1 () {
    return function push1 (data, next) {
        if (data.testData) {
            data.testData.push('1');
        } else {
            data.testData = ['1'];
        }
        next(null, data);
    };
};

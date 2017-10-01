module.exports = function ultraCar () {
    return function (callback) {
        setTimeout(() => {
            callback(null, { ultraCar: 'MARE' });
        }, 1000);
    }
};

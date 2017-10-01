const Initial = function () {};

Initial.prototype = {
    saveToCache (callback) {
        this.$cache = 'savedToCache';
        callback(null, 'saveToCache!!!');
    },

    initialize (done) {
        this.saveToCache((err, data) => {
            done();
        });
    }
};

module.exports = Initial;

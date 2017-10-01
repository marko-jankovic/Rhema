const Rhema = require('../../../../');

class HomeModel extends Rhema.Model {
    fetch (callback) {
        this.$testHelper.timeOut((err, data) => {
            callback(err, data);
        });
    }
};

module.exports = HomeModel;

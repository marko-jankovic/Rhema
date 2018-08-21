const Rhema = require('../../../../');

class CarsController extends Rhema.Controller {
    getAction () {
        this.getModel('home').fetch((err, data) => {
            this.json(null, data);
        });
    }

    customRandomAction () {
        this.getModel('home').fetch((err, data) => {
            this.json(null, data);
        });
    }
};

module.exports = CarsController;

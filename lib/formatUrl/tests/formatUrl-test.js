const chai = require('chai');
const assert = chai.assert;

const urlGenerator = require('../index');

describe('# FormatUrl', function () {
    let formatUrl;

    beforeEach(function () {
        // make sure to define params regexes for each param where you want to have prefix
        // example:
        // "params": {
        //     "make": "make-(([A-Za-z0-9](_)?)+)",
        //     "model": "model-(([0-9A-Za-z](_)?)+)",
        //     "location": "location-(.*)",
        //     "type": "type-(.*)"
        // },
        formatUrl = urlGenerator({
            detail: {
                path: '/detail/:year-:make-:model-:location-:vin'
            },
            queryOrder: {
                path: '/queryOrder/:year-:make-:model-:location-:vin',
                    query: {
                    order: ["range", "zip", "mpg"]
                },
                params: {
                    "make": "make-(([A-Za-z0-9](_)?)+)",
                    "model": "model-(([0-9A-Za-z](_)?)+)",
                    "location": "location-(.*)",
                }
            },
            detail2: {
                path: '/detail/:year-:make-:model-:location-:vin',
                paramsPrefixes: true,
                params: {
                    "make": "make-(([A-Za-z0-9](_)?)+)",
                    "model": "model-(([0-9A-Za-z](_)?)+)",
                    "location": "location-(.*)",
                }
            },
            search: {
                path: '/cars/:make?/:model?/:location?',
                paramsPrefixes: true ,
                params: {
                    "make": "make-(([A-Za-z0-9](_)?)+)",
                    "model": "model-(([0-9A-Za-z](_)?)+)",
                    "location": "location-(.*)",
                }
            },
            carsDetails: {
                path: '/cars-details'
            }
        });
    });

    it('should sort query params by order', function () {
        const queryOrder = formatUrl('queryOrder', {
            year: 1999,
            make: 'Acura',
            model: 'CL',
            location: 11211,
            vin: 'JN8AS5MV8FW261453',
            zip: 11211,
            mpg: '20-30',
            range: 10
        });

        assert.equal(queryOrder, '/queryOrder/1999-Acura-CL-11211-JN8AS5MV8FW261453?range=10&zip=11211&mpg=20-30');
    });

    it('should return page url with prefix', function () {
        const search = formatUrl('search', {
            year: 1999,
            make: 'Acura',
            model: 'CL',
            location: 11211,
            vin: 'JN8AS5MV8FW261453'
        });

        assert.equal(search, '/cars/make-Acura/model-CL/location-11211?year=1999&vin=JN8AS5MV8FW261453');
    });

    it('should return page url without prefix', function () {
        const detail = formatUrl('detail', {
            year: 1999,
            make: 'Acura',
            model: 'CL',
            location: 11211,
            vin: 'JN8AS5MV8FW261453'
        });

        assert.equal(detail, '/detail/1999-Acura-CL-11211-JN8AS5MV8FW261453');
    });

    it('should return page url with prefixes for mandatory params', function () {
        const detail2 = formatUrl('detail2', {
            year: 1999,
            make: 'Acura',
            model: 'CL',
            location: 11211,
            vin: 'JN8AS5MV8FW261453'
        });

        assert.equal(detail2, '/detail/1999-make-Acura-model-CL-location-11211-JN8AS5MV8FW261453');
    });

    it('should return page url for route without params', function () {
        const carsDetails = formatUrl('carsDetails');
        assert.equal(carsDetails, '/cars-details');
    });

    it('should return page url without params if they are not passed', function () {
        const detailEmpty = formatUrl('detail', {});
        const searchWithoutModel = formatUrl('search', {
            make: 'BMW',
            location: 11211
        });

        assert.equal(detailEmpty, '/detail');
        assert.equal(searchWithoutModel, '/cars/make-BMW/location-11211');
    });

    it('should not modify original params object', function () {
        const params = {
            year: 1999,
            make: 'Acura',
            model: 'CL',
            location: 11211,
            vin: 'JN8AS5MV8FW261453'
        };

        const searchUrl = formatUrl('search', params);

        assert.equal(params.year, 1999);
        assert.equal(params.make, 'Acura');
        assert.equal(params.model, 'CL');
        assert.equal(params.location, 11211);
        assert.equal(params.vin, 'JN8AS5MV8FW261453');
        assert.equal(searchUrl, '/cars/make-Acura/model-CL/location-11211?year=1999&vin=JN8AS5MV8FW261453');
    });

    it('should delete empty params', function () {
        const params = {
            year: 1999,
            make: '',
            model: '',
            location: '',
            vin: 'JN8AS5MV8FW261453'
        };

        const carsDetails = formatUrl('carsDetails', params);

        assert.equal(carsDetails, '/cars-details?year=1999&vin=JN8AS5MV8FW261453');
    });

    it('should receive params as function', function () {
        const carsDetails = formatUrl('carsDetails', () => {
            return {
                year: 1999,
                vin: 'JN8AS5MV8FW261453'
            }
        });

        assert.equal(carsDetails, '/cars-details?year=1999&vin=JN8AS5MV8FW261453');
    });
});
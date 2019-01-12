'use strict';

const assert = require('@rhema/testing').assert;
const mathUtil = require('../lib/math');

describe('# Math Utils', () => {
    it('Test Math::geoDistance', () => {
        const rio = [-22.928042, -43.165283];
        const belgrade = [44.7561365302915, 20.4688825302915];
        const distance = mathUtil.geoDistance(rio, belgrade);

        assert.property(distance, 'miles');
        assert.property(distance, 'kilometers');
        assert.property(distance, 'kilometers');
        assert.equal(distance.miles, '6157.953551590695');
        assert.equal(distance.kilometers, '9907.760157608556');
    });

    it('Test Math::bytesToSize', () => {
        const bytesToKB = mathUtil.bytesToSize(12345); // 12 KB
        const bytesToMB = mathUtil.bytesToSize(123456789); // 118 MB
        const bytesToGB = mathUtil.bytesToSize(11341618191); // 11 GB
        assert.equal(bytesToKB, '12 KB');
        assert.equal(bytesToMB, '118 MB');
        assert.equal(bytesToGB, '11 GB');
    });

    it('Test Math::parseHrtime', (done) => {
        const startTime = process.hrtime();
        setTimeout(() => {
            let hrtime = mathUtil.parseHrtime(startTime);
            assert.typeOf(hrtime.timeEndRaw, 'number');
            assert.typeOf(hrtime.timeEnd, 'string');
            done();
        }, 500);
    });

    it('Test Math::getRandomInteger', () => {
        assert.isNumber(mathUtil.getRandomInteger('1', '600000'));
        assert.isNumber(mathUtil.getRandomInteger(1, 600000));
    });
});


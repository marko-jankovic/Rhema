'use strict';

const chai = require('chai');
const assert = chai.assert;

const dateUtil = require('../lib/date');

describe('# Date Utils', () => {
    it('Test Date::dateToString', () => {
        let date = new Date();
        let stringDate = dateUtil.dateToString(date);
        let stringDateSeparator = dateUtil.dateToString(date, '||');
        assert.typeOf(stringDate, 'String');
        assert.lengthOf(stringDate, 10);
        assert.equal(stringDateSeparator[2], '|');
    });

    it('Test Date::compare', () => {
        let date1 = new Date();
        let date2 = new Date();
        let date3 = new Date(2017, 10, 5);
        let result1 = dateUtil.compare(date1, date2);
        let result2 = dateUtil.compare(date1, date3);
        assert.equal(result1, 0);
        assert.equal(result2, 1);
    });

    it('Test Date::equalsDay', () => {
        let date1 = new Date(2017,10, 5);
        let date2 = new Date(2017, 4, 5);
        let date3 = new Date(2017, 4, 10);
        let result1 = dateUtil.equalsDay(date1, date2);
        let result2 = dateUtil.equalsDay(date1, date3);
        assert.equal(result1, true);
        assert.equal(result2, false);
    });

    it('Test Date::isLeapYear', () => {
        let isLeap1 = dateUtil.isLeapYear(2014);
        let isLeap2 = dateUtil.isLeapYear(2016);
        assert.equal(isLeap1, false);
        assert.equal(isLeap2, true);
    });

    it('Test Date::getDaysInMonth', () => {
        let days1 = dateUtil.getDaysInMonth(2014, 0);
        let days2 = dateUtil.getDaysInMonth(2016, 1);
        assert.equal(days1, 31);
        assert.equal(days2, 29);
    });

    it('Test Date::add', () => {
        let day1 = new Date(2017, 5, 4);
        let addedDays = dateUtil.add(day1, 2, 'd');
        let addedHours = dateUtil.add(day1, 5, 'h');
        let days = addedDays.getDate();
        let hours = addedHours.getHours();
        assert.equal(days, 6);
        assert.equal(hours, 5);
    });

    it('Test Date::tomorrow', () => {
        let day1 = new Date(2014, 1, 1, 17);
        let tomorrow = dateUtil.tomorrow(day1);
        let diff = tomorrow.getTime() - day1.getTime();
        assert.equal(diff, 86400000);
    });

    it('Test Date::yesterday', () => {
        let day1 = new Date(2014, 1, 1);
        let yesterday = dateUtil.yesterday(day1);
        let diff = day1.getTime() - yesterday.getTime();
        assert.equal(diff, 86400000);
    });
});


'use strict';

// @TODO - write unit tests for each method
module.exports = {
    // Format Date object to String.
    dateToString: function dateToString (date, separator) {
        let dd = date.getDate();
        separator = separator || '/';
        if (dd < 10) {
            dd = `0${dd}`;
        }

        let mm = date.getMonth() + 1;
        if (mm < 10) {
            mm = `0${mm}`;
        }

        const yy = date.getFullYear();

        return mm + separator + dd + separator + yy;
    },

    // Returns new instance of Date object with the date set to today and the time set to midnight
    today: function today () {
        return new Date().getTime();
    },

    // Compares two dates
    // -1 if date1 is less than date2
    // 0 if they are equal
    // 1 if date1 is more than date2
    compare: function compare (date1, date2) {
        if (date1.valueOf() < date2.valueOf()) {
            return -1;
        } else if (date1.valueOf() > date2.valueOf()) {
            return 1;
        }

        return 0;
    },

    // Compares two dates by day
    equalsDay: function equalsDay (date1, date2) {
        return date1.getDate() === date2.getDate();
    },

    // Returns whether or not the year is a leap year
    isLeapYear: function isLeapYear (year) {
        return (new Date(year, 1, 29).getDate() === 29);
    },

    // Returns the number of days in a month
    getDaysInMonth: function getDaysInMonth (year, month) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month === 1) {
            return this.isLeapYear(year) ? 29 : 28;
        }

        return daysInMonth[month];
    },

    add: function add (date, offset, component) {
        switch (component) {
            case 'd':
                offset *= 86400;
                break;
            case 'h':
                offset *= 3600;
                break;
            case 'm':
                offset *= 60;
                break;
            case 's':
                break;
            default:
                throw new Error(`Data component is not valid: ${component}`);
        }

        return new Date(date.getTime() + (offset * 1000));
    },

    // Returns new instance of Date object with the date set to tomorrow
    tomorrow: function tomorrow (date) {
        return this.add(date, 1, 'd');
    },

    // Returns new instance of Date object with the date set to yesterday
    yesterday: function yesterday (date) {
        return this.add(date, -1, 'd');
    }
};


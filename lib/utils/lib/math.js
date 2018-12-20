'use strict';

module.exports = {
    /**
     * Calculates geodistance between two points
     * using Haversine Formula expressed in terms of a two-argument inverse tangent function
     * to calculate the great circle distance between two points on the Earth
     * @param  {array} point1 [lon1, lat1]
     * @param  {array} point2 [lon2, lat2]
     * @return {object} distance object containing distance in miles and kilometers
     */
    geoDistance (point1, point2) {
        // Earth's radius in miles
        const Rm = 3961;
        // Earth's radius in kilometers
        const Rkm = 6373;

        // longitudes and latitudes
        const lon1 = +point1[1] * (Math.PI / 180);
        const lat1 = +point1[0] * (Math.PI / 180);
        const lon2 = +point2[1] * (Math.PI / 180);
        const lat2 = +point2[0] * (Math.PI / 180);

        // diff for lon and lat representing legs of right triangle
        const dlon = Math.abs(lon2 - lon1);
        const dlat = Math.abs(lat2 - lat1);

        const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // distance
        const dist = {
            miles: Rm * c,
            kilometers: Rkm * c
        };

        return dist;
    },

    // Formats raw file size in bytes to human-readable format
    bytesToSize (bytes, nFractDigit, space) {
        if (!bytes) {
            return 'n/a';
        }

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        nFractDigit = nFractDigit !== undefined ? nFractDigit : 0;
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const precision = Math.pow(10, nFractDigit);

        return `${Math.round(bytes * precision / Math.pow(1024, i)) / precision + (space || '')} ${sizes[i]}`;
    },

    parseHrtime (startTime) {
        let timeEnd;
        const hrTime = process.hrtime(startTime);
        const timeInMs = (hrTime[0] * 1000 + hrTime[1] / 1000000);
        const timeInSec = timeInMs / 1000;

        if (timeInSec > 1) {
            timeEnd = `${timeInSec.toFixed(2)} sec`;
        } else {
            timeEnd = `${timeInMs.toFixed(2)} ms`;
        }

        return {
            timeEndRaw: timeInMs,
            timeEnd
        };
    },

    getRandomInteger (min, max) {
        if (min && max) {
            return Math.floor(Math.random() * (max - min + 1)) + parseInt(min);
        } else {
            return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        }
    },

    getRandomLetter (big = false) {
        if (big) {
            return String.fromCharCode(65 + Math.floor(Math.random() * 26));
        } else {
            return String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }
    },

    convertHrtime (hrtime) {
        const nanoseconds = (hrtime[0] * 1e9) + hrtime[1];
        const milliseconds = nanoseconds / 1e6;
        const seconds = nanoseconds / 1e9;

        return {
            seconds,
            milliseconds,
            nanoseconds
        };
    }
};

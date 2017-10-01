'use strict';

const path = require('path');
const gleak = require('gleak')();
const util = require('util');
// cache version
let version = '';

module.exports = {
    getVersion () {
        try {
            const buildFile = require(path.resolve(process.cwd(), 'build/build.json'));
            version = buildFile.build;
        } catch (e) {
            const packageFile = require(path.resolve(process.cwd(), 'package.json'));
            version = packageFile.version;
        }

        return version;
    },

    convertUptime (time) {
        let uptime = Math.floor(time);
        const s = uptime % 60;
        uptime = (uptime - s) / 60;

        const m = uptime % 60;
        uptime = (uptime - m) / 60;

        const h = uptime % 24;
        uptime = (uptime - h) / 24;

        const d = uptime % 365;
        uptime = (uptime - d) / 365;

        const y = uptime;
        let result = '';

        if (y > 0) {
            result = result + y + (y > 1 ? ' years ' : ' year ');
        }

        if (d > 0) {
            result = result + d + (d > 1 ? ' days ' : ' day ');
        }

        if (h > 0) {
            result = result + h + (h > 1 ? ' hours ' : ' hour ');
        }

        if (m > 0) {
            result = result + m + (m > 1 ? ' minutes ' : ' minute ');
        }

        if (s > 0) {
            result = result + s + (s > 1 ? ' seconds' : ' second');
        }

        return result.replace(/\s+/g, ' ');
    },

    //
    // Retrieves a package name from the full import path.
    // example: './node_modules/bar/index/foo.js' => 'bar'
    // Includes support for npm '@org/name' packages
    // Regex: .*?node_modules(?!.*node_modules)\/(@[^\/]*\/[^\/]*|[^\/]*).*
    // Tests: https://regex101.com/r/lW2bE3/6
    packageNameFromPath (modulePath) {
        const moduleRegex = new RegExp(`.*?node_modules(?!.*node_modules)\\${path.sep}(@[^\\${path.sep}]*\\${path.sep}[^\\${path.sep}]*|[^\\${path.sep}]*).*`);
        const matches = moduleRegex.exec(modulePath);
        return matches && matches.length > 1 ? matches[1] : null;
    },

    // detect global variables
    // ignore Node Global and gleakIgnore list
    detectGlobalVarLeaks (ignoreList = []) {
        const globalVarLeaks = [];
        const gleakIgnore = [
            'logger', 'metrics', 'timer', 'setImmediate', 'clearImmediate', 'setInterval', 'setTimeout',
            'DTRACE_HTTP_CLIENT_RESPONSE', 'DTRACE_HTTP_CLIENT_REQUEST', 'DTRACE_HTTP_SERVER_RESPONSE',
            'DTRACE_HTTP_SERVER_REQUEST', 'DTRACE_NET_STREAM_END', 'DTRACE_NET_SERVER_CONNECTION'
        ].concat(ignoreList);

        gleakIgnore.forEach((ignore) => {
            if (global[ignore]) {
                gleak.ignore(ignore);
            }
        });

        gleak.detect().forEach((name) => {
            logger.warn(`Variable "${name}" is set to Global!`);
            globalVarLeaks.push(name);
        });

        return globalVarLeaks;
    },

    // is current extension valid
    isValidExtension (validExtension, fileExtension) {
        let isValid = false;

        // support several specified extension types
        if (Array.isArray(validExtension)) {
            if (validExtension.includes(fileExtension)) {
                isValid = true;
            }
        } else if (validExtension === '*') { // allow reading configs in different format
            isValid = true;
        } else if (validExtension === fileExtension) {
            // must match config extension
            isValid = true;
        }

        return isValid;
    },

    inspect (obj) {
        return console.log(util.inspect(obj, { depth: null }));
    },

    // transform template time value to miliseconds
    // e.g {% 30 seconds | toMs %} will be transformed to 30000
    toMs (value = '0 s') {
        // split by space
        const timeDef = value.split(' ');
        const timeValue = timeDef[0];
        const timeUnit = timeDef[1];
        const units = [{
            keys: ['s', 'sec', 'second', 'seconds'],
            value: 1000
        }, {
            keys: ['m', 'min', 'minute', 'minutes'],
            value: 60 * 1000
        }, {
            keys: ['h', 'hour', 'hours'],
            value: 60 * 60 * 1000
        }, {
            keys: ['d', 'day', 'days'],
            value: 60 * 60 * 1000 * 24
        }];

        if (timeValue && timeUnit) {
            units.forEach((unit) => {
                if (unit.keys.includes(timeUnit)) {
                    value = unit.value * timeValue;
                }
            });
        }

        return value;
    }
};

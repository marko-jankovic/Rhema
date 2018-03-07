'use strict';

const regex = require('./regex');

module.exports = {
    isNull (val) {
        return Object.is(val, null);
    },

    isNaN (val) {
        return Number.isNaN(val);
    },

    isUndefined (val) {
        return Object.is(val, undefined);
    },

    isFunction (val) {
        return Object.prototype.toString.call(val) === '[object Function]';
    },

    isString (val) {
        return Object.prototype.toString.call(val) === '[object String]';
    },

    isInt (val) {
        return Number.isInteger(val);
    },

    isNegativeInt (val) {
        return Number.isInteger(val) && val < 0;
    },

    isSafeInteger (val) {
        return Number.isSafeInteger(val);
    },

    isArray (val) {
        return Array.isArray(val);
    },

    isArrayBuffer (val) {
        return Object.prototype.toString.call(val) === '[object ArrayBuffer]';
    },

    isRawObject (val) {
        return Object.prototype.toString.call(val) === '[object Object]' && !this.isArray(val);
    },

    isObject (val) {
        return typeof val === 'object';
    },

    isBoolean (val) {
        return val === true || val === false;
    },

    isRegExp (val) {
        return Object.prototype.toString.call(val) === '[object RegExp]';
    },

    isDate (val) {
        return val instanceof Date && !this.isNaN(val.valueOf());
    },

    isEmpty (val) {
        return !val || this.isUndefined(val) || this.isNull(val) ||
            this.isArray(val) && val.length === 0 ||
            this.isObject(val) && Object.keys(val).length === 0;
    },

    isNumeric (val) {
        return regex.isValid('numeric', val);
    },

    isUrl (val) {
        return regex.isValid('url', val);
    },

    isHTMLtag (val) {
        return regex.isValid('HTMLtag', val);
    },

    isDecimal (val) {
        return regex.isValid('decimal', val);
    },

    isEmail (val) {
        return regex.isValid('email', val);
    },

    isAlpha (val) {
        return regex.isValid('alpha', val);
    },

    isAlphaNumeric (val) {
        return regex.isValid('alphaNumeric', val);
    },

    isFloat (val) {
        return Number(val) === val && val % 1 !== 0;
    },

    isLowercase (str) {
        return str === str.toLowerCase();
    },

    isUppercase (str) {
        return str === str.toUpperCase();
    },

    isJSON (str) {
        try {
            return this.isObject(JSON.parse(str));
        } catch (e) {
            return false;
        }
    },

    isLatitude (val) {
        return isFinite(val) && Math.abs(val) <= 90;
    },

    isLongitude (val) {
        return isFinite(val) && Math.abs(val) <= 180;
    },

    isIP (val) {
        return regex.isValid('ip', val);
    },

    isBase64 (val) {
        return regex.isValid('base64', val);
    },

    isZip (val) {
        return regex.isValid('zip', val);
    },

    isBuffer (obj) {
        return obj instanceof Buffer;
    },

    // Checks if value is an Error or Error-like object
    isError (err) {
        return this.isObject(err) && err instanceof Error || (err.hasOwnProperty('message') && err.hasOwnProperty('stack'));
    },

    isMap (obj) {
        return Object.prototype.toString.call(obj) === '[object Map]';
    },

    isWeakMap (obj) {
        return (Object.prototype.toString.call(obj) === '[object WeakMap]');
    },

    isStream (arg) {
        return arg instanceof Stream;
    },

    isSymbol (val) {
        return Object.prototype.toString.call(val) === '[object Symbol]';
    }
};

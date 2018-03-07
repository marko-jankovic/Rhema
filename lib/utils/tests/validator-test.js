'use strict';

const chai = require('chai');
const assert = chai.assert;

const validatorUtil = require('../lib/validator');

describe('# Validator Utils', () => {
    it('Test Validator::isNull', () => {
        assert.isTrue(validatorUtil.isNull(null));
        assert.isFalse(validatorUtil.isNull('null'));
    });

    it('Test Validator::isNaN', () => {
        assert.isTrue(validatorUtil.isNaN(NaN));
        assert.isFalse(validatorUtil.isNaN('NaN'));
    });

    it('Test Validator::isUndefined', () => {
        assert.isTrue(validatorUtil.isUndefined(undefined));
        assert.isFalse(validatorUtil.isUndefined('undefined'));
    });

    it('Test Validator::isFunction', () => {
        assert.isTrue(validatorUtil.isFunction(() => {}));
    });

    it('Test Validator::isString', () => {
        assert.isTrue(validatorUtil.isString('test'));
        assert.isFalse(validatorUtil.isString(['test']));
    });

    it('Test Validator::isInt', () => {
        assert.isTrue(validatorUtil.isInt(3));
        assert.isFalse(validatorUtil.isInt('3'));
        assert.isTrue(Number.isInteger(-1));
    });

    it('Test Validator::isArray', () => {
        assert.isTrue(validatorUtil.isArray([]));
    });

    it('Test Validator::isRawObject', () => {
        assert.isTrue(validatorUtil.isRawObject({}));
        assert.isFalse(validatorUtil.isRawObject([]));
        assert.isFalse(validatorUtil.isRawObject(null));
    });

    it('Test Validator::isObject', () => {
        assert.isTrue(validatorUtil.isObject({}));
        assert.isTrue(validatorUtil.isObject([]));
        assert.isTrue(validatorUtil.isObject(null));
    });

    it('Test Validator::isBoolean', () => {
        assert.isTrue(validatorUtil.isBoolean(true));
        assert.isTrue(validatorUtil.isBoolean(false));
    });

    it('Test Validator::isRegExp', () => {
        assert.isTrue(validatorUtil.isRegExp(/^foo(bar)?$/i));
        assert.isFalse(validatorUtil.isRegExp('/^foo(bar)?$/i'));
    });

    it('Test Validator::isDate', () => {
        assert.isTrue(validatorUtil.isDate(new Date()));
    });

    it('Test Validator::isAlpha', () => {
        assert.isTrue(validatorUtil.isAlpha('Mare'));
        assert.isFalse(validatorUtil.isAlpha('Mare '));
        assert.isFalse(validatorUtil.isAlpha('333'));
    });

    it('Test Validator::isAlphaNumeric', () => {
        assert.isFalse(validatorUtil.isAlphaNumeric('Mare Care'));
        assert.isTrue(validatorUtil.isAlphaNumeric('Mare123'));
    });

    it('Test Validator::isEmpty', () => {
        assert.isTrue(validatorUtil.isEmpty(''));
        assert.isTrue(validatorUtil.isEmpty({}));
        assert.isTrue(validatorUtil.isEmpty([]));
    });

    it('Test Validator::isNumeric', () => {
        assert.isTrue(validatorUtil.isNumeric('12345'));
    });

    it('Test Validator::isEmail', () => {
        assert.isTrue(validatorUtil.isEmail('team@test.io'));
        assert.isTrue(validatorUtil.isEmail('team+@test.com'));
        assert.isTrue(validatorUtil.isEmail('te-am@test.com'));
        assert.isTrue(validatorUtil.isEmail('team@test-tio.com'));
        assert.isTrue(validatorUtil.isEmail('team+34@test-ntio.com'));

        assert.isFalse(validatorUtil.isEmail('12345'));
        assert.isFalse(validatorUtil.isEmail('team@.org'));
        assert.isFalse(validatorUtil.isEmail('team+45.io'));
        assert.isFalse(validatorUtil.isEmail('@test.com'));
    });

    it('Test Validator::isDecimal', () => {
        assert.isTrue(validatorUtil.isDecimal(123.45));
        assert.isTrue(validatorUtil.isDecimal(123.45));
        assert.isTrue(validatorUtil.isDecimal(3.1));
        assert.isTrue(validatorUtil.isDecimal('12.12'));
        assert.isFalse(validatorUtil.isDecimal(12.1232));
    });

    it('Test Validator::isFloat', () => {
        assert.isTrue(validatorUtil.isFloat(1.25));
        assert.isFalse(validatorUtil.isFloat(125));
    });

    it('Test Validator::isLowercase', () => {
        assert.isTrue(validatorUtil.isLowercase('taadsd'));
        assert.isFalse(validatorUtil.isLowercase('Taadsd'));
    });

    it('Test Validator::isUppercase', () => {
        assert.isTrue(validatorUtil.isUppercase('TRR'));
        assert.isFalse(validatorUtil.isUppercase('taadsd'));
    });

    it('Test Validator::isJSON', () => {
        assert.isTrue(validatorUtil.isJSON('{ "test": "test" }'));
        assert.isFalse(validatorUtil.isJSON('taadsd'));
    });

    it('Test Validator::isLatitude', () => {
        assert.isTrue(validatorUtil.isLatitude(34.11242));
        assert.isTrue(validatorUtil.isLatitude('34.11242'));
        assert.isFalse(validatorUtil.isLatitude(33220.2672));
    });

    it('Test Validator::isLongitude', () => {
        assert.isTrue(validatorUtil.isLongitude(97.7431));
    });

    it('Test Validator::isBase64', () => {
        assert.isTrue(validatorUtil.isBase64('TWFyZUNhcmU='));
    });

    it('Test Validator::isBuffer', () => {
        const Buffer = require('buffer').Buffer;
        assert.isTrue(validatorUtil.isBuffer(new Buffer(3)));
    });

    it('Test Validator::isNegativeInt', () => {
        assert.isTrue(validatorUtil.isNegativeInt(-1));
        assert.isFalse(validatorUtil.isNegativeInt(1));
    });

    it('Test Validator::isError', () => {
        assert.isTrue(validatorUtil.isError(new Error()));
    });

    it('Test Validator::isSafeInteger', () => {
        assert.isTrue(validatorUtil.isSafeInteger(11111));
        assert.isFalse(validatorUtil.isSafeInteger(999999999999999999999));
    });

    it('Test Validator::isArrayBuffer', () => {
        const buffer = new ArrayBuffer(11);
        assert.isTrue(validatorUtil.isArrayBuffer(buffer));
    });

    it('Test Validator::isMap', () => {
        const map = new Map();
        assert.isTrue(validatorUtil.isMap(map));
    });

    it('Test Validator::isWeakMap', () => {
        const weakMap = new WeakMap();
        assert.isTrue(validatorUtil.isWeakMap(weakMap));
    });

    it('Test Validator::isSymbol', () => {
        const getController = Symbol('getController');
        assert.isTrue(validatorUtil.isSymbol(getController));
    });

    it('Test Validator::isZip', () => {
        assert.isTrue(validatorUtil.isZip('11211'));
        assert.isTrue(validatorUtil.isZip(11211));
        assert.isFalse(validatorUtil.isZip(111211));
    });

    it('Test Validator::isIP', () => {
        assert.isTrue(validatorUtil.isIP('1.1.1.1'));
        assert.isTrue(validatorUtil.isIP('255.255.255.255'));
        assert.isTrue(validatorUtil.isIP('192.168.1.1'));
        assert.isTrue(validatorUtil.isIP('10.10.1.1'));
        assert.isTrue(validatorUtil.isIP('132.254.111.10'));
        assert.isTrue(validatorUtil.isIP('26.10.2.10'));
        assert.isTrue(validatorUtil.isIP('127.0.0.1'));

        assert.isFalse(validatorUtil.isIP('10.10.10'));
        assert.isFalse(validatorUtil.isIP('10.10'));
        assert.isFalse(validatorUtil.isIP('10'));
        assert.isFalse(validatorUtil.isIP('a.a.a.a'));
        assert.isFalse(validatorUtil.isIP('10.0.0.a'));
        assert.isFalse(validatorUtil.isIP('10.10.10.256'));
        assert.isFalse(validatorUtil.isIP('222.222.2.999'));
        assert.isFalse(validatorUtil.isIP('999.10.10.20'));
        assert.isFalse(validatorUtil.isIP('2222.22.22.22'));
        assert.isFalse(validatorUtil.isIP('22.2222.22.2'));
    });

    it('Test Validator::isHTMLtag', () => {
        assert.isTrue(validatorUtil.isHTMLtag('<span>trara</span>'));
        assert.isTrue(validatorUtil.isHTMLtag('<p></p>'));
        assert.isTrue(validatorUtil.isHTMLtag('<html itemscope itemtype="http://schema.org/QAPage">'));
        assert.isTrue(validatorUtil.isHTMLtag('<img src="hello.jpg">'));
        assert.isTrue(validatorUtil.isHTMLtag('<meta name="twitter:app:id:ipad" content="871299723" />'));
        assert.isFalse(validatorUtil.isHTMLtag('< test >'));
        assert.isFalse(validatorUtil.isHTMLtag('<test'));
    });

    it('Test Validator::isUrl', () => {
        assert.isTrue(validatorUtil.isUrl('http://www.youtube.com'));
        assert.isTrue(validatorUtil.isUrl('https://www.youtube.com'));
        assert.isTrue(validatorUtil.isUrl('http://youtube.com'));
        assert.isTrue(validatorUtil.isUrl('http://www.youtube.com/test'));
        assert.isTrue(validatorUtil.isUrl('http://www.t.co'));
        assert.isTrue(validatorUtil.isUrl('http://werer.com'));
        assert.isTrue(validatorUtil.isUrl('www.youtube.com'));
        assert.isTrue(validatorUtil.isUrl('www.youtube.rs'));
        assert.isTrue(validatorUtil.isUrl('www.youtube.tr-local.mast.com:8080/blah'));

        // assert.isTrue(validatorUtil.isUrl('https://gooduser:secretpassword@www.example.com/webcallback?foo=bar'));

        assert.isFalse(validatorUtil.isUrl('www.youtube'));
        assert.isFalse(validatorUtil.isUrl('https://www.youtube'));
        assert.isFalse(validatorUtil.isUrl('http://www.youtube'));
        assert.isFalse(validatorUtil.isUrl('www.youtube#.com'));
        assert.isFalse(validatorUtil.isUrl('www.youtube-.com'));
        assert.isFalse(validatorUtil.isUrl('www.-youtube.com'));
    });
});


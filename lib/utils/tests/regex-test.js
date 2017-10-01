'use strict';

const chai = require('chai');
const assert = chai.assert;

const regUtil = require('../lib/regex');

describe('# Regex Utils', () => {
    it('Test Regex::contains', () => {
        let justString = 'Some string goes here';
        let email = 'test@test.com';
        let hasNumbers1 = regUtil.contains('numeric', 'Some string goes here 9');
        let hasNumbers2 = regUtil.contains('numeric', justString, 'g');
        let isEmail = regUtil.contains('email', email);

        assert.equal(hasNumbers1, true);
        assert.equal(hasNumbers2, false);
        assert.equal(isEmail, true);
    });

    it('Test Regex::exactMatch', () => {
        let isExact = regUtil.exactMatch('numeric', '99', 'g');
        assert.equal(isExact[0], 99);
    });

    it('Test Regex::matchAll', () => {
        let isExact = regUtil.matchAll('numeric', '11211 has 19456stores');
        assert.equal(isExact[1], '19456');
        assert.equal(isExact[0], '11211');
    });

    it('Test Regex::isValid', () => {
        let isValid = regUtil.isValid('alphaNumeric', '11211has19stores');
        assert.equal(isValid, true);
    });

    it('Test Regex::escape', () => {
        let myVar = '/path/to/resource.html?search=query';
        let escaped1 = regUtil.escape(myVar);
        assert.typeOf(escaped1, 'string');

        let escaped2 = regUtil.escape('All of these should be escaped: \ ^ $ * + ? . ( ) | { } [ ]');
        assert.equal(escaped2, 'All of these should be escaped:  \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]');
    });

    it('Test Regex::matches', () => {
        let myVar = 'Hello world, hello there';
        let match1 = regUtil.matches(myVar, 'hello', 'gi');
        let match2 = regUtil.matches(myVar, 'hallo', 'gi');
        assert.equal(match1, true);
        assert.equal(match2, false);
    });
});

'use strict';

const chai = require('chai');
const assert = chai.assert;

const stringUtils = require('../lib/string');

describe('# String Utils', () => {
    it('Test String::addCommas', () => {
        assert.equal(stringUtils.addCommas(123456), '123,456');
        assert.equal(stringUtils.addCommas(123), '123');
        assert.equal(stringUtils.addCommas(), '');
    });

    it('Test String::formatPrice', () => {
        assert.equal(stringUtils.formatPrice(123456), '$123,456');
        assert.equal(stringUtils.formatPrice(123), '$123');
        assert.equal(stringUtils.formatPrice(123.123, 2), '$123.12');
        assert.equal(stringUtils.formatPrice(123.123, true), '$123.12');
    });

    it('Test String::formatPhone', () => {
        assert.equal(stringUtils.formatPhone(12345632132), '(123) 456-3213');
    });

    it('Test String::formatPhone', () => {
        assert.equal(stringUtils.formatPhone(), '');
    });

    it('Test String::escape', () => {
        assert.equal(stringUtils.escape('data\'da'), 'data\\\'da');
    });

    it('Test String::htmlEntityEncode', () => {
        assert.equal(stringUtils.htmlEntityEncode('<div>TEST</div>'), '&lt;div&gt;TEST&lt;&#x2F;div&gt;');
    });

    it('Test String::htmlEntityDecode', () => {
        assert.equal(stringUtils.htmlEntityDecode('&lt;div&gt;TEST&lt;&#x2F;div&gt;'), '<div>TEST</div>');
    });

    it('Test String::getRandomString', () => {
        assert.isString(stringUtils.getRandomString());
    });

    it('Test String::decode', () => {
        assert.equal(stringUtils.decode('http%3A%2F%2Fw3schools.com%2Fmy%20test.asp%3Fname%3Dst%C3%A5le%26car%3Dsaab'), 'http://w3schools.com/my test.asp?name=ståle&car=saab');
    });

    it('Test String::capitalizeFirst', () => {
        assert.equal(stringUtils.capitalizeFirst('mare'), 'Mare');
        assert.equal(stringUtils.capitalizeFirst('some string is here'), 'Some string is here');
    });

    it('Test String::capitalizeEveryWord', () => {
        assert.equal(stringUtils.capitalizeEveryWord('mare care'), 'Mare Care');
    });

    it('Test String::lowercaseFirst', () => {
        assert.equal(stringUtils.lowercaseFirst('Mare care'), 'mare care');
    });

    it('Test String::toBoolean', () => {
        assert.equal(stringUtils.toBoolean('false'), false);
        assert.equal(stringUtils.toBoolean('no'), false);
        assert.equal(stringUtils.toBoolean('off'), false);
        assert.equal(stringUtils.toBoolean('disabled'), false);

        assert.equal(stringUtils.toBoolean('true'), true);
        assert.equal(stringUtils.toBoolean('yes'), true);
        assert.equal(stringUtils.toBoolean('on'), true);
        assert.equal(stringUtils.toBoolean('enabled'), true);

        assert.equal(stringUtils.toBoolean('enatarabled'), 'enatarabled');
    });

    it('Test String::truncate', () => {
        assert.equal(stringUtils.truncate('false true true', 12), 'false true t');
        assert.equal(stringUtils.truncate('false true true'), 'false true true');
        assert.equal(stringUtils.truncate(''), '');
        assert.equal(stringUtils.truncate('false true true', 12, ' ...'), 'false true t ...');
    });

    it('Test String::slugify', () => {
        assert.equal(stringUtils.slugify('false true true'), 'false-true-true');
        assert.equal(stringUtils.slugify('Quick Brown Fox in a Tree'), 'quick-brown-fox-in-a-tree');
        assert.equal(stringUtils.slugify('MyFace', 123, false, 'go home'), 'myface-123-false-go-home');
        assert.equal(stringUtils.slugify('The Heart Breakers'), 'the-heart-breakers');
        assert.equal(stringUtils.slugify('20,000 miles Under The Sea'), '20000-miles-under-the-sea');
    });

    it('Test String::removeSlashes', () => {
        assert.equal(stringUtils.removeSlashes('/false-true/'), 'false-true');
        assert.equal(stringUtils.removeSlashes('//false-true/'), 'false-true');
    });

    it('Test String::removeDashes', () => {
        assert.equal(stringUtils.removeDashes('/false-true/'), '/falseTrue/');
    });

    it('Test String::endsWith', () => {
        assert.isTrue(stringUtils.endsWith('tralaalaa lla lla', 'a'));
    });

    it('Test String::pluralize', () => {
        assert.equal(stringUtils.pluralize('tralaalaa'), 'tralaalaas');
        assert.equal(stringUtils.pluralize('tralaalaas'), 'tralaalaas');
    });

    it('Test String::removeBlankLines', () => {
        assert.equal(stringUtils.removeBlankLines('\n\t1234\n'), '1234');
    });

    it('Test String::removeLastChar', () => {
        assert.equal(stringUtils.removeLastChar('1234'), '123');
    });

    it('Test String::lastChar', () => {
        assert.equal(stringUtils.lastChar('1234'), '4');
    });

    it('Test String::removeMultipleWhitespace', () => {
        assert.equal(stringUtils.removeMultipleWhitespace('  123  4  '), '123 4');
    });

    it('Test String::insert', () => {
        assert.equal(stringUtils.insert('mare are', 5, 'c'), 'mare care');
    });

    it('Test String::removeWhiteSpace', () => {
        assert.equal(stringUtils.removeWhiteSpace(' m are c ar e '), 'marecare');
    });

    it('Test String::removeSuffix', () => {
        assert.equal(stringUtils.removeSuffix('MareCare', 'Care'), 'Mare');
        assert.equal(stringUtils.removeSuffix('MareCare', 'pdapa'), 'MareCare');
        assert.equal(stringUtils.removeSuffix('SomeStringHere', 'Here'), 'SomeString');
    });

    it('Test String::removeAll', () => {
        assert.equal(stringUtils.removeAll('MareCare', 'e'), 'MarCar');
    });

    it('Test String::replaceAll', () => {
        assert.equal(stringUtils.replaceAll('MareCare', 'e', 'E'), 'MarECarE');
    });

    it('Test String::encode', () => {
        assert.equal(stringUtils.encode('<script>Test</script>'), '%3Cscript%3ETest%3C%2Fscript%3E');
    });

    it('Test String::escapeHtml', () => {
        assert.equal(stringUtils.removeHtmlTags('<script>Test</script>'), 'Test');
        assert.equal(stringUtils.removeHtmlTags('<b>Test</b>'), 'Test');
    });

    it('Test String::decode', () => {
        assert.equal(stringUtils.decode('%3Cscript%3ETest%3C%2Fscript%3E'), '<script>Test</script>');
        assert.equal(stringUtils.decode('a%AFc'), 'a%AFc');
    });

    it('Test String::removeBOM', () => {
        assert.equal(stringUtils.removeBOM('\uFEFFBoom!'), 'Boom!');
        assert.equal(stringUtils.removeBOM('Boom!'), 'Boom!');
    });

    it('Test String::remove', () => {
        assert.equal('this is cool!', stringUtils.removeAt('this is really cool!', 8, 15));
    });

    it('Test String::toBase64', () => {
        const toBase64 = stringUtils.toBase64('MareCare');
        assert.equal(toBase64, 'TWFyZUNhcmU=');

        const toBase64Prefix = stringUtils.toBase64('MareCare', 'prefix');
        assert.equal(toBase64Prefix, 'cHJlZml4TWFyZUNhcmU=');
    });

    it('Test String::fromBase64', () => {
        const fromBase6464 = stringUtils.fromBase64('TWFyZUNhcmU=');
        assert.equal(fromBase6464, 'MareCare');

        const fromBase64Prefix = stringUtils.fromBase64('TWFyZUNhcmU=', 'prefix');
        assert.equal(fromBase64Prefix, 'MareCare');
    });

    it('Test String::toFixed', () => {
        assert.equal(stringUtils.toFixed('123456', 2), '123456.00');
        assert.equal(stringUtils.toFixed(123.2345, 3), '123.234');
    });

    it('Test String::toTitleCase', () => {
        assert.equal(stringUtils.toTitleCase('Diamond BLACK'), 'Diamond Black');
    });

    it('Test String::repeat', () => {
        assert.equal(stringUtils.repeat('Diamond', 3), 'DiamondDiamondDiamond');
        assert.equal(stringUtils.repeat('Diamond'), 'Diamond');
    });

    it('Test String::removeLast', () => {
        assert.equal(stringUtils.removeLast('Diamond'), 'Diamon');
    });

    it('Test String::sizeOf', () => {
        assert.equal(stringUtils.sizeOf('Diamond'), 7);
        assert.equal(stringUtils.sizeOf('Ћирилица'), 16);
        assert.equal(stringUtils.sizeOf('Ćirilica'), 9);
    });

    it('Test String::removeQuotes', () => {
        assert.equal(stringUtils.removeQuotes('"I am here"'), 'I am here');
        assert.equal(stringUtils.removeQuotes('I "am" here'), 'I "am" here');
        assert.equal(stringUtils.removeQuotes('I am here"'), 'I am here"');
    });

    it('Test String::removeComments', () => {
        const testString = `
            // comments at the beginning 1
            //comments at the beginning 2

            /*
            Block comments 1
            */
            
            /* Block comments 2 */

            /*Block comments 3*/

            https://test.com// and comments after them are removed
            https://tes2.com // the comment can bump right up to text
        `;

        const commentsRemoved = stringUtils.removeComments(testString);
        const clean = stringUtils.removeMultipleWhitespace(commentsRemoved);
        assert.equal(clean, 'https://test.com https://tes2.com');
    });
});


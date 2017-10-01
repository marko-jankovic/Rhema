'use strict';

// @TODO regex for Basic Authentication credentials passed in URL
const flags = 'gi';
const validators = {
    numeric: '[0-9]+',
    integer: '(\\-?[0-9]+)',
    digit: '\d+',
    decimal: '[0-9]+(\\.[0-9]{1,2})?',
    // very simply email validation
    // anystring@anystring.anystring
    email: '\\S+@\\S+\\.\\S+',
    alpha: '[a-zA-Z]+',
    alphaNumeric: '[a-zA-Z0-9]+',
    alphaDash: '[a-z0-9_\\-]+',
    natural: '[0-9]+$',
    float: '(?:[-+]?(?:[0-9]+))?(?:\\.[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?',
    noZero: '[1-9][0-9]*',
    ip: '((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})',
    base64: '([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$',
    numericDash: '[\\d\\-\\s]+',
    url: '(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]\\.[^\\s]{2,})',
    date: '\\d{4}-\\d{1,2}-\\d{1,2}',
    uuid: '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}',
    hashTag: '#(\\w*[a-zA-Z_]+\\w*)',
    zip: '(\\d{5})(?:[-\\s]*(\\d{4}))?',
    phoneNumber: '(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}',
    ascii: '[\x00-\x7F]*',
    // URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    absoluteURL: '([a-z][a-z\d\+\-\.]*:)?\/\/)',
    hexColor: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})',
    documentFile: '[^\\s]+[\\.](doc|docx|xls|xlsx|ppt|pptx|odf|odt|ods|odp|odg|pdf)',
    HTMLtag: '<[a-z/][\\s\\S]*>'
};

module.exports = {
    // contains will test if validators[type] is find in {input}, return true|false
    contains (type, input, flag) {
        return new RegExp(validators[type], flag || flags).test(input);
    },

    // exactMatch return array with one element that satisfy validators[type] regex
    exactMatch (type, input) {
        return input.match(new RegExp(`^${validators[type]}$`));
    },

    // matchAll return array of elements that satisfy validators[type] regex
    matchAll (type, input, flag) {
        return input.match(new RegExp(validators[type], flag || flags));
    },

    // isValid return true or false
    // supported validator types: {numeric}, {integer}, {digit}, {decimal}, {email}
    // {alpha}, {alphaNumeric}, {alphaDash}, {natural}, {float}, {noZero}, {ip}, {base64}
    // {numericDash}, {url} {date}, {uuid}, {hashTag}, {imageFile}, {zip}, {latitude},
    // {phoneNumber}, {ascii},
    isValid (type, input) {
        return new RegExp(`^${validators[type]}$`).test(input);
    },

    // escape("/path/to/resource.html?search=query");
    // "\/path\/to\/resource\.html\?search=query"
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    escape (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    matches (str, pattern, modifiers) {
        if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
            pattern = new RegExp(pattern, modifiers);
        }

        return pattern.test(str);
    }
};

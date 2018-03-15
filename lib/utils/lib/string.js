'use strict';

module.exports = {
    addCommas (n = '') {
        return n ? parseFloat(n).toLocaleString() : n;
    },

    // Formats price string from number
    // @param {Number} p price value, can be float
    // @param {Number} cents can be `true` meaing 2 digits or integer meaning `cents` digits
    // @return {String} formatted price
    formatPrice (p, cents) {
        // explicit truth check, as if absent cents will be 'options' object
        if (cents === true) {
            p = this.toFixed(p, 2);
        } else if (typeof cents === 'number') {
            p = this.toFixed(p, cents);
        }

        return `$${this.addCommas(p)}`;
    },

    // wrapper for the Number.toFixed() method.
    toFixed (number, decimalPlaces) {
        return (Number(number)).toFixed(decimalPlaces);
    },

    formatPhone (s = '') {
        s = s.toString().replace(/[^\d]/g, '');
        let phone = s;
        const parts = s.match(/(\d{3})(\d{3})(\d{4})/);

        // re-assemble
        if (parts && parts.length === 4) {
            phone = `(${parts[1]}) ${parts[2]}-${parts[3]}`;
        }

        // return the phone.
        return phone;
    },

    escape (val) {
        return val.replace(/([''])/g, '\\$1');
    },

    decode (str) {
        try {
            return decodeURIComponent(str).replace(/\+/g, ' ');
        } catch (e) {
            return str;
        }
    },

    encode (str) {
        return encodeURIComponent(str).replace(/\+/g, ' ');
    },

    htmlEntityDecode (str) {
        return String(str)
            .replace(/\\n/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, '\'')
            .replace(/&#37;/g, '%')
            .replace(/&#x2F;/g, '\/')
            .replace(/&quot;/g, '"');
    },

    htmlEntityEncode (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/%/g, '&#37;')
            .replace(/\//g, '&#x2F;');
    },

    // Capitalizes the first character of a string
    capitalizeFirst (str) {
        return str.substr(0, 1).toUpperCase() + str.substring(1);
    },

    // uppercase first letters of all the words
    capitalizeEveryWord (str = '') {
        str = str.toString().toLowerCase();

        return str.replace(/(?:^|\s)\S/g, s => s.toUpperCase());
    },

    // Uncapitalizes the first character of a string
    lowercaseFirst (str) {
        return str.substr(0, 1).toLowerCase() + str.substring(1);
    },

    // toTitleCase("Diamond BLACK") // => "Diamond Black"
    toTitleCase (str) {
        return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },

    // Concatenates the string `count` times
    repeat (input = '', count = 1) {
        return new Array(count + 1).join(input);
    },

    toBoolean (str) {
        switch (str) {
            case 'on':
            case 'yes':
            case 'enable':
            case 'enabled':
            case 'true':
            case '1':
                return true;

            case 'no':
            case 'off':
            case 'disable':
            case 'disabled':
            case 'false':
            case 'undefined':
            case 'null':
            case 'NaN':
            case '0':

                return false;

            default:
                return str;
        }
    },

    truncate (str = '', length = 30, end = '') {
        str = str.slice(0, length || str.length);
        return str + end;
    },

    getRandomString () {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },

    // convert string to base64
    toBase64 (str, prefix = '') {
        // return base64 string
        return Buffer.from(`${prefix}${str}`).toString('base64');
    },

    fromBase64 (str, prefix = '') {
        return Buffer.from(`${str}`, 'base64').toString('ascii').replace(prefix, '');
    },

    slugify (...args) {
        return args.map((text) => String(text).toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')).join('-');
    },

    removeSlashes (str) {
        return str.replace(/^(\/*)|(\/*)$/g, '');
    },

    removeDashes (str) {
        return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
    },

    endsWith (str, chars) {
        return str.slice(-chars.length) === chars;
    },

    removeSuffix (str, chars = '') {
        return this.endsWith(str, chars) ? str.slice(0, -chars.length) : str;
    },

    pluralize (str) {
        const stringLength = str.length;
        const lastLetter = str.charAt(stringLength - 1);

        if (lastLetter !== 's' && lastLetter !== 'z') {
            str += 's';
        }

        return str;
    },

    insert (str, index, value) {
        return str.slice(0, index) + value + str.slice(index);
    },

    removeMultipleWhitespace (str) {
        return str.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    },

    lastChar (str) {
        return str.charAt(str.length - 1);
    },

    removeLastChar (str) {
        return str.substring(0, str.length - 1);
    },

    removeBlankLines (str) {
        return str.replace(/(\t|\n)/gm, '');
    },

    removeWhiteSpace (str) {
        return str.replace(/\s+/g, '');
    },

    replaceAll (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    },

    removeAll (str, find) {
        return this.replaceAll(str, find, '');
    },

    removeBOM (str) {
        if (str.charCodeAt(0) === 0xFEFF) {
            return str.slice(1);
        }

        return str;
    },

    removeQuotes (str) {
        return str.replace(/^"(.*)"$/, '$1');
    },

    // Removes the last character of `input`
    removeLast (str) {
        return str.slice(0, -1);
    },

    removeHtmlTags (str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    },

    removeComments (str) {
        // https://www.regextester.com/?fam=96247
        return str.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    },

    // Removes the characters between the `start` and `end` indexes
    removeAt (input, start, end) {
        return input.slice(0, start) + input.slice(end);
    },

    sizeOf (str) {
        return Buffer.byteLength(str);
    },

    count (str, find) {
        const matched = str.match(new RegExp(find, 'ig'));
        return Array.isArray(matched) ? matched.length : 0;
    }
};

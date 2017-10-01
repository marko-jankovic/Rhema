# String utils
In order to use string utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## addCommas(n)

This function add commas to every thousand in a number.

**Arguments**
- `n` **{number}** - number of interest

**Return**
- **{number}** - formated with commas

```js
let number1 = 1234;
let number2 = 123456
ler result1 = utils.string.addCommas(number1);
ler result2 = utils.string.addCommas(number2);
// result1 = 1,234;
// result2 = 123,456;
```

---

## formatPrice (p, cents)
This function formats price into string representation. 

**Arguments**
- `p` **{number}** - price
- `cents` **{number}** - cents, namely how many decimal points there should be

**Return**
- **{string}** - returns the string formated in '$123.12' (for instance) 

```js

let result1 = utils.string.formatPrice(123.123, 2);
// result1 = '$123.12';
```

---

## toFixed (number, decimalPlaces)
This function formats the number and puts desired number of decimal places.

**Arguments**
- `number` **{number|string}** - number of interest
- `decimalPlaces` **{number}** - number of decimal places

**Return**
- **{string}** - returns the string formated in '123.12' (for instance) 

```js

let result1 = utils.string.formatPrice('123.123', 2);
// result1 = '$123.12';
```

---

## formatPhone (s)
This function formats the string into phone number 12345632132 -> '(123) 456-3213'

**Arguments**
- `s` **{number|string}** - phone number of interest

**Return**
- **{string}** - returns the string formated in '(123) 456-3213' (for instance) 

```js

let result1 = utils.string.formatPhone(12345632132', 2);
// result1 = '$123.12';
```

---

## escape (variable)
This function adds two more escpaes|backslashes ('\') to the already exisitng one.

**Arguments**
- `variable` **{string}** - string with escape present

**Return**
- **{string}** - returns the string with added backslashes 

```js

let result = utils.string.escape('data\'da');
// result = 'data\\\'da';
```

---

## decode (string)
This function decodes the string.

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - returns the decoded 

```js

let result = utils.string.decode('http%3A%2F%2Fw3schools.com%2Fmy%20test.asp%3Fname%3Dst%C3%A5le%26car%3Dsaab');
// result = 'http://w3schools.com/my test.asp?name=ståle&car=saab';
```

---

## encode (string)
This function encodes the string.

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - returns encoded string

```js

let result = utils.string.encode('http://w3schools.com/my test.asp?name=ståle&car=saab');
// result = 'http%3A%2F%2Fw3schools.com%2Fmy%20test.asp%3Fname%3Dst%C3%A5le%26car%3Dsaab';
```

---

## htmlEntityDecode (str)
This function decodes HTML entities such as &amp; &gt; &lt; and so on

**Arguments**
- `str` **{string}** - string of interest 

**Return**
- **{string}** - returns encoded string

```js

let result = utils.string.htmlEntityDecode('<p>C&amp;A</p>');
// result = '<p>C&A</p>';
```

---

## htmlEntityEncode (str)
This function encodes HTML entities (oposite of htmlEntityDecode function above)

**Arguments**
- `str` **{string}** - string of interest containing &, <, > and so on

**Return**
- **{string}** - returns string with only the first letter changed to capital

```js

let result = utils.string.htmlEntityDecode('C>A');
// result = 'C&gt;A';
```

---

## toProperUpper (str)
This function makes the first letter of every word captilized.

**Arguments**
- `str` **{string}** - string of interest 

**Return**
- **{string}** - returns string with the first letter of every word captilized

```js

let result = utils.string..capitalizeFirst('some string is here');
// result = 'Some String Is Here';
```

---

## lowercaseFirst (str)
This function makes the first letter lowercased

**Arguments**
- `str` **{string}** - string of interest 

**Return**
- **{string}** - returns string with the first letter lowercased

```js

let result = utils.string.toBoolean('false');
// result = 'some string is here';
```

---

## toBoolean (string)
This function converts one of the following strings  'on', 'yes', 'enable', 'enabled', 'true', '1' to **true**
or
on of the case 'no', 'off', 'disable', 'disabled', 'false', 'undefined', 'null', 'NaN', '0' to **false**

**Arguments**
- `string` **{string}** - string of interest 

**Return**
- **{boolean|string}** - returns boolean or string itself if it's different for the listed strings

```js

let result = utils.string.toBoolean('false');
// result = false;
```

---

## truncate (str, length)
This function returns the substring from 0 to length of the string.

**Arguments**
- `string` **{string}** - string of interest 

**Return**
- **{string}** - returns str[0]-str[length] (inclusive)

```js

let result = utils.string.truncate('false true true', 12);
// result = 'false true t';
```

---

## getRandomString ()
This function returns random string length of 5 chars.

**Arguments**
- no arguments 

**Return**
- **{string}** - returns str[0]-str[length] (inclusive)

```js

let result = utils.string.getRandomString();
// result = 'gerwg';
```

---

## toBase64 (str, prefix = '')
This function encodes string using Base64 by default. With prefix specified hash is salted.

**Arguments**
- `string` **{string}** - string of interest
- `prefix` **{string}** - default value is empty string

**Return**
- **{string}** - encoded string

```js

let result = utils.string.toBase64('This is string example from Vast.com');
// result = 'VGhpcyBpcyBzdHJpbmcgZXhhbXBsZSBmcm9tIFZhc3QuY29t';
```

---

## fromBase64 (str, prefix = '')
This function decodes string using Base64. With prefix specified hash is salted.

**Arguments**
- `string` **{string}** - string of interest
- `prefix` **{string}** - default value is empty string


**Return**
- **{string}** - decoded string

```js

let result = utils.string.toBase64('VGhpcyBpcyBzdHJpbmcgZXhhbXBsZSBmcm9tIFZhc3QuY29t');
// result = 'This is string example from Vast.co';
```

---

## slugify (text)
This function inserts '-' between words

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - returns string with '-' between the words

```js

let result = array.string.slugify('false some text here true true');
// result = 'false-some-text-here-true-true';
```

---

## removeSlashes (string)
This function removes slashes from the string.

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - returns string without '/'

```js

let result = array.string.removeSlashes('//false-true/');
// result = 'false-true';
```

---

## removeDashes (string)
This function removes dashes '-' from the string.

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - returns string without '-'

```js

let result = array.string.removeSlashes('/false-true/');
// result = 'false-true';
```

---

## endsWith (string, chars)
This function checks if the string ends with passed chars

**Arguments**
- `string` **{string}** - string of interest
- `chars` **{string}** - string which should be the end of the string

**Return**
- **{boolean}** - returns true|false

```js

let result = array.string.endsWith('some string is here', 'here');
// result = true;
```

---

## removeSuffix (string, chars)
This function removes required sufix

**Arguments**
- `string` **{string}** - string of interest
- `chars` **{string}** - sufix which should removed

**Return**
- **{string}** - string w/o suffix

```js

let result = array.string.removeSuffix('SomeStringHere', 'Here');
// result = 'SomeString';
```

---

## pluralize (string)
This function makes plural of the provied string

**Arguments**
- `string` **{string}** - string of interest

**Return**
- **{string}** - string with 's' added at the end, unless string already ends with 's' or 'z'

```js

let result = array.string.pluralize('book');
// result = 'books';
```

---

## insert (str, index, value)
This function inserts specified value at the provided index.

**Arguments**
- `str` **{string}** - string of interest
- `index` **{number}** - index of interest
- `value` **{string}** - value which should be inserted

**Return**
- **{string}** - string with the inserted value

```js

let result = utils.string.insert('some sting', 7, 'r');
// result = 'some string';
```

---

## removeMultipleWhitespace (str)
This function removes white spaces.

**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - string without multiple whitespaces

```js

let result = utils.string.removeMultipleWhitespace('  123  4  ');
// result = '123 4';
```

---

## lastChar (str)
This function returns the last char of the string.

**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - last char of the provided string

```js

let result = utils.string.removeMultipleWhitespace('1234');
// result = '4';
```

---

## removeLastChar (str)
This function removes the last char from the string.

**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - string without the last char

```js

let result = utils.string.removeLastChar('1234');
// result = '123';
```

---

## removeBlankLines (str)
This function removes blank lines, for instance: \t or \n

**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - string without \t or \n

```js

let result = utils.string.removeBlankLines('\n\t1234\n');
// result = '1234';
```

---

## removeWhiteSpace (str)
This function removes all white spaces from the string.

**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - string without spaces

```js

let result = utils.string.removeWhiteSpace('some         string      goes here');
// result = 'somestringgoeshere';
```

---




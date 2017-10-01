# Regex utils
In order to use regex utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## contains (type, input, flag)
This function checks if the input contains any of the validators listed.


**Arguments**
- `type` **{any}** - one of the various types listed in the validators object in regex.js
- `input` **{string}** - variable of interest
- `flag` **{string}** - 'g', 'i', 'm', 'u', 'y' or combination


**Return**
- **{boolean}** - true|false depending on if the match was found

```js
let hasNumbers = regUtil.contains('numeric', 'Some string goes here 9');
// hasNumbers = true;
```

---

## exactMatch (type, input)
This function checks if the input is exact match with the string of interest.


**Arguments**
- `type` **{any}** - one of the various types listed in the validators object in regex.js
- `input` **{string}** - string of interest

**Return**
- **{array}** - array with element input if that input is exact regex

```js
let myVar = '99';
let isExact = regUtil.exactMatch('numeric', myVar);
// isExact = [ '99', '99', index: 0, input: '99' ]
```

---

## matchAll (type, input, flag)
This function creates the array of matched validator[types].


**Arguments**
- `type` **{any}** - one of the various types listed in the validators object in regex.js
- `input` **{string}** - string of interest
- `flag` **{string}** - 'g', 'i', 'm', 'u', 'y' or combination


**Return**
- **{array}** - array of elements that satisfy validators[type] regex

```js
let myVar = '11211 has 19456stores';
let allMatches = regUtil.matchAll('numeric', myVar);
// allMatches = ['11211', '19456'];
```

---

## isValid (type, input, flag)
This function checks if the input is valid validator type {numeric}, {integer}, {digit}, {decimal}, {email}, {alpha}, {alphaNumeric}, {alphaDash}, {natural}, {float}, {noZero}, {ip}, {base64}, {numericDash}, {url} {date}, {uuid}, {hashTag}, {imageFile}, {zip}, {latitude}, {phoneNumber}, {ascii}


**Arguments**
- `type` **{any}** - one of the various types listed in the validators object in regex.js
- `input` **{string}** - variable of interest
- `flag` **{string}** - 'g', 'i', 'm', 'u', 'y'

**Return**
- **{boolean}** - true|false depending if the match was found

```js
let myVar = '11211has19stores';
let isValid = regUtil.isValid('alphaNumeric', myVar);
// isValid = true;
```

---

## escape (str)
This function adds '\\' in front of all special characters.


**Arguments**
- `str` **{string}** - string of interest

**Return**
- **{string}** - string with added backslashes

```js
let myVar = '/path/to/resource.html?search=query';
let escaped = regUtil.escape(myVar);
// isValid = //path/to/resource\.html\?search=query'
```

---

## matches (str, pattern, modifiers)
This function recognizes pattern in string if present.


**Arguments**
- `str` **{string}** - string of interest
- `str` **{pattern}** - pattern of interest
- `str` **{modifiers}** - string of interest

**Return**
- **{boolean}** - string with added backslashes

```js
let myVar = 'Hello world, hello there';
let match = regUtil.matches(myVar, 'hello', 'gi');
// match = true
```

---


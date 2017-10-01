# Json utils
In order to use json utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## safeParse(json)
This function calls `JSON.parse(json)` without raising runtime error if `JSON.parse` fails.

**Arguments**
- `json` **{string}** - string of interest, for instance '{"someKey": "someValue"}'

**Return**
- **{object}** - returns the constructed object from the provided string or null if JSON.parse operation fails.

```js
let someString = '{"someKey": "someValue"}';
let parsed = utils.json.safeParse(someString);
// parsed = { someKey: "someValue"};
```

---

## safeStringify(json)
This function converts a JavaScript value to JSON string without raising runtime error if `JSON.stringify` fails.

**Arguments**
- `json` **{object}** - JavaScript object.

**Return**
- **{string}** - JSON string or null if JSON.stringify operation fails.

```js
let myObj = [1, 2, 3];
let myObjStringify = utils.json.safeStringify(arr);
// amyObjStringifyrr = '{"x":"someValue here"}';
```

---

## isCyclic(obj)
This function checks if the declared object contains a reference to itself.

**Arguments**
- `obj` **{object}** - object of interest

**Return**
- **{boolean}** - returns true|false

```js
let myObj = {};
myObj.a = { b: myObj}
let isCyclicObj = utils.json.isCyclic(obj);
// isCyclicObj = true;
```

---

## updateFileSync (filePath, data, field)
This function updates file with the provided data (object) an assigns it to the key provided as a field. Execution of this function is synchronous.

**Arguments**
- `filePath` **{string}** - file path
- `data` **{object}** - object of interest
- `field` **{string}** - name of the field

**Return**
- n/a

```js
const data = { [hostname]: { workers: { forked: [], died: [] } } };
const infoPath = path.resolve(process.cwd(), config.export);
utils.json.updateFileSync(infoPath, data, 'servers');
```

---

## updateFile (filePath, data, field, callback)
This function has the same logic as previous updateFileSync, with the difference that execution is asynchronous.

**Arguments**
- `filePath` **{string}** - file path
- `data` **{object}** - object of interest
- `field` **{string}** - name of the field
- `callback` **{function}** - callback which should be called later

**Return**
- n/a

---
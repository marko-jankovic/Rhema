# Function utils
In order to use function utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## getArgs(fn)
This function returns arguments of the provided function

**Arguments**
- `fn` **{function}** - function of interest

**Return**
- **{array}** - returns array of arguments

```js
utils.function.getArgs((arg1, arg2, arg3) => {});
// arg = ['arg1', 'arg2', 'arg3']
```

---

## getFnName(fn)
This function returns the function's name. Note if anonymous function is passed returned value will be equals undefined.

**Arguments**
- `arr` **{array}** - array whose first item should be removed

**Return**
- **{string}** - returns the name of the desired function

```js
let arr = [1, 2, 3];
let fnName = utils.function.getFnName(function test (arg1, arg2, arg3) {}));
// fnName = 'name';
```

---

## setFnName(fn, name)
This function changes the name to the provided function.

**Arguments**
- `arr` **{array}** - array whose first item should be removed

**Return**
- **{string}** - returns the name of the desired function.

```js
let arr = [1, 2, 3];
let fnName = utils.function.setFnName(function test (arg1, arg2, arg3) {}), 'anotherFunctionName');
// fnName = 'anotherFunctionName';
```

---

## spread (callback)
This function imitates behaviour of f.apply() but in this case function/callback can be anonymous

**Arguments**
- `callback` **{function}** - anonymous callback function which will be called later

**Return**
- **{string}** - executes when 

```js
// Common use
// function f(x, y, z) {}
// var args = [1, 2, 3];
// f.apply(null, args);

spread(function(x, y, z) {})([1, 2, 3]);
```

---

## debounce (func, wait, immediate)
Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds.

**Arguments**
- `func` **{function}** - function wich will be invoked after N ms
- `wait` **{function}** - how many ms
- `immediate` **{function}** - if immediate is passed, trigger the function on the leading edge, instead of the trailing.

**Return**


```js
//
```

---
## asyncTryCatch (fnStack, namespace)


**Arguments**
- `fnStack` 
- `namespace`

**Return**


```js

```

---

## once (fn)
This function will execute provided function only once regardless of how many times it was invoked.

**Arguments**
- `fn` **{function}** - function of interest

**Return**
- **{any}** - returns the result of fn execution

```js
let counter = 0;
const fn = utils.function.once((arg1, arg2, arg3) => counter++);
console.log(fn);

for (let i = 0; i < 10; i++) {
    fn(1, 2, 3);
}
// counter = 1;
```

---





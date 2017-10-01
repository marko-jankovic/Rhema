# Array utils
In order to use array utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## removeAt(arr, index)
This function removes specified item from the provided array.


**Arguments**
- `arr` **{array}** - array of interest
- `index` **{number}** - item for removal

**Return**
- **{array}** - returns the same array but without specified item 

```js
let arr = [1, 2, 3];
utils.array.removeAt(arr, 1);
// arr = [1, 3];
```

---

## removeFirst(arr)

This function removes the first item from the provided array.

**Arguments**
- `arr` **{array}** - array whose first item should be removed

**Return**
- **{array}** - returns the same array but without first item 

```js
let arr = [1, 2, 3];
utils.array.removeFirst(arr);
// arr = [2, 3];
```

---

## removeLast(arr)
This function removes the last item from the provided array.

**Arguments**
- `arr` **{array}** - array whose last item should be removed

**Return**
- **{array}** - returns the same array but without last item 

```js
let arr = [1, 2, 3];
utils.array.removeLast(arr);
// arr = [1, 2];
```

---

## insertAt(arr, index, elements)
This function adds an item to the specified position.

**Arguments**
- `arr` **{array}** - array whose last item should be removed
- `index` **{number}** - position where the item should be placed
- `elements` **{type}** - item value

**Return**
- **{array}** - returns the same array but with 

```js
let arr = [1, 2, 3];
utils.array.insertAt(arr, 4, "some string");
// arr = [1, 2, 3, "some string"];
```

---

## toUpperCase(arr)
This function coverts items of the provided array to uppercase 

**Arguments**
- `arr` **{array}** - array whose last item should be removed

**Return**
- **{array}** - returns the same array but with uppercased items

```js
let arr = ["String", 3, "Some sting", 0];
utils.array.toUpperCase(arr);
// arr = ["STRING", 3, "SOME STRING", 0];
```

---

## toLowerCase(arr)
This function coverts items of the provided array to lowercase 

**Arguments**
- `arr` **{array}** - array whose last item should be removed

**Return**
- **{array}** - returns the same array but with lowercased items

```js
let arr = ["STRING", 3, "some sting", 0];
utils.array.toLowerCase(arr);
// arr = ["string", 3, "some string", 0];
```

---

## toObject(arr, key, removeKeyItem, fn)
Function that creates an object (one key-value pair) with the key provided thru second arguments and a value becomes the array passed thru the first arguments. There is one more param for removing the key item from the object and to modify the key thru function if needed

**Arguments(version 1**
- `arr` **{array}** - array which should be turned into array-like structure
- `key` **{string}** - optional, specifies which key should represents the key in returned object
- `removeKeyItem` **{boolean}** - which key should be removed from the value of the nested of returned object
- `fn` **{function}** - ?

**Return**
- **{array}** - returns the object in array-like format

```js
let arr = ['Test', 'BLALAL', '3', 'blala'];
utils.array.toObject(arr);
// arr = { 0: 'Test', 1: 'BLALAL', 2: 3,  3: 'blala'};
```

```js
let arr = [{first: 'FirstName', last: 'LastName'}];
utils.array.toObject(arr, 'first');
// arr = {FirstName: {first: 'FirstName', last: 'LastName'}}
```

```js
let arr = [{first: 'FirstName', last: 'LastName'}];
utils.array.toObject(arr, 'first', true, (val) => val.toUpperCase());
// arr = {NAME: {first: 'FirstName', last: 'LastName'}}
```

---

## swap(arr, x, y)
This function swaps palces of two items at x and y position

**Arguments**
- `arr` **{array}** - array which should be turned into array-like structure
- `x` **{number}** - position of the first item
- `y` **{number}** - position of the second item

**Return**
- **{array}** - returns the same array with swaped items

```js
let arr = ['Test', 'BLALAL', '3', 'blala'];
utils.array.swap(arr, 1, 2);
// arr = ['Test', '3', 'BLALAL', 'blala'];
```

---

## argsToArray(arg)
This function transforms function argumentsto array.

**Arguments**
- `arg` **{array-like object}** - object which represnts functions arguments
**Return**
- **{array}** - returns the array of arguments
```js
const test = function (arr, obj) {
    const argsToArray = utils.array.argsToArray(arguments;
    return argsToArray;
};
```

---

## shuffle(arr)
This function randomizes positions of items in the array.

**Arguments**
- `arg` **{array}** - array of interest

**Return**
- **{array}** - returns the array with changed position of items

```js
const test = function (arr, obj) {
    const argsToArray = utils.array.shuffle(['Test', 'BLALAL', '3', 'blala']);
    return argsToArray;
};
// ['BLALAL', 'Test', '3', 'blala']
```

---

## unique(arr)
This function eliminates duplicate elementsin the array

**Arguments**
- `arg` **{array}** - array of interest

**Return**
- **{array}** - returns the array with unique elements

```js
let arr = ['Test', 'BLALAL', '3', 'blala', '3', 'Test'];
utils.array.unique(arr)

// ['BLALAL', 'Test', '3', 'blala']
```

---

## difference(arr1, arr2)
This function returns diff between two arrays

**Arguments**
- `arr1` **{array}** - first array of interest whose elemnts are overlaping with 
- `arr2` **{array}** - array of interest

**Return**
- **{array}** - returns the array with differents elementsbetween first and second array (arr1\arr2)

```js
utils.array.difference([1, 1, 2, 3, 2, 4, 6], [1, 2, 3])

// arr = [4, 6]
```

---

## intersect(arr1, arr2)
Returns intersect between two arrays

**Arguments**
- `arr1` **{array}** - first array of interest  
- `arr2` **{array}** - array of interest

**Return**
- **{array}** - returns the array with common elements between first and second array 

```js
utils.array.intersect([1, 1, 2, 3, 2, 4, 6], [1, 2, 3])

// arr = [1, 2, 3]
```

---

## uniquePush(arr1, item)
This function pushs item into array if it's not already there.

**Arguments**
- `arr1` **{array}** - array of interest  
- `item` **{number}** - item of interest

**Return**
- **{array}** - returns the array with the item insterted at the end

```js
utils.array.uniquePush([1, 1, 2, 3, 2, 4, 6], 9)

// arr = [1, 1, 2, 3, 2, 4, 6, 9]
```

---

## equal(arr1, arr2)
This function compares two arrays

**Arguments **
- `arr1` **{array}** - array of interest  
- `arr2` **{array}** - second array of interest

**Return**
- **{boolean}** - returns boolean if two arrays are the same

```js
utils.array.uniquePush([1, 2, 3], [1, 2, 3])

// true
```

---

## clone(arr)
This function returns the same array inside the other array

**Arguments **
- `arr` **{array}** - array of interest which should be cloned

**Return**
- **{array}** - returns array with added 

```js
utils.array.clone([1, 2, 3])

// [1, 2, 3]
```

---

## flatten(arr)
This function returns the array with all nested items 

**Arguments **
- `arr` **{array}** - array of interest which should be cloned

**Return**
- **{array}** - returns array with added items from nested arrays 

```js
utils.array.flatten([[1, 2, 3, 4, [5]]])

// [1, 2, 3, 4, 5]
```

---


## compact(arr)
This function removes falsy values from provided array (false, 0, '', null, undefined)

**Arguments **
- `arr` **{array}** - array of interest which should be cleaned

**Return**
- **{array}** - returns array with removed falsy values 

```js
utils.array.compact([null, a, undefined, 0, false, b, c, ''])

// [a, b, c]
```

---

## omit(arr, fileds)
This function removes specified items or items from the provided array of the initial array

**Arguments **
- `arr` **{array}** - array of interest 
- `fileds` **{array|number}** - items for removal

**Return**
- **{array}** - returns array with removed specified values 

```js
utils.array.omit([1, 2, 3, 4], 2, 3);

// [1, 4]
```

```js
utils.array.omit([1, 2, 3, 4], [2, 3]);

// [1, 4]
```

---

## replace(arr, search, replace)
This function replaces value from the array with another

**Arguments **
- `arr` **{array}** - array of interest which should be cleaned
- `search` **{number}** - value which should be replaced
- `replace` **{number}** - value to be used as a replaced for found value

**Return**
- **{array}** - replaces value of interest (search) with another (replace)

```js
utils.array.replace([1, 2, 1, 3, 4, '1'], 1, 9);

// [9, 2, 9, 3, 4, '1'];
```

---

## sortBy(toSort, key, order = false, isNumericSort = false)
This function sort the array by specified criteria

**Arguments **
- `arr` **{array}** - array of interest which should be sorted
- `key` **{string}** - parmeter as a sorting key
- `order` **{boolean}** - default false, determing ascending (default) or decending order
- `isNumericSort` **{boolean}** - default false

**Return**
- **{array}** - returns array with removed falsy values 

```js
let arr = [{"name": "cors"}, {"name": "helmet-hsts"}, {"name": "cookie-parser"}];
utils.array.sortBy(toSort, 'name');

// [{"name": "cookie-parser"}, {"name": "cors"}, {"name": "helmet-hsts"}];
```

---



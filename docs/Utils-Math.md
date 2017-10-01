# Array utils
In order to use Math utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## geoDistance(point1, point2)
This function calculates distance between two points with specified latitude and longitude.


**Arguments**
- `point1` **{array}** - [lon1, lat1]
- `point2` **{array}** - [lon2, lat2]

**Return**
- **{object}** - returns the objects with distance in either miles and kilometeres

```js
const rio = [-22.928042, -43.165283];
const belgrade = [44.7561365302915, 20.4688825302915];
const distance = utils.math.geoDistance(rio, belgrade);
// { miles: 6157.953551590695, kilometers: 9907.760157608556 }
```

---

## bytesToSize (bytes, nFractDigit, space)

This function coverts bytes to KB, MB, GB;

**Arguments**
- `bytes` **{number}** - bytes which should be converted to KB, MB, GB
- `nFractDigit` **{number}** - number of decimals
- `space` **{number}** - generating space in the returned value, i.e "12 KB"

**Return**
- **{array}** - bytes into KB, MB, GB

```js
const bytesToKB = utils.math.bytesToSize(12345);
// 12 KB
```

---

## parseHrtime (startTime)

This function calculates the current high-resolution real time in a [seconds, miliseconds]

**Arguments**
- `startTime` **{number}** - time generated earlier

**Return**
- **{array}** - returns the same array but without first item

```js
const startTime = process.hrtime();
hrtime = mathUtil.parseHrtime(startTime);

// hrtime = { timeEndRaw: 505.58729, timeEnd: '505.59 ms' }
```

---


## getRandomInteger (min, max)

This function returns random number between min and max inclusive

**Arguments**
- `min` **{number}** - minimum
- `max` **{number}** - maximum

**Return**
- **{number}** - number between min and max inclusive

```js
let randomNumber = utils.math.getRandomInteger(1,5);
// randomNumber = 2;
```

---




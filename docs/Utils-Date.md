# Date utils
In order to use array utils the following line needs to be included in the file.
```js
const utils = require('rhema').Utils;
```

## dateToString (date, separator)
This function formats Date object to String.


**Arguments**
- `date` **{Date}** - date object generated earlier
- `separator` **{string}** - optional separator 

**Return**
- **{string}** - date in string format 

```js
let date = new Date();
let stringDate = dateUtil.dateToString(date);
// stringDate = 11/08/2017;
```

```js
let date = new Date();
let stringDateSeparator = dateUtil.dateToString(date, '|');
// stringDate = 11|08|2017;
```

---

## today()

This function returns the number of milliseconds between midnight of January 1, 1970 and the current moment.

**Arguments**
- no arguments

**Return**
- **{number}** - number of milliseconds 

```js
let today = dateUtil.today();
// today = 1510148088019
```

---

## compare (date1, date2)

This function compares two Date objects

**Arguments**
- `date1` **{Date}** - date object generated earlier
- `date2` **{string}** - date object generated earlier

**Return**
- **{number}** - returns -1 if the first date1 is before date2, 0 if they are equal, 1 if date2 is before date1  

```js
let date1 = new Date();
let date2 = new Date(2017, 10, 5);
let result = dateUtil.compare(date1, date2);
// result = 1 
```

---

## equalsDay (date1, date2)

This function compares two Date objects by day

**Arguments**
- `date1` **{Date}** - date object generated earlier
- `date2` **{string}** - date object generated earlier

**Return**
- **{boolean}** - returns -1 if the first date1 is before date2, 0 if they are equal, 1 if date2 is before date1  

```js
let date1 = new Date(2017, 9, 5);
let date2 = new Date(2017, 10, 5);
let date3 = new Date(2017, 4, 6);
let result1 = dateUtil.compare(date1, date2);
let result2 = dateUtil.compare(date1, date3);
// result1 = true
// result2 = false
```


---

## isLeapYear (year)

This function checks if the year is leap year.

**Arguments**
- `year` **{number}** - year of interest


**Return**
- **{boolean}** - true if the year is leap

```js
let result = dateUtil.isLeapYear(2014);
// result = false
```

```js
let result = dateUtil.isLeapYear(2016);
// result = true
```

---

## getDaysInMonth (year, month)

This function gives number of days in a month

**Arguments**
- `year` **{number}** - year of interest
- `month` **{number}** - month of interest


**Return**
- **{number}** - number of days in the month of interest

```js
let days1 = dateUtil.getDaysInMonth(2014, 0);
let days2 = dateUtil.getDaysInMonth(2016, 1);
// days1 = 31
// days2 = 29
```

---

## add (date, offset, component)

This function adds specified number of days/hours/minutes/seconds to the already generated date.

**Arguments**
- `date` **{number}** - specified date 
- `offset` **{number}** - number of days/hours/minutes/seconds which will be added
- `component` **{string}** - mandatory argument, 'd' for days, 'h' for hours, 'm' for minutes, 's' for seconds


**Return**
- **{Date}** -     

```js
let day1 = new Date(2017, 5, 4);
let addedDays = dateUtil.add(day1, 5, 'd');
// result = 2017-11-08T17:45:39.868Z
```

---

## tomorrow (date)

This function returns the next day comparing to specified date.

**Arguments**
- `date` **{number}** - specified date 


**Return**
- **{Date}** - tomorrow   

```js
let day1 = new Date(2017, 10, 3);
let tomorrow = dateUtil.tomorrow(day1);
// tomorrow = 2017-11-04T23:00:00.000Z
```

---

## yesterday (date)

This function returns the previous day comparing to specified date.

**Arguments**
- `date` **{number}** - specified date 


**Return**
- **{Date}** - yesterday 

```js
let day1 = new Date(2017, 10, 3);
let tomorrow = dateUtil.tomorrow(day1);
// tomorrow = 2017-11-02T23:00:00.000Z
```

---



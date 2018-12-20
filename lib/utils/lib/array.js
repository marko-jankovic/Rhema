'use strict';

module.exports = {
    // remove array element at index position
    removeAt (arr, index) {
        arr.splice(index, 1);

        return arr;
    },

    // remove first element from array
    removeFirst (arr) {
        return this.removeAt(arr, 0);
    },

    // remove last element from array
    removeLast (arr) {
        return this.removeAt(arr, arr.length - 1);
    },

    // insert element to array at index position
    insertAt (arr, index, element) {
        if (element) {
            arr.splice(index, 0, element);
        }

        return arr;
    },

    // Uper Case all array items
    toUpperCase (arr) {
        return arr.map(item => typeof item === 'string' ? item.toUpperCase() : item);
    },

    // Lower Case all array items
    toLowerCase (arr) {
        return arr.map(item => typeof item === 'string' ? item.toLowerCase() : item);
    },

    // toObject: var array = [{first: 'FirstName', last: 'LastName'}];
    //  - returns an object with number key
    //      toObject(array); => {0: {first: 'FirstName', last: 'LastName'}}
    //
    //  - return an object with first value as key
    //      toObject(array, 'first'); => {FirstName: {first: 'FirstName', last: 'LastName'}}
    //
    // - return an object with first value as key and remove the key
    //      toObject(array, 'first', true); {FirstName: {last: 'LastName'}}
    //
    // @param {Array} array - array to convert
    // @param {String} key - (optional)
    // @param {Boolean} removeItemKey - remove key item (default false)
    // @param {Function} fn modify function (optional)
    toObject (arr, key, removeKeyItem, fn) {
        const object = {};
        fn = typeof removeKeyItem === 'function' ? removeKeyItem : fn;
        removeKeyItem = typeof removeKeyItem === 'function' ? false : removeKeyItem;
        fn = fn || function (k) {
            return k;
        };

        for (let i = 0; i < arr.length; i++) {
            const property = fn(arr[i][key] || i);
            object[property] = arr[i];

            if (removeKeyItem) {
                delete object[property][key];
            }
        }

        return object;
    },

    // Swapping two array items
    swap (arr, x, y) {
        arr[x] = arr.splice(y, 1, arr[x])[0];
        return arr;
    },

    // transform function arguments to array
    argsToArray (arg) {
        try {
            return Array.prototype.slice.call(arg);
        } catch (e) {
            return [].slice.call(arg);
        }
    },

    // Randomize array element order in-place
    // Using Durstenfeld shuffle algorithm.
    shuffle (arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }

        return arr;
    },

    // Eliminate duplicate elements within an array.
    unique (arr) {
        return Array.from(new Set(arr));
    },

    // Returns diff between two arrays
    difference (arr, ...values) {
        const rest = new Set([].concat(...values));
        return arr.filter(x => !rest.has(x));
    },

    // Returns intersect|section between two arrays
    intersect (source, target) {
        const a = new Set(source);
        const b = new Set(target);
        return [...a].filter(x => b.has(x));
    },

    // adds the item to the array only if it doesn't currently exist
    uniquePush (arr, item) {
        if (!arr.includes(item)) {
            arr.push(item);
        }

        return arr;
    },

    // compare two arrays
    equal (arr1, arr2) {
        let flag = true;

        if (arr1.length !== arr2.length) {
            flag = false;
            //
        } else {
            flag = arr1.every((v, k) => {
                if (typeof v === 'object' && JSON.stringify(v) === JSON.stringify(arr2[k])) {
                    return true;
                } else if (Array.isArray(v)) {
                    return this.equal(v, arr2[k]);
                } else {
                    return v === arr2[k];
                }
            });
        }

        return flag;
    },

    // clone array
    clone (arr) {
        return [...arr];
    },

    // flatten([[1,[2,[[3]]]],4,[5,[[[6]]]]]); => [1 2 3 4 5 6]
    flatten (list) {
        return list.reduce((a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []);
    },

    // Remove all falsy values from an array.
    // Return an array without falsy values
    // compact([null, a, undefined, 0, false, b, c, '']); => [a, b, c]
    compact (arr) {
        return arr.filter(Boolean);
    },

    // remove item or array of items from array
    omit (arr, ...fields) {
        return arr.filter(item => this.flatten(fields).indexOf(item) === -1);
    },

    // replace array value
    replace (arr, search, replace) {
        arr.forEach((value, key) => {
            if (value === search) {
                arr[key] = replace;
            }
        });

        return arr;
    },

    // sortBy(arrayOfObjects, 'id', ['0-15', '15-20', '20-25']);
    // sortBy(arrayOfObjects, 'id');
    sortBy (toSort, key, order = false, isNumericSort = false) {
        let values = [];

        // order by array list
        if (order && Array.isArray(order)) {
            const keys = toSort.map(val => val[key]);
            const map = order.map(id => keys.indexOf(id));

            map.forEach(i => values.push(toSort[i]));
        } else {
            values = toSort.sort((a, b) => {
                if (isNumericSort) {
                    const x = parseFloat(a[key]);
                    const y = parseFloat(b[key]);

                    // sort numbers, default is by 'ASC'
                    // if order is true it will order by 'DESC'
                    return order ? (y - x) : (x - y);
                    //
                } else {
                    // sort strings
                    const x = a[key] ? a[key].toLowerCase() : a[key];
                    const y = b[key] ? b[key].toLowerCase() : b[key];

                    // localeCompare method returns a number indicating
                    // whether a reference string comes before or after
                    // or is the same as the given string in sort order
                    if (order) {
                        return y ? y.localeCompare(x) : b[key];
                    } else {
                        return x ? x.localeCompare(y) : a[key];
                    }
                }
            });
        }

        // immutable array
        return [...values];
    },

    truncate (arr, index) {
        arr.length = parseInt(index);

        return arr;
    },

    tail (arr, index) {
        return arr.slice(-index);
    },

    chunks (arr, size) {
        if (arr.length && size > 0) {
            const firstSlice = arr.slice(0, size);
            const secondSlice = this.chunks(arr.slice(size), size);
            return [firstSlice].concat(secondSlice);
        } else {
            return [];
        }
    },

    // Finds and return array duplicates
    findDuplicates (arr) {
        let sorted = arr.slice().sort();
        let results = [];

        for (let i = 0; i < arr.length - 1; i++) {
            if (sorted[i + 1] === sorted[i]) {
                results.push(sorted[i]);
            }
        }

        return results;
    }
};


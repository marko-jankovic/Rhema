'use strict';

// @TODO - rewrite deepMerge and deep
const _ = require('lodash');

module.exports = {
    // deep object merge
    merge (target, source = {}, immutable) {
        let data = immutable ? this.deepClone(target) : target;

        Object.keys(source).forEach((key) => {
            if (this.isObject(source[key])) {
                // diff fields
                if (!data[key]) {
                    data = Object.assign(data, this.deepClone({ [key]: source[key] }));
                } else {
                    data[key] = this.merge(data[key], source[key], true);
                }
            } else {
                if (!data[key]) {
                    data = Object.assign(data, { [key]: source[key] });
                } else {
                    data[key] = source[key];
                }
            }
        });

        return data;
    },

    // sort object by key
    sortBy (obj, iterator, returnObj) {
        const result = returnObj ? {} : [];
        const comparator = (a, b) => {
            return iterator(obj[a], obj[b]);
        };

        Object.keys(obj).sort(comparator).forEach((key) => {
            if (returnObj) {
                result[key] = obj[key];
            } else {
                result.push(obj[key]);
            }
        });

        return result;
    },

    sortByProperty (obj, prop, reverseSort) {
        const hasProp = [];
        const sortBy = [];

        Object.keys(obj).forEach((key) => {
            // separate objects in two groups, with and without {prop}
            obj[key][prop] ? hasProp.push(obj[key]) : sortBy.push(obj[key]);
        });

        // sort by {prop} value
        hasProp.sort((a, b) => parseInt(a[prop]) - parseInt(b[prop]));

        // reverse merge
        return reverseSort ? hasProp.concat(sortBy) : sortBy.concat(hasProp);
    },

    // return object by string dot location
    getValue (object, string, delimiter) {
        const parts = string ? string.split(delimiter || '.') : '';

        if (parts.length === 1) {
            return object[string];
        } else {
            const last = parts.pop();
            const length = parts.length;
            let i = 1;
            let current = parts[0];

            while ((object = object[current]) && i < length) {
                current = parts[i];
                i++;
            }

            if (object) {
                return object[last];
            }
        }
    },

    // trasform string dot notation to object
    // e.g one.two.tree => "one": {"two": {"tree": {} } }
    setValue (key, value, delimiter) {
        const obj = {};
        const parts = key.split(delimiter || '.');

        if (parts.length === 1) {
            obj[parts[0]] = value;
        } else if (parts.length > 1) {
            // concat all but the first part of the key
            const remainingParts = parts.slice(1, parts.length).join(delimiter || '.');
            obj[parts[0]] = this.setValue(remainingParts, value, delimiter);
        }

        return obj;
    },

    // deep merge two objects
    deepMerge (parent, child, mergeArrays) {
        child = _.clone(child, true);

        if (_.isUndefined(child) || _.isEmpty(child)) {
            return parent;
        }

        let merged = (Array.isArray(child) && []) || {};

        if (!Array.isArray(child)) {
            if (parent && typeof parent === 'object') {
                _.forEach(parent, (value, key) => {
                    merged[key] = parent[key];
                });
            }

            _.forEach(child, (childValue, childKey) => {
                if (!_.isObject(child[childKey]) || !child[childKey]) {
                    merged[childKey] = child[childKey];
                } else if (!parent[childKey]) {
                    merged[childKey] = child[childKey];
                } else {
                    merged[childKey] = this.deepMerge(parent[childKey], child[childKey], mergeArrays);
                }
            });
        } else {
            parent = parent || [];

            if (mergeArrays) {
                merged = parent.concat(child);
            } else {
                _.forEach(child, (childValue, childKey) => {
                    if (!merged[childKey]) {
                        merged[childKey] = childValue;
                    } else if (typeof childValue === 'object') {
                        merged[childKey] = this.deepMerge(parent[childKey], childValue, mergeArrays);
                    } else if (parent.indexOf(childValue) === -1) {
                        merged.push(childValue);
                    }
                });
            }
        }

        return merged;
    },

    // method freezes an object: that is, prevents new properties from being added to it;
    // prevents existing properties from being removed; and prevents existing properties,
    // or their enumerability, configurability, or writability, from being changed.
    // In essence the object is made effectively immutable.
    // The method returns the object being frozen.
    freeze (obj, throwError) {
        // freeze object if it is not already frozen
        return Object.isFrozen(obj) ? obj : Object.freeze(obj, throwError);
    },

    // recursive freeze
    deepFreeze (obj, throwError) {
        // Retrieve the property names defined on obj
        const propNames = Object.getOwnPropertyNames(obj);

        // Freeze properties before freezing self
        propNames.forEach((name) => {
            const prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop === 'object' && prop !== null) {
                this.deepFreeze(prop, throwError);
            }
        });

        // Freeze self (no-op if already frozen)
        return this.freeze(obj, throwError);
    },

    isObject (obj) {
        return (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null);
    },

    isEmpty (obj) {
        return (obj && obj instanceof Object && (Object.keys(obj).length === 0));
    },

    // remove keys from object
    // omit({ a: 2, b: 3, c: 4 }, ['a', 'b']); // => { c: 4 }
    omit (obj = {}, keys = []) {
        return Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => Object.assign({}, { [k] : obj[k] }))
            .reduce((res, o) => Object.assign(res, o), {});
    },

    // var stuff = { name: 'Thing', color: 'blue', age: 17 };
    // var picked = pick(stuff, 'name', 'age');
    pick (o, ...fields) {
        return fields.reduce((a, x) => {
            if (o[x]) {
                a[x] = o[x];
            }

            if (Array.isArray(x)) {
                x.forEach((xx) => {
                    if (o[xx]) {
                        a[xx] = o[xx];
                    }
                });
            }

            return a;
        }, {});
    },

    flatten (obj) {
        const flattened = {};

        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'object') {
                const flat = this.flatten(obj[key]);

                Object.keys(flat).forEach((k) => {
                    flattened[`${key}.${k}`] = flat[k];
                });
            } else {
                flattened[key] = obj[key];
            }
        });

        return flattened;
    },

    removeEnumerable (obj) {
        if (this.isObject(obj)) {
            Object.keys(obj).filter((key) => {
                if (Object.prototype[key]) {
                    delete obj[key];
                }
            });
        }

        return obj;
    },

    // Remove all falsy and empty values from object
    // compact({ "make": "Acura", "model": undefined }); => { "make": "Acura" }
    compact (obj) {
        Object.keys(obj).forEach((key) => {
            if (!Boolean(obj[key]) || (Array.isArray(obj[key]) && !obj[key].length)) {
                delete obj[key];
            }

            if (this.isObject(obj[key])) {
                if (Object.keys(obj[key]).length) {
                    obj[key] = this.compact(obj[key]);
                } else {
                    delete obj[key];
                }
            }
        });

        return obj;
    },

    deepClone (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // checks if your object have only and only specific properties you passed
    //
    // const obj = { a: 'a'};
    // isOnly(obj, ['a']); // true because only 'a' property is present
    //
    // const obj = { a: 'a', b: 'b', c: 'c' };
    // isOnly(obj, ['a', 'b']); // false because 'c' property is present
    //
    // const obj = { a: 'a' };
    // isOnly(obj, ['a', 'b']); // false because 'b' does not exist
    //
    // const obj = { a: 'a', b: 'b', c: 'c' };
    // isOnly(obj, ['a', 'b'], ['c']); // true because 'c' property is ignored
    //
    // const obj = { a: '', b: 'b', c: '' };
    // isOnly(obj, ['b']); // true because 'a' and 'c' properties are empty
    //
    // const obj = { a: [], b: 'b', c: {} };
    // isOnly(obj, ['b']); // true because 'a' and 'c' properties are empty
    isOnly (obj = {}, keys = [], ignore = []) {
        // clone obj
        const clone = Object.assign({}, obj);
        // remove falsy and {ignore} list
        const omit = this.compact(this.omit(clone, ignore));
        // remove falsy values and pick {keys} list
        const pick = this.compact(this.pick(clone, keys));
        const keysLength = keys.length;
        const objLength = Object.keys(obj).length;
        const omitLength = Object.keys(omit).length;
        const pickLength = Object.keys(pick).length;
        const matched = pickLength === objLength || pickLength === omitLength;

        if (!matched || keysLength > objLength || keysLength > pickLength) {
            return false;
        }

        return true;
    },

    toArray (obj) {
        return Object.keys(obj).map(k => [k, obj[k]]);
    },

    toMap (obj) {
        return new Map(this.toArray(obj));
    },

    // let map = new Map();
    // map.set("a", 1);
    // map.set("b", 2);
    // map.set("c", 3);
    // http://2ality.com/2015/08/es6-map-json.html
    fromMap (map) {
        // // Be careful! Maps can have non-String keys; object literals can't.
        return Array.from(map).reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value })
        ), {});
    }

    // https://stackoverflow.com/questions/21148419/efficiently-rename-re-map-javascript-json-object-keys-within-array-of-objects
    //remapKeys
};

'use strict';

const chai = require('chai');
const assert = chai.assert;

const objectUtil = require('../lib/object');

describe('# Object Utils', () => {
    const objectToSort = {
        one: { key: 1 },
        two: { key: 22 },
        tree: { key: -1 },
        four: { key: 0 },
        sixt: { key: '2' }
    };

    it('Test ObjectUtill::sortBy', () => {
        const arr = objectUtil.sortBy(objectToSort, (a, b) => parseInt(a.key) - parseInt(b.key));

        const obj = objectUtil.sortBy(objectToSort, (a, b) => parseInt(a.key) - parseInt(b.key), true);

        assert.typeOf(obj, 'object');
        assert.equal(arr[0].key, -1);
        assert.equal(arr[4].key, 22);
        assert.equal(obj.two.key, 22);
    });

    it('Test ObjectUtill::getValue', () => {
        const obj = {
            server: {
                name: 'Rhema',
                port: 8080,
                host: '127.0.0.1',
                rebootApp: {
                    timeout: 30000,
                    enabled: true
                }
            },
            one: 'one'
        };

        assert.equal(objectUtil.getValue(obj, 'server.host'), '127.0.0.1');
        assert.equal(objectUtil.getValue(obj, 'server.name'), 'Rhema');
        assert.equal(objectUtil.getValue(obj, 'one'), 'one');
        assert.isTrue(objectUtil.getValue(obj, 'server.rebootApp.enabled'));
        assert.isUndefined(objectUtil.getValue(obj, 'server.rebootApp.enab'));
    });

    it('Test ObjectUtill::setValue', () => {
        const setValue = objectUtil.setValue('Mare.Care.Najveci', 'NaSvetu');
        assert.equal(setValue.Mare.Care.Najveci, 'NaSvetu');
    });

    it('Test ObjectUtill::freeze', () => {
        const freeze = objectUtil.freeze(objectToSort, true);
        assert.throws(() => {
            freeze.one = 'test';
        });
    });

    it('Test ObjectUtill::deepFreeze', () => {
        const deepFreeze = objectUtil.deepFreeze(objectToSort, true);
        assert.throws(() => {
            deepFreeze.one = 'test';
        });
    });

    it('Test ObjectUtill::deepMerge', () => {
        const obj = objectUtil.deepMerge({
            ob: {
                sad: 'je startuj'
            },
            arr: ['arr1']
        }, {
            ob: {
                mare: 'care'
            },
            arr: ['arr2']
        });

        assert.equal(obj.ob.mare, 'care');
        assert.equal(obj.ob.sad, 'je startuj');
        assert.equal(obj.arr[0], 'arr2');
    });

    it('Test ObjectUtill::merge', () => {
        const obj = objectUtil.merge({ mare: 'care' }, { sad: 'je startuj' });
        const immutable = { mare: 'immutable' };
        const obj2 = objectUtil.merge(immutable, { mare: 'care' }, true);

        assert.equal(obj.mare, 'care');
        assert.equal(obj.sad, 'je startuj');

        assert.equal(immutable.mare, 'immutable');
        assert.equal(obj2.mare, 'care');
    });

    it('Test ObjectUtill::extend', () => {
        const BaseController = require('../../controller/baseController');
        const DI = require('../../di/injector');
        class Controller extends BaseController {
            constructor () {
                super();
                this.getModel = (name) => {
                    return name;
                }
            }
        };

        const controller = new Controller({}, {}, new DI({}), {});

        assert.equal(controller.getModel('getModelExtended'), 'getModelExtended');
    });

    it('Test ObjectUtill::isObject', () => {
        const isObj1 = objectUtil.isObject({ mare: 'care' });
        const isObj2 = objectUtil.isObject('care');
        const isObj3 = objectUtil.isObject(['care']);

        assert.isTrue(isObj1);
        assert.isFalse(isObj2);
        assert.isFalse(isObj3);
    });

    it('Test ObjectUtill::isEmpty', () => {
        const isObj1 = objectUtil.isEmpty({ mare: 'Care' });
        const isObj2 = objectUtil.isEmpty({});

        assert.isFalse(isObj1);
        assert.isTrue(isObj2);
    });

    it('Test ObjectUtill::toArray', () => {
        const obj = {
            1: 'one',
            2: 'two'
        };

        const toArray = objectUtil.toArray(obj);
        assert.deepEqual(toArray, [ ['1', 'one'], ['2', 'two'] ]);
    });

    it('Test ObjectUtill::toMap', () => {
        const obj = {
            first: 'one',
            second: 'two'
        };

        const toMap = objectUtil.toMap(obj);

        assert.equal(toMap.get('first'), 'one');
        assert.equal(toMap.get('second'), 'two');
    });

    it('Test ObjectUtill::deepClone', () => {
        const obj = {
            first: 'one',
            second: 'two',
            deep: {
                mare: 'care'
            }
        };

        const deepClone = objectUtil.deepClone(obj);

        deepClone.first = 'mare';
        deepClone.deep.mare = 'mare';

        assert.equal(obj.first, 'one');
        assert.equal(obj.deep.mare, 'care');
    });

    it('Test ObjectUtill::omit', () => {
        const obj = {
            one: { key: 1 },
            two: { key: 22 },
            tree: { key: -1 },
            four: { key: 0 },
            sixt: { key: '2' }
        };
        const omit1 = objectUtil.omit(obj, ['one', 'sixt']);
        const omit2 = objectUtil.omit(obj, ['one', 'tra']);

        assert.lengthOf(Object.keys(obj), 5);
        assert.lengthOf(Object.keys(omit1), 3);
        assert.lengthOf(Object.keys(omit2), 4);
    });

    it('Test ObjectUtill::pick', () => {
        const pick1 = objectUtil.pick({
            one: { key: 1 },
            two: { key: 22 }
        }, ['one']);

        const pick2 = objectUtil.pick({
            one: { key: 1 },
            two: { key: 22 },
            tree: { key: 22 }
        }, 'one', 'two');

        assert.lengthOf(Object.keys(pick1), 1);
        assert.property(pick1, 'one');

        assert.lengthOf(Object.keys(pick2), 2);
        assert.property(pick2, 'one');
        assert.property(pick2, 'two');
    });

    it('Test ObjectUtill::flatten', () => {
        const flatten = objectUtil.flatten({
            a: {
                aa: 1,
                ab: {
                    aba: undefined,
                    abb: {
                        abca: 12
                    },
                    c: undefined
                }
            },
            b: 2,
            c: 3,
            d: undefined
        });

        assert.equal(flatten['a.aa'], 1);
        assert.equal(flatten['a.ab.abb.abca'], 12);
        assert.equal(flatten['a.ab.c'], undefined);
    });

    it('Test ObjectUtill::removeEnumerable', () => {
        const removeEnumerable = objectUtil.removeEnumerable({
            b: 2,
            c: 3,
            hasOwnProperty: 'hasOwnProperty'
        });

        assert.lengthOf(Object.keys(removeEnumerable), 2);
    });

    it('Test ObjectUtill::compact', () => {
        const compact1 = objectUtil.compact({ "make": "Acura", "model": undefined });
        const compact2 = objectUtil.compact({ "make": [], "model": '' });
        const compact3 = objectUtil.compact({ "make": {}, "model": 'CL' });
        const compact4 = objectUtil.compact({ "make": { "value": false }, "model": 'CL' });

        assert.lengthOf(Object.keys(compact1), 1);
        assert.lengthOf(Object.keys(compact2), 0);
        assert.lengthOf(Object.keys(compact3), 1);
        assert.lengthOf(Object.keys(compact4), 2);
    });
});

describe('Test ObjectUtill::isOnly', () => {
    it('should return false', () => {
        const obj = { a: 'a', b: 'b', c: 'c' };
        assert.isFalse(objectUtil.isOnly(obj, ['a', 'b']));
    });

    it('should return true', () => {
        const obj = { a: 'a', b: 'b' };
        assert.isTrue(objectUtil.isOnly(obj, ['a', 'b']));
    });

    it('should return false', () => {
        const obj = { a: 'a' };
        assert.isFalse(objectUtil.isOnly(obj, ['a', 'b']));
    });

    it('should return true and ignore items', () => {
        const obj = { a: 'a', b: 'b', c: 'c' };
        assert.isTrue(objectUtil.isOnly(obj, ['a', 'b'], ['c']));
    });

    it('should return true and ignore empty strings', () => {
        const obj = { a: '', b: 'b', c: '' };
        assert.isTrue(objectUtil.isOnly(obj, ['b']));
    });

    it('should return false', () => {
        const params = { location: '11211', range: '50', make: 'Ford', model: 'Focus' };
        const match = ['make', 'model', 'trim'];
        const whiteList = ['showOnly', 'beatle', 'exterior_color', 'interior_color', 'price', 'mileage', 'drive_type', 'mpg', 'range', 'vehicle_condition', 'transmission', 'drive_type', 'details', 'sort', 'fuel', 'page', 'perPage', 'expired', 'vcond', 'location' ];

        assert.isFalse(objectUtil.isOnly(params, match, whiteList));
    });
});

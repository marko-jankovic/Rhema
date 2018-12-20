'use strict';

const chai = require('chai');
const assert = chai.assert;

const arrUtil = require('../lib/array');

describe('# Array Utils', () => {
    it('Test Array::argsToArray', () => {
        const test = function (arr, obj) {
            const argsToArray = arrUtil.argsToArray(arguments);
            return argsToArray;
        };

        assert.lengthOf(test(['1', '2'], { test: 'test' }), 2);
    });

    it('Test Array::swap', () => {
        const swap = arrUtil.swap(['1', '2', '3', '4'], 1, 3);
        assert.equal(swap[1], 4);
        assert.equal(swap[3], 2);
    });

    it('Test Array::toLowerCase', () => {
        const toLowerCase = arrUtil.toLowerCase(['Test', 'BLALAL', '3', 'blala', 3]);
        assert.equal(toLowerCase[0], 'test');
        assert.equal(toLowerCase[1], 'blalal');
        assert.equal(toLowerCase[4], 3);
    });

    it('Test Array::toUpperCase', () => {
        const toUpperCase = arrUtil.toUpperCase(['Test', 'BLALAL', '3', 'blala', 3]);
        assert.equal(toUpperCase[0], 'TEST');
        assert.equal(toUpperCase[3], 'BLALA');
        assert.equal(toUpperCase[4], 3);
    });

    it('Test Array::removeAt', () => {
        const removeAt = arrUtil.removeAt(['Test', 'BLALAL', '3', 'blala'], 0);
        assert.equal(removeAt[0], 'BLALAL');
    });

    it('Test Array::removeFirst', () => {
        const removeFirst = arrUtil.removeFirst(['Test', 'BLALAL', '3', 'blala']);
        assert.equal(removeFirst[0], 'BLALAL');
    });

    it('Test Array::removeLast', () => {
        const removeLast = arrUtil.removeLast(['Test', 'BLALAL', '3', 'blala']);
        assert.isUndefined(removeLast[3]);
    });

    it('Test Array::insertAt', () => {
        const insertAt = arrUtil.insertAt(['Test', 'BLALAL', '3', 'blala'], 2, 'MARE');
        assert.equal(insertAt[2], 'MARE');

        const insertAt2 = arrUtil.insertAt(['Test', 'BLALAL', '3', 'blala'], 2);
        assert.lengthOf(insertAt2, 4);
    });

    it('Test Array::toObject', () => {
        const toObject = arrUtil.toObject(['Test', 'BLALAL', '3', 'blala']);
        const toObject1 = arrUtil.toObject([{first: 'Name', last: 'Surname'}], 'first', true, (val) => val.toUpperCase());
        assert.equal(toObject['0'], 'Test');
        assert.equal(toObject['3'], 'blala');
    });

    it('Test Array::shuffle', () => {
        const shuffle = arrUtil.shuffle(['Test', 'BLALAL', '3', 'blala']);
        assert.lengthOf(shuffle, 4);
    });

    it('Test Array::unique', () => {
        const unique = arrUtil.unique([1, 1, 2, 3, 2, 4]);
        assert.lengthOf(unique, 4);
    });

    it('Test Array::difference', () => {
        const difference = arrUtil.difference([1, 1, 2, 3, 2, 4], [1, 2, 3]);
        assert.equal(difference.join(''), '4');
    });

    it('Test Array::intersect', () => {
        const intersect = arrUtil.intersect([1, 1, 2, 3, 2, 4, 5], [1, 3]);
        assert.lengthOf(intersect, 2);
    });

    it('Test Array::uniquePush', () => {
        const uniquePush1 = arrUtil.uniquePush([1, 2, 3, 4], 1);
        const uniquePush2 = arrUtil.uniquePush([1, 2, 3, 4], 5);
        assert.lengthOf(uniquePush1, 4);
        assert.lengthOf(uniquePush2, 5);
    });

    it('Test Array::equal', () => {
        const equal1 = arrUtil.equal([1, 2, 3, 4], [1]);
        const equal2 = arrUtil.equal([1, 2, 3, 4], [1, 2, 3, 4]);
        const equal3 = arrUtil.equal([1, 2, 3, { test: 'test', arr: [1, 2, 3] }], [1, 2, 3, { test: 'test', arr: [1, 2, 3] }]);
        const equal4 = arrUtil.equal([1, 2, 3, { test: 'test', arr: [1, 2] }], [1, 2, 3, { test: 'test', arr: [1, 2, 3] }]);
        const equal5 = arrUtil.equal([{ test: 'test', arr: [1, 2] }], [{ test: 'test', arr: [1, 2] }]);
        const equal6 = arrUtil.equal([{ test: 'test', arr: [1, 2] }], [{ test: 'test', arr: [1, 2, 3] }]);
        const equal7 = arrUtil.equal([[1, 2, 3], [4, 5, 6], [7, 8]], [[1, 2, 3], [4, 5, 6], [7, 8]]);
        const equal8 = arrUtil.equal([[1, 2, 3], [4, 5, 6], [7, 8]], [[1, 2, 3], [4, 5, 6], [7]]);

        assert.isFalse(equal1);
        assert.isTrue(equal2);
        assert.isTrue(equal3);
        assert.isFalse(equal4);
        assert.isTrue(equal5);
        assert.isFalse(equal6);
        assert.isTrue(equal7);
        assert.isFalse(equal8);
    });

    it('Test Array::clone', () => {
        const arr1 = [1, 2, 3, 4];
        const arr2 = arrUtil.clone(arr1);
        const arr3 = [1, 2, 3, 4, [5, 6, 7]];
        const arr4 = arrUtil.removeAt(arrUtil.clone(arr3), 4);
        const arr5 = [{ "test1": 1 }, { "test2": 2 }];
        const arr6 = arrUtil.removeAt(arrUtil.clone(arr5), 1);
        arr2.push(5);

        assert.lengthOf(arr1, 4);
        assert.lengthOf(arr2, 5);

        assert.lengthOf(arr3, 5);
        assert.lengthOf(arr4, 4);

        assert.lengthOf(arr5, 2);
        assert.lengthOf(arr6, 1);
    });

    it('Test Array::omit', () => {
        const omit1 = arrUtil.omit([1, 2, 3, 4], 2, 3);
        const omit2 = arrUtil.omit([1, 2, 3, 4], [2, 3]);

        assert.lengthOf(omit1, 2);
        assert.lengthOf(omit2, 2);
        assert.equal(omit1[0], 1);
        assert.equal(omit1[1], 4);
        assert.equal(omit2[0], 1);
        assert.equal(omit2[1], 4);
    });

    it('Test Array::replace', () => {
        const arr1 = arrUtil.replace([1, 2, 1, 4, 'vasds', '1'], 1, 9);
        assert.equal(arr1[0], 9);
        assert.equal(arr1[2], 9);
        assert.equal(arr1[5], '1');
    });

    it('Test Array::flatten', () => {
        const flatten1 = arrUtil.flatten([[1, 2, 3, 4, [5]]]);
        const flatten2 = arrUtil.flatten([[1,[2,[[3]]]],4,[5,[[[6]]]]]);

        assert.equal(flatten1.join(''), '12345');
        assert.equal(flatten2.join(''), '123456');
    });

    it('Test Array::compact', () => {
        const compact = arrUtil.compact([null, 'a', undefined, 0, false, 'b', 'c', '']);
        assert.equal(compact.join(''), 'abc');
    });

    it('Test Array::chunks', () => {
        const chunks1 = arrUtil.chunks([1, 2, 3, 4, 5, 6, 7, 8], 1);
        const chunks2 = arrUtil.chunks([1, 2, 3, 4, 5, 6, 7, 8], 2);
        const chunks3 = arrUtil.chunks([1, 2, 3, 4, 5, 6, 7, 8], 3);

        assert.isTrue(arrUtil.equal(chunks3, [[1, 2, 3], [4, 5, 6], [7, 8]]));
        assert.isTrue(arrUtil.equal(chunks2, [[1, 2], [3, 4], [5, 6], [7, 8]]));
        assert.isTrue(arrUtil.equal(chunks1, [[1], [2], [3], [4], [5], [6], [7], [8]]));
    });

    it('Test Array::truncate', () => {
        const truncate = arrUtil.truncate([null, 'a', undefined, 0, false, 'b', 'c', ''], 2);
        assert.lengthOf(truncate, 2);
    });

    it('Test Array::tail', () => {
        const trim = arrUtil.tail([1, 2, 3, 4, 5, 6, 7, 8, 'b', 'c', 'a', 'f', 'k'], 6);
        assert.deepEqual(trim, [ 8, 'b', 'c', 'a', 'f', 'k' ]);
    });

    it('Test Array::sortBy', () => {
        const toSort = [{"name": "cors"}, {"name": "helmet-hsts"}, {"name": "cookie-parser"}];
        const sortByList = arrUtil.sortBy(toSort, 'name', ["helmet-hsts", "cookie-parser", "cors"]);
        const sortNamesAsc = arrUtil.sortBy(toSort, 'name');
        const sortNamesDesc = arrUtil.sortBy(toSort, 'name', true);

        assert.equal(sortByList[0].name, 'helmet-hsts');
        assert.equal(sortByList[1].name, 'cookie-parser');
        assert.equal(sortByList[2].name, 'cors');

        assert.equal(sortNamesAsc[0].name, 'cookie-parser');
        assert.equal(sortNamesAsc[1].name, 'cors');
        assert.equal(sortNamesAsc[2].name, 'helmet-hsts');

        assert.equal(sortNamesDesc[0].name, 'helmet-hsts');
        assert.equal(sortNamesDesc[1].name, 'cors');
        assert.equal(sortNamesDesc[2].name, 'cookie-parser');
    });

    it('Test Array::findDuplicates', () => {
        const duplicates = arrUtil.findDuplicates([1, 2, 3, 4, 5, 1, 1, 'a', 2, 'b', 'a', 'b', 'b']);
        assert.equal(duplicates.toString(), '1,1,2,a,b,b');
    });
});


'use strict';

const chai = require('chai');
const assert = chai.assert;
const loadByAppPaths = require('../');

describe('# LoadByAppPaths', () => {
    it('should throw exception', () => {
        assert.throws(() => {
            loadByAppPaths('fileToFind', []);
        });

        assert.throws(() => {
            loadByAppPaths(undefined, []);
        });

        assert.throws(() => {
            loadByAppPaths('notFound', ['./lib/loader/tests/folder1']);
        });
    });

    it('should find file in test4', () => {
        const file = loadByAppPaths('fileToFind', [
            './lib/loader/tests/folder1/folder4',
            './lib/loader/tests/folder1'
        ]);

        assert.equal(file(), 4);
    });

    it('should find file in test1', () => {
        const file = loadByAppPaths('fileToFind', [
            './lib/loader/tests/folder3',
            './lib/loader/tests/folder1',
            './lib/loader/tests/folder1/folder4'
        ]);

        assert.equal(file(), 1);
    });

    it('should find static file', () => {
        const file1 = loadByAppPaths('style.css', ['./lib/loader/tests/folder1']);
    });
});

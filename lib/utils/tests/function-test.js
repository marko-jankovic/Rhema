'use strict';

const assert = require('@rhema/testing').assert;
const functionUtils = require('../lib/function');

describe('# Function Utils', () => {
    it('Test Function::getArgs', () => {
        assert.lengthOf(functionUtils.getArgs((arg1, arg2, arg3) => {}), 3);
        assert.includeMembers(functionUtils.getArgs((arg1, arg2, arg3) => {}), ['arg1', 'arg2', 'arg3']);

        assert.lengthOf(functionUtils.getArgs((arg1, arg2, arg3) => {}), 3);
        assert.includeMembers(functionUtils.getArgs((arg1, arg2, arg3) => {}), ['arg1', 'arg2', 'arg3']);

        assert.includeMembers(functionUtils.getArgs(class Polygon {
            constructor (height, width, $helpers, undefined) {}
        }), ['height', 'width', '$helpers']);


        assert.includeMembers(functionUtils.getArgs(function * (a ,b, c) {}), ['a', 'b', 'c']);
        assert.includeMembers(functionUtils.getArgs(function * named (a ,b, c) {}), ['a', 'b', 'c']);

        assert.includeMembers(functionUtils.getArgs((arg1, arg2, arg3) => {}), ['arg1', 'arg2', 'arg3']);
    });

    it('Test Function::getFunctionName', () => {
        assert.equal(functionUtils.getFnName(function test (arg1, arg2, arg3) {}), 'test');
    });

    it('Test Function::setFnName', () => {
        const fn = function test (arg1, arg2, arg3) {};
        functionUtils.setFnName(fn, 'test2');
        assert.equal(fn.name, 'test2');
    });

    it('Test Function::debounce', (done) => {
        let c = 0;
        const fn = functionUtils.debounce(() => c++, 100);

        for (let i = 0; i < 10; i++) {
            fn();
        }

        setTimeout(() => {
            try {
                assert.equal(c, 1);
            } catch (e) {
                return done(e);
            }

            done();
        }, 500);
    });

    it('Test Function::once', () => {
        let counter = 0;
        const fn = functionUtils.once((arg1, arg2, arg3) => counter++);

        for (let i = 0; i < 10; i++) {
            fn(1, 2, 3);
        }

        assert.equal(counter, 1);
    });

    it('Test Function::ensureAsync', (done) => {
        const asyncFn = (test) => {
            return new Promise((success, failure) => {
                if (test === 'ok') {
                    success('OK')
                }
                else {
                    failure(new Error('It is not OK!'));
                }
            })
        };

        (async () => {
            const ok = await functionUtils.ensureAsync(asyncFn('ok'));
            assert.equal(ok.res, 'OK');

            const notOk = await functionUtils.ensureAsync(asyncFn('notOk'));
            assert.equal(notOk.err.message, 'It is not OK!');

            done();
        })();
    });
});


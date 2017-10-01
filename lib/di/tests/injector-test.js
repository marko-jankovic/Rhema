'use strict';

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const DI = require('../../di/injector');

describe('# Dependency Injector', () => {
    let $di = null;
    beforeEach(() => {
        $di = new DI({
            formatters: {
                seo: {
                    title (name) {
                        return `${name.toUpperCase()}!!!`;
                    }
                }
            },
            helpers: {
                string: {
                    plural (string) {
                        return `${string}s`;
                    }
                }
            }
        });
    });

    it('Test {$formatters and $helpers} Injection inside Middlware or Pipeline  - should return formatted string', () => {
        const middlware = $di.inject({
            fn: function middleware (options, $formatters, $helpers) {
                return function getMiddleware (name) {
                    if (options.plural === 'yes') {
                        return $formatters.seo.title($helpers.string.plural(name));
                    } else {
                        return $formatters.seo.title(name);
                    }
                };
            },
            ctx: null,
            options: [{ plural: 'yes' }]
        });

        const result = middlware('middlware');
        result.should.equal('MIDDLWARES!!!');
    });

    it('Test Injection TypeError', () => {
        assert.throws(() => {
            $di.inject({ fn: null });
        });
    });

    it('Test DI:getFunctionArgs - should return function arguments', () => {
        const functionArgs = $di.getFunctionArgs(($formatters, $helpers) => '');

        // test default function arguments
        expect(() => $di.getFunctionArgs(($test1 = 'helpers.string.plural') => 'Sholud find plural helper')).to.not.throw(Error);
        expect(() => $di.getFunctionArgs(($test2 = 'helpers.string') => 'Sholud find string helper')).to.not.throw(Error);
        expect(() => $di.getFunctionArgs(($test3 = 'helpers') => 'Sholud find helpers')).to.not.throw(Error);

        const test4 = () => $di.getFunctionArgs(($test4 = 'helpers.string.p') => '');
        expect(test4).to.throw(Error);

        const test5 = () => $di.getFunctionArgs(($test5 = 'helpers.s') => '');
        expect(test5).to.throw(Error);

        const test6 = () => $di.getFunctionArgs(($test6 = 'h') => '');
        expect(test6).to.throw(Error);

        assert.lengthOf(functionArgs, 2, '{functionArgs} should have 2 elements');
        assert.property(functionArgs[0], 'seo');
        assert.typeOf(functionArgs[0].seo.title, 'function');
        assert.typeOf(functionArgs[1].string.plural, 'function');
    });
});

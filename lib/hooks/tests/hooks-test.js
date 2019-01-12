'use strict';

const assert = require('@rhema/testing').assert;
const Hooks = require('../index');

describe('# Hooks', () => {
    it('Test Hooks init', function (done) {
        this.timeout(4000);
        const hooks = new Hooks({
            preRender: {
                attachBeatle: {
                    path: './tests/preRender/attachBeatle.js',
                    options: {}
                }
            },
            postRender: {
                insertButton: {
                    path: './tests/postRender/insertButton.js',
                    order: 2,
                    options: {}
                },
                insertTemplate: {
                    path: './tests/postRender/insertTemplate.js',
                    order: 1,
                    options: {}
                }
            }
        });

        const preRender = hooks('preRender');
        const postRender = hooks('postRender');
        const fakeHtml = '<test><body><div></div></body></test>';

        preRender({}, {}, (preRenderErr, preRenderModel) => {
            try {
                assert.equal(preRenderModel.mare, 'Care');
            } catch (e) {
                return done(e);
            }

            postRender(preRenderModel, fakeHtml, (postRenderErr, postRenderModel, postRenderHtml) => {
                try {
                    // If this is true than button is inserted last which is what config states
                    assert.equal(postRenderHtml, '<button></button>');
                } catch (e) {
                    return done(e);
                }

                done();
            });
        });
    });
});

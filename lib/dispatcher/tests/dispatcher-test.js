'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const Dispatcher = require('../index');
const Express = require('express');

describe('# Dispatcher', () => {
    let dispatcher;
    let router;

    beforeEach(() => {
        router = new Express.Router({
            caseSensitive: false,
            mergeParams: false,
            strict: true
        });

        // create instance
        dispatcher = new Dispatcher({
            settings: {
                formats: ['json'],
                mountPaths: ['/', '/mobile']
            },
            routes: {
                search: {
                    method: 'GET',
                    path: '/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?',
                    rearrangeParams: ['SRPmake', 'SRPmodel', 'SRPtype'],
                    paramsCombination: {
                        dependencies: {
                            SRPmodel: 'SRPmake',
                            SRPlocation: 'SRPmodel'
                        }
                    },
                    params: {
                        SRPmake: 'make-(([A-Za-z0-9](_)?)+)',
                        SRPmodel: 'model-(([0-9A-Za-z](_)?)+)',
                        SRPlocation: 'location-(.*)',
                        SRPtype: 'type-(.*)'
                    }
                }
            }
        });
        router = dispatcher.setRoutes(router, {
            routes: { search: [1] },
            fn: { 1 () {} }
        }, false);
    });

    it('Test Router::pathFormater - should throw an error if {paramName} is not replaced with :paramName', () => {
        const path1 = dispatcher.pathFormater('/user/favorites/{data}');
        const path2 = dispatcher.pathFormater('/user/favorites/:data');
        const path3 = dispatcher.pathFormater('/user/favorites/:data', 'search');

        assert.equal(path1, '/user/favorites/:data');
        assert.equal(path2, '/user/favorites/:data');
        assert.equal(path3, '/user/favorites/:search_data', 'path param shoud have prefix "search_"');
    });

    it('Test Router::pathExtractor - should extract params from path', () => {
        const data = dispatcher.pathExtractor('/user/:favorites/test/:data');

        data.params.should.eql(['favorites', 'data']);
        data.prefix.should.eql(['', 'user', 'test']);
    });

    it('Test Router::permutationCombinationPaths {paramsCombination} - should create all combination of route paths', () => {
        const paths = dispatcher.permutationCombinationPaths({
            method: 'GET',
            path: '/cars/:SRPmake/:SRPmodel?/:SRPlocation',
            paramsCombination: {
                method: 'permutationCombination'
            }
        });

        expect(paths).to.include('/cars/:SRPmodel?/:SRPlocation');
        paths.should.have.length(15);
    });

    it('Test Router::permutationCombinationPaths {paramsCombination::dependencies} - should create combination of route paths by "dependencies"', () => {
        const paths = dispatcher.permutationCombinationPaths({
            method: 'GET',
            path: '/cars/:SRPmake?/:SRPmodel/:SRPlocation',
            paramsCombination: {
                method: 'permutationCombination',
                dependencies: {
                    SRPmodel: 'SRPmake?'
                }
            }
        });

        paths.should.have.length(12);
        paths.should.not.have.include('/cars/:SRPmodel/:SRPlocation');
    });

    it('Test Router::rearrangePaths {rearrangePaths} - should create rearrange paths', () => {
        const paths1 = dispatcher.rearrangePaths({
            path: '/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?',
            rearrangeParams: ['SRPmake?', 'SRPmodel?', 'SRPtype?']
        });

        const paths2 = dispatcher.rearrangePaths({
            path: '/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?',
            rearrangeParams: []
        });

        const paths3 = dispatcher.rearrangePaths({
            path: '/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?',
            rearrangeParams: false
        });

        const paths4 = dispatcher.rearrangePaths({
            path: '/cars/:SRPmake?/:SRPmodel?/:SRPlocation?/:SRPtype?',
            rearrangeParams: ['SRPmake?']
        });

        assert.lengthOf(paths2, 23, 'paths should have 23 elements');
        assert.lengthOf(paths3, 23, 'paths should have 23 elements');
        assert.lengthOf(paths4, 23, 'paths should have 23 elements');

        assert.include(paths1, '/cars/:SRPmake?/:SRPtype?/:SRPlocation?/:SRPmodel?');
        assert.include(paths1, '/cars/:SRPmodel?/:SRPmake?/:SRPlocation?/:SRPtype?');
        assert.include(paths1, '/cars/:SRPmodel?/:SRPtype?/:SRPlocation?/:SRPmake?');
        assert.include(paths1, '/cars/:SRPtype?/:SRPmake?/:SRPlocation?/:SRPmodel?');
        assert.include(paths1, '/cars/:SRPtype?/:SRPmodel?/:SRPlocation?/:SRPmake?');
        assert.lengthOf(paths1, 5, 'paths should have 5 element');
    });

    it('Test Router::prepareRouteOptions - should prepare route options', () => {
        const options1 = dispatcher.prepareRouteOptions({
            method: 'GET',
            path: '/cars/:SRPmake'
        }, 'GET', '/cars/:SRPmake');

        const options2 = dispatcher.prepareRouteOptions({
            method: 'TRAALALA',
            path: '/cars/:SRPmake'
        });

        const options3 = dispatcher.prepareRouteOptions({
            path: '/cars/:SRPmake'
        }, 'GET', '/cars/:SRPmake');

        const options4 = dispatcher.prepareRouteOptions({
            path: '/cars/:SRPmake'
        }, 'GET');

        const options5 = dispatcher.prepareRouteOptions({
            path: '/cars/:SRPmake'
        });

        const options6 = dispatcher.prepareRouteOptions({
            method: 'GET',
            path: '/cars/:SRPmake'
        }, 'TRAALALA', '/cars/:SRPmake?/:SRPmodel?');

        const arr = [options1, options2, options3, options4, options5];
        for (const i in arr) {
            assert.equal(arr[i].method, 'get', `options${i}.{method} should be "get"`);
            assert.equal(arr[i].path, '/cars/:SRPmake.:format(json)?', `options${i}.{path} should be "/cars/:SRPmake.:format(json)?"`);
        }

        assert.equal(options6.method, 'get', '{method} should be "get"');
        assert.equal(options6.path, '/cars/:SRPmake?/:SRPmodel?.:format(json)?', '{path} should be "/cars/:SRPmake?/:SRPmodel?.:format(json)?"');
    });

    it('Test Router::prepareRouterConfig - should prepare router config', () => {
        dispatcher.prepareRouterConfig({
            home: {
                method: 'GET',
                path: '/'
            },
            favoritesData: {
                method: 'POST',
                handler: 'Favorites:GetData',
                path: '/user/favorites/{data}',
                params: {}
            }
        }, (route, routeName) => {
            if (routeName === 'home') {
                assert.equal(route.action, false, '{action} should be "false"');
                assert.equal(route.method, 'GET', '{method} should be "GET"');
                assert.equal(route.handler, 'home', '{home} should be "home"');
                assert.equal(route.pageType, 'home', '{pageType} should be "home"');
                assert.equal(route.path, '/', '{path} should be "/"');
            }

            if (routeName === 'favoritesData') {
                assert.equal(route.action, 'getData', '{action} should be "getData"');
                assert.equal(route.method, 'POST', '{method} should be "POST"');
                assert.equal(route.handler, 'favorites', '{home} should be "favorites"');
                assert.equal(route.pageType, 'favoritesData', '{pageType} should be "favoritesData"');
                assert.equal(route.path, '/user/favorites/:favoritesData_data', '{path} should be "/user/favorites/:favoritesData_data"');
            }
        });
    });

    it('Test Express Router response object', () => {
        assert.isFalse(router.caseSensitive, '{mergeParams} should be false');
        assert.isFalse(router.mergeParams, '{mergeParams} should be false');
        assert.isTrue(router.strict, '{strict} should be true');

        assert.instanceOf(router._params, Array, '{_params} should be Array');
        assert.instanceOf(router.params, Object, '{params} should be Array');
        assert.instanceOf(router.stack, Array, '{stack} should be Array');
        assert.instanceOf(router.stack[0].handle, Function, '{handle} should be Function');
        assert.instanceOf(router.stack[1].handle, Function, '{handle} should be Function');

        assert.equal(router.stack[0].route.path, '/cars/:search_SRPmake?/:search_SRPmodel?/:search_SRPlocation?/:search_SRPtype?.:format(json)?', 'shoud have route with :format(json)?');
        assert.equal(router.stack[1].route.path, '/mobile/cars/:search_SRPmake?/:search_SRPmodel?/:search_SRPlocation?/:search_SRPtype?.:format(json)?', 'shoud have route with :format(json)?');

        assert.typeOf(router.stack[0].regexp, 'regexp', 'should have regular expression');
        assert.typeOf(router.stack[1].regexp, 'regexp', 'should have regular expression');

        assert.lengthOf(router.stack, 2, '{router.stack} should have 2 element');
        assert.lengthOf(router.stack[0].keys, 5, '{keys} should have 5 elements');
        assert.lengthOf(router.stack[1].keys, 5, '{keys} should have 5 elements');

        assert.property(router.params, 'search_SRPmake');
        assert.property(router.params, 'search_SRPmodel');
        assert.property(router.params, 'search_SRPlocation');
        assert.property(router.params, 'search_SRPtype');
    });
});

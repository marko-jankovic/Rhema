'use strict';

const assert = require('@rhema/testing').assert;

const Config = require('../index');

describe('# Config default setup', () => {
    let configSettings;
    let instance;
    let config;

    beforeEach(() => {
        // config component settings
        configSettings = {
            rootPath: './tests/test-configs',
            envDir: './environments',
            subdomainDir: './sites',
            extension: ['.json', '.js']
        };

        // create instance
        instance = new Config(configSettings);
        config = instance.build();
    });

    it('Test {rootPath} - should throw an error if rootPath is not valid', () => {
        try {
            config = new Config({ rootPath: './tests/test-configs' }).build();
        } catch (err) {
            assert.exists(err.message);
        }
    });

    it('Test {followDirNames} - should create object from dir name', () => {
        assert.exists(config.apps.main.app.followDirNames);
    });

    it('Test {followFileNames} - should create object from file name', () => {
        assert.isObject(config.apps.main.app.followDirNames.followFileNames);
    });

    it('Test {subdomainDir} - Should merge config files and create subdomains', () => {
        assert.isObject(config.apps.main);
        assert.isObject(config.apps.lee);
        assert.isObject(config.apps.adi);
        assert.isObject(config.apps.aol);
    });

    it('Test {subdomainDir} - should have overrides for subdomains', () => {
        assert.equal(config.apps.main.app.api.detail.url, 'http://test.com/listings/-/cars');
        assert.equal(config.apps.adi.app.api.detail.url, 'http://abcd.cars.data.com/listings/-/cars');
        assert.equal(config.apps.aol.app.api.detail.url, 'http://aloha.cars.data.com/listings/-/cars');
        assert.equal(config.apps.lee.app.api.detail.url, 'http://leeg.cars.data.com/listings/-/cars');
    });

    // run in beta env to verify this (NODE_ENV=beta npm test)
    it('Test {env} - should have overrides for BETA environment', () => {
        if (process.NODE_ENV === 'beta') {
            assert.equal(config.apps.main.logger.name, 'mare-care-beta');
        }
    });

    it('Test {extension} - should support javascript extension', () => {
        assert.equal(config.apps.main.extensions.jsFile.extension, 'js');
    });

    it('Test {toBoolean} - should covert string to boolean', () => {
        assert.isTrue(config.apps.main.app.toBoolean.thisIsTrue);
        assert.isFalse(config.apps.main.app.toBoolean.thisIsFalse);
    });

    it('Test {toBoolean} - should not covert number to boolean', () => {
        assert.equal(config.apps.main.app.toBoolean.thisIsNumber, 1);
    });

    it('Test {template} - should replace template string with value', () => {
        assert.equal(config.apps.main.app.api.detail.url, 'http://test.com/listings/-/cars');
    });
});

describe('# Config custom setup', () => {
    let configSettings;
    let instance;
    let config;

    beforeEach(() => {
        // config component settings
        configSettings = {
            rootPath: './tests/test-configs',
            envDir: './environments',
            followDirNames: true,
            followFileNames: false,
            toBoolean: false,
            template: false,
            ignore: ['other', 'ignore.json'],
            extension: ['.json']
        };

        // create instance
        instance = new Config(configSettings);
        config = instance.build();
    });

    it('Test {followFileNames} - should not create object from file name', () => {
        assert.isObject(config.apps.main.app.followDirNames);
        assert.isUndefined(config.apps.main.app.followDirNames.followFileNames);
    });

    it('Test {ignore} file - should not have "ignore" object', () => {
        assert.notExists(config.apps.main.app.ignore);
    });

    it('Test {ignore} folder - should not have "other" object', () => {
        assert.notExists(config.apps.main.other);
    });

    it('Test {extension} - should not support javascript extension', () => {
        assert.notExists(config.apps.main.extensions.jsFile);
    });

    it('Test {toBoolean} - should covert string to boolean', () => {
        assert.equal(config.apps.main.app.thisIsTrue, 'true');
        assert.equal(config.apps.main.app.thisIsFalse, 'disabled');
    });

    it('Test {template} - should not replace template string with value', () => {
        assert.equal(config.apps.main.app.detail.url, '{%  defaults.api.url %}');
    });

    it('Test Config:transformData - should trasform string to boolean', () => {
        const toBoolean = instance.transformData({ data: 'false' });
        assert.isFalse(toBoolean.data);
    });

    it('Test Config:applyMicroTemplate - should test config templates', () => {
        const conf = instance.applyMicroTemplate({
            apps: {
                main: {
                    timeTransform: "{% 30 seconds | toMs %}",
                    defaults: {
                        apiUrl: 'https://www.blahstory.com/cars'
                    },
                    app: {
                        plugins: {
                            url: '{% defaults.apiUrl %}'
                        }
                    }
                }
            }
        });

        assert.equal(conf.apps.main.app.plugins.url, 'https://www.blahstory.com/cars');
        assert.equal(conf.apps.main.timeTransform, 30000);
    });
});

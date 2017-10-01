'use strict';

const chai = require('chai');
const should = chai.should();
const assert = chai.assert;

const Config = require('../index');

describe('# Config default setup', () => {
    let configSettings;
    let instance;
    let config;

    beforeEach(() => {
        // config component settings
        configSettings = {
            rootPath: './lib/config/tests/test-configs',
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
            config = new Config({ rootPath: './lib/tests/test-configs' }).build();
        } catch (err) {
            err.message.should.exist;
        }
    });

    it('Test {followDirNames} - should create object from dir name', () => {
        config.apps.main.app.followDirNames.should.exist;
    });

    it('Test {followFileNames} - should create object from file name', () => {
        config.apps.main.app.followDirNames.followFileNames.should.be.an('object');
    });

    it('Test {subdomainDir} - Should merge config files and create subdomains', () => {
        config.apps.main.should.be.an('object');
        config.apps.lee.should.be.an('object');
        config.apps.adi.should.be.an('object');
        config.apps.aol.should.be.an('object');
    });

    it('Test {subdomainDir} - should have overrides for subdomains', () => {
        config.apps.main.app.api.detail.url.should.equal('http://test.com/listings/-/cars');
        config.apps.adi.app.api.detail.url.should.equal('http://abcd.cars.data.com/listings/-/cars');
        config.apps.aol.app.api.detail.url.should.equal('http://aloha.cars.data.com/listings/-/cars');
        config.apps.lee.app.api.detail.url.should.equal('http://leeg.cars.data.com/listings/-/cars');
    });

    // run in beta env to verify this (NODE_ENV=beta npm test)
    it('Test {env} - should have overrides for BETA environment', () => {
        if (process.NODE_ENV === 'beta') {
            config.apps.main.logger.name.should.equal('mare-care-beta');
        }
    });

    it('Test {extension} - should support javascript extension', () => {
        config.apps.main.extensions.jsFile.extension.should.equal('js');
    });

    it('Test {toBoolean} - should covert string to boolean', () => {
        config.apps.main.app.toBoolean.thisIsTrue.should.to.be.true;
        config.apps.main.app.toBoolean.thisIsFalse.should.to.be.false;
    });

    it('Test {toBoolean} - should not covert number to boolean', () => {
        config.apps.main.app.toBoolean.thisIsNumber.should.equal(1);
    });

    it('Test {template} - should replace template string with value', () => {
        config.apps.main.app.api.detail.url.should.equal('http://test.com/listings/-/cars');
    });
});

describe('# Config custom setup', () => {
    let configSettings;
    let instance;
    let config;

    beforeEach(() => {
        // config component settings
        configSettings = {
            rootPath: './lib/config/tests/test-configs',
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
        should.not.exist(config.apps.main.app.ignore);
    });

    it('Test {ignore} folder - should not have "other" object', () => {
        should.not.exist(config.apps.main.other);
    });

    it('Test {extension} - should not support javascript extension', () => {
        should.not.exist(config.apps.main.extensions.jsFile);
    });

    it('Test {toBoolean} - should covert string to boolean', () => {
        config.apps.main.app.thisIsTrue.should.to.not.be.true;
        config.apps.main.app.thisIsFalse.should.to.not.be.false;
    });

    it('Test {template} - should not replace template string with value', () => {
        config.apps.main.app.detail.url.should.equal('{%  defaults.api.url %}');
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

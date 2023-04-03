'use strict';

const Config = require('../index');

describe('# Config errors', () => {
    it('Should throw if {rootDir} path is not valid', () => {
        expect(() => {
            new Config({ rootDir: './tests/test-configs' }).build();
        }).toThrowError(/ENOENT: no such file or directory/);
    });

    it('Should throw if ENV config file is empty', () => {
        expect(() => {
            new Config({
                template: false,
                helpers: false,
                rootDir: './tests/invalid-configs/1',
                envDir: 'env'
            }).build();
            //
        }).toThrowError('Cannot parse testing.json config file!');
    });

    it('Should throw if {template} helper not exist', () => {
        expect(() => {
            new Config({ rootDir: './tests/invalid-configs/1/templateHelper.json' }).build();
        }).toThrowError(/Unknown template helper:/);
    });

    it('Should throw if {template} variable not exist', () => {
        expect(() => {
            new Config({ rootDir: './tests/invalid-configs/1/templateVariable.json' }).build();
        }).toThrowError(/Unknown template variable:/);
    });

    it('Should throw parse error if config is not valid', () => {

    });

    it('Should not throw if {silent} is TRUE', () => {

    });

    it('Should not throw if {envDir} folder is empty', () => {
        const config = new Config({
            rootDir: './tests/invalid-configs/2',
            envDir: 'emptyFolder',
            template: false,
            helpers: false
        }).build();

        expect(config.apps.main).toMatchObject({});
    });
});

describe('# Config default', () => {
    // config component settings
    const configSettings = {
        rootDir: './tests/valid-configs',
        envDir: 'environments',
        subdomainDir: './tests/valid-configs/sites',
        extension: ['.json', '.js']
    };

    // create instance
    const config = new Config(configSettings).build();

    it('Should create object from each dir name if {followDirNames} is TRUE', () => {

    });

    it('Should create object from each file name if {followFileNames} is TRUE', () => {

    });

    it('Should not create object from file name is {followFileNames} is FALSE', () => {

    });

    it('Should merge config files if {subdomainDir} is set', () => {
        //         expect(config.apps.main).toBe('object');
        //         expect(config.apps.lee).toBe('object');
        //         expect(config.apps.adi).toBe('object');
        //         expect(config.apps.aol).toBe('object');

    });

    it('Should have overrides is {subdomainDir} is set', () => {
        // expect(config.apps.main.app.api.detail.url).toEqual('http://test.com/listings/-/cars');
        // expect(config.apps.adi.app.api.detail.url).toEqual('http://abcd.cars.data.com/listings/-/cars');
        // expect(config.apps.aol.app.api.detail.url).toEqual('http://aloha.cars.data.com/listings/-/cars');
        // expect(config.apps.lee.app.api.detail.url).toEqual('http://leeg.cars.data.com/listings/-/cars');
    });

    it('Test {env} - should have overrides for BETA environment', () => {
        // if (process.NODE_ENV === 'beta') {
        //     expect.equal(config.apps.main.logger.name, 'mare-care-beta');
        // }
    });

    it('Should support {extension} from list', () => {
        //expect.equal(config.apps.main.extensions.jsFile.extension, 'js');
    });

    it('Should not support {extension} from list', () => {
        //expect.notExists(config.apps.main.extensions.jsFile);
    });

    it('Should replace {template} string "wtesth" value', () => {
        //expect.equal(config.apps.main.app.api.detail.url, 'http://test.com/listings/-/cars');
    });

    it('Should not have objects from {ignore} list', () => {

    });

    it('Test {ignore} folder - should not have "other" object', () => {
        //expect.notExists(config.apps.main.other);
    });

    it('Should replace current {parser} with a new one', () => {

    });

    it('Should load {defaults} object', () => {

    });

    //     it('Test {toBoolean} - should covert string to boolean', () => {
    //         expect.isTrue(config.apps.main.app.toBoolean.thisIsTrue);
    //         expect.isFalse(config.apps.main.app.toBoolean.thisIsFalse);
    //     });
    //
    //     it('Test {toBoolean} - should not covert number to boolean', () => {
    //         expect.equal(config.apps.main.app.toBoolean.thisIsNumber, 1);
    //     });
    //
    //     it('Test {toBoolean} - should covert string to boolean', () => {
    //         expect.equal(config.apps.main.app.thisIsTrue, 'true');
    //         expect.equal(config.apps.main.app.thisIsFalse, 'disabled');
    //     });
    //     it('Test {template} - should not replace template string wtesth value', () => {
    //         expect(config.apps.main.app.detail.url).toEqual('${  defaults.api.url }');
    //     });
    //
    //     it('Test Config:transformData - should trasform string to boolean', () => {
    //         const toBoolean = instance.transformData({ data: 'false' });
    //         expect(toBoolean.data).toBeFalsy();
    //     });

    it('Test Config:applyMicroTemplate - should replace config templates', () => {
        // const conf = instance.applyMicroTemplate({
        //     apps: {
        //         main: {
        //             timeTransform: "${ 30 seconds | toMs }",
        //             defaults: {
        //                 apiUrl: 'https://www.blahstory.com/cars'
        //             },
        //             app: {
        //                 plugins: {
        //                     url: '${ defaults.apiUrl }'
        //                 }
        //             }
        //         }
        //     }
        // });
        //
        // expect(conf.apps.main.app.plugins.url).toEqual('https://www.blahstory.com/cars');
        // expect(conf.apps.main.timeTransform).toEqual(30000);
    });
});

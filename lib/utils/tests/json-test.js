'use strict';

const chai = require('chai');
const assert = chai.assert;

const jsonUtils = require('../lib/json');

describe('# JSON Utils', () => {
    it('Test jsonUtils::safeParse', () => {
        const setValue = jsonUtils.safeParse('{"mare": "care"}');
        assert.property(setValue, 'mare');
        assert.equal(jsonUtils.safeParse('"mare": "care"}'), null);
    });

    it('Test jsonUtils::safeStringify', () => {
        const obj = {};
        obj.a = { b: obj };
        const myObj = { x: 'someValue here' };
        const safeStringify = jsonUtils.safeStringify(obj);
        const myObjSaveStringify = jsonUtils.safeStringify(myObj);
        assert.equal(safeStringify, '{}');
        assert.equal(myObjSaveStringify, '{"x":"someValue here"}');
    });

    it('Test jsonUtils::isCyclic', () => {
        const obj = {};
        obj.a = { b: obj };
        const myObj = {};
        myObj.x = { x: { y: myObj } };
        const isCyclicObj = jsonUtils.isCyclic(obj);
        const isCyclicObj2 = jsonUtils.isCyclic(myObj);
        assert.equal(isCyclicObj, true);
        assert.equal(isCyclicObj2, true);
    });

    it('Test jsonUtils::prettify', () => {
        assert.lengthOf(jsonUtils.prettify('{"hello": "world"}'), 24);
    });


    it('Test jsonUtils::loadToJson - should load xml, yaml and ini files to json', () => {
        const xmlToJson = jsonUtils.loadToJson('./lib/config/tests/test-configs/extensions/xmlFile.xml');
        const yamlToJson = jsonUtils.loadToJson('./lib/config/tests/test-configs/extensions/yamlFile.yaml');
        const iniToJson = jsonUtils.loadToJson('./lib/config/tests/test-configs/extensions/iniFile.ini');

        assert.property(iniToJson.common, 'session.name');
        assert.property(yamlToJson.admin_admin.defaults, '_controller');
        assert.property(xmlToJson.catalog, 'book');
    });
});

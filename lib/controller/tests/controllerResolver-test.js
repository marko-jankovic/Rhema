'use strict';

const chai = require('chai');
const assert = chai.assert;
const ControllerResolver = require('../controllerResolver');
const DI = require('../../di/injector');

describe('# ControllerResolver', () => {
    it('should find carsController', () => {
        const controllerResolver = new ControllerResolver({
            app: {
                controllers: {
                    paths: ['./lib/controller/tests/controllers'],
                    suffix: 'Controller'
                },
                middlewares: {
                    beforeRender: {},
                    afterRender: {}
                }
            }
        }, new DI({}));

        const Controller = controllerResolver.get('cars');
        const controller = new Controller;
        const action = controller.use('get');

        assert.isFunction(action, 'it should be function getAction');
        assert.property(controller, 'use', 'it should has use method');
    });
});

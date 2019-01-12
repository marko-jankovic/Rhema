'use strict';

const assert = require('@rhema/testing').assert;
const ControllerResolver = require('../controllerResolver');
const DI = require('@rhema/di');

describe('# ControllerResolver', () => {
    it('should find carsController', () => {
        const controllerResolver = new ControllerResolver({
            app: {
                controllers: {
                    paths: ['./tests/controllers'],
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
        const action1 = controller.use('get');
        const action2 = controller.use('customRandom');

        assert.isFunction(action1, 'it should be function getAction');
        assert.isFunction(action2, 'it should be function customRandomAction');
        assert.property(controller, 'use', 'it should has use method');
    });
});

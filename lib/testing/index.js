'use strict';

const chai = require('chai');
const sinon = require('sinon');

beforeEach(() => {
    global.logger = {
        info: sinon.spy(),
        error: sinon.spy(),
        debug: sinon.spy(),
        warn: sinon.spy()
    };

    global.timer = {
        start: sinon.spy(),
        end: sinon.spy(),
        clearAll: sinon.spy()
    };

    global.metrics = {
        increment: sinon.spy(),
        gauge: sinon.spy(),
        timing: sinon.spy()
    };
});

module.exports = {
  assert: chai.assert,
  expect: chai.expect,
  spy: sinon.spy,
  mock: sinon.mock
};

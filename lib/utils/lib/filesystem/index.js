'use strict';

const path = require('./path');
const fs = require('./fs');
const prune = require('./prune');
const safeRequire = require('./safeRequire');

module.exports = Object.assign(
    fs,
    path,
    prune,
    safeRequire
);

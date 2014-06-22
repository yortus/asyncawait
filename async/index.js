﻿var asyncBuilder = require('../src/asyncBuilder');
var promiseProtocol = require('../src/protocols/promise');
var config = require('../src/asyncConfig');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');
var express = require('./express');
var stream = require('./stream');
var iterable = require('./iterable/index');

var api = asyncBuilder.mod(promiseProtocol);
api.config = config;
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map
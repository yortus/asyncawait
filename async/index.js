var asyncBuilder = require('../src/asyncBuilder');

var promiseProtocol = require('../src/protocols/promise');
var config = require('../src/config');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');
var express = require('./express');
var stream = require('./stream');


var async = asyncBuilder.mod(promiseProtocol);
async.config = config;
async.promise = promise;
async.cps = cps;
async.thunk = thunk;
async.express = express;
async.stream = stream;
module.exports = async;
//# sourceMappingURL=index.js.map

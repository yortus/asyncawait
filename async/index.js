var extensibility = require('../src/extensibility');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');
var express = require('./express');
var stream = require('./stream');
var iterable = require('./iterable/index');

var api = promise;
api.config = extensibility.config;

// TODO: temp... api.promise = promise.mod({});
api.cps = cps;
api.thunk = thunk;
api.express = express;
api.stream = stream;
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map

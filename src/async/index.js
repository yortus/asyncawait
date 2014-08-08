var asyncBuilder = require('../asyncBuilder');
var promiseMod = require('../mods/async/promise');

//import cps = require('./cps');
//import thunk = require('./thunk');
//import express = require('./express');
var stream = require('./stream');
var iterable = require('./iterable/index');

var api = asyncBuilder.mod(promiseMod);

//api.cps = cps;
//api.thunk = thunk;
//api.express = express;
api.stream = stream;
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map

var asyncBuilder = require('../asyncBuilder');
var promiseMod = require('../mods/async/promise');
var iterable = require('./iterable/index');

var api = asyncBuilder.mod(promiseMod);
api.iterable = iterable;
module.exports = api;
//# sourceMappingURL=index.js.map

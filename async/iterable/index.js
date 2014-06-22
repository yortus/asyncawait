var asyncBuilder = require('../../src/asyncBuilder');
var iterablePromiseProtocol = require('../../src/protocols/iterablePromise');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

var iterableAPI = asyncBuilder.mod(iterablePromiseProtocol);
iterableAPI.promise = promise;
iterableAPI.cps = cps;
iterableAPI.thunk = thunk;
module.exports = iterableAPI;
//# sourceMappingURL=index.js.map

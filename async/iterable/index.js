var asyncBuilder = require('../../src/asyncBuilder');
var iterablePromiseProtocol = require('../../src/protocols/iterablePromise');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

var asyncIterable = asyncBuilder.mod(iterablePromiseProtocol);
asyncIterable.promise = promise;
asyncIterable.cps = cps;
asyncIterable.thunk = thunk;
module.exports = asyncIterable;
//# sourceMappingURL=index.js.map

var asyncBase = require('../impl/asyncBase');
var IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
var Promise = require('./promise');
var CPS = require('./cps');
var Thunk = require('./thunk');

var asyncIterable = asyncBase.mod({ constructor: IterablePromiseProtocol });
asyncIterable.promise = Promise;
asyncIterable.cps = CPS;
asyncIterable.thunk = Thunk;
module.exports = asyncIterable;
//# sourceMappingURL=index.js.map

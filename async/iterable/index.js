var makeAsyncFunc = require('../impl/makeAsyncFunc');
var IterablePromiseProtocol = require('../impl/protocols/iterablePromise');
var Promise = require('./promise');
var CPS = require('./cps');
var Thunk = require('./thunk');

var asyncIterable = makeAsyncFunc(IterablePromiseProtocol);
asyncIterable.promise = Promise;
asyncIterable.cps = CPS;
asyncIterable.thunk = Thunk;
module.exports = asyncIterable;
//# sourceMappingURL=index.js.map

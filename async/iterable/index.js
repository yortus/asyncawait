var makeAsyncFunc = require('../impl/makeAsyncFunc');
var Promise = require('./promise');
var CPS = require('./cps');
var Thunk = require('./thunk');

var asyncIterable = makeAsyncFunc(Promise);
asyncIterable.promise = makeAsyncFunc(Promise);
asyncIterable.cps = makeAsyncFunc(CPS);
asyncIterable.thunk = makeAsyncFunc(Thunk);
module.exports = asyncIterable;
//# sourceMappingURL=index.js.map

var makeAsyncFunc = require('../impl/makeAsyncFunc');
var IterablePromiseProtocol = require('../impl/protocols/iterablePromise');

var async = makeAsyncFunc(IterablePromiseProtocol);
module.exports = async;
//# sourceMappingURL=promise.js.map

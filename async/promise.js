var makeAsyncFunc = require('./impl/makeAsyncFunc');
var PromiseProtocol = require('./impl/protocols/promise');

var async = makeAsyncFunc(PromiseProtocol);
module.exports = async;
//# sourceMappingURL=promise.js.map

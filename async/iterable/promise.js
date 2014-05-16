var asyncBase = require('../impl/asyncBase');
var IterablePromiseProtocol = require('../impl/protocols/iterablePromise');

var async = asyncBase.mod({ protocol: IterablePromiseProtocol });
module.exports = async;
//# sourceMappingURL=promise.js.map

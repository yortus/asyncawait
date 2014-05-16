var asyncBase = require('./impl/asyncBase');
var PromiseProtocol = require('./impl/protocols/promise');

var async = asyncBase.mod({ constructor: PromiseProtocol });
module.exports = async;
//# sourceMappingURL=promise.js.map

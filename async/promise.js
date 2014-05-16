var asyncBase = require('./impl/asyncBase');
var PromiseProtocol = require('./impl/protocols/promise');

var async = asyncBase.mod({ protocol: PromiseProtocol });
module.exports = async;
//# sourceMappingURL=promise.js.map

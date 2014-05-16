var asyncBase = require('./impl/asyncBase');
var ExpressProtocol = require('./impl/protocols/express');

var async = asyncBase.mod({ protocol: ExpressProtocol });
module.exports = async;
//# sourceMappingURL=express.js.map

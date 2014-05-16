var asyncBase = require('./impl/asyncBase');
var CPSProtocol = require('./impl/protocols/cps');

var async = asyncBase.mod({ protocol: CPSProtocol });
module.exports = async;
//# sourceMappingURL=cps.js.map

var asyncBase = require('../impl/asyncBase');
var IterableCPSProtocol = require('../impl/protocols/iterableCps');

var async = asyncBase.mod({ protocol: IterableCPSProtocol });
module.exports = async;
//# sourceMappingURL=cps.js.map

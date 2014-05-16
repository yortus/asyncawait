var asyncBase = require('./impl/asyncBase');
var ThunkProtocol = require('./impl/protocols/thunk');

var async = asyncBase.mod({ protocol: ThunkProtocol });
module.exports = async;
//# sourceMappingURL=thunk.js.map

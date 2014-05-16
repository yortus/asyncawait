var asyncBase = require('./impl/asyncBase');
var ThunkProtocol = require('./impl/protocols/thunk');

var async = asyncBase.mod({ constructor: ThunkProtocol });
module.exports = async;
//# sourceMappingURL=thunk.js.map

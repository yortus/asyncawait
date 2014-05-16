var asyncBase = require('../impl/asyncBase');
var IterableThunkProtocol = require('../impl/protocols/iterableThunk');

var async = asyncBase.mod({ protocol: IterableThunkProtocol });
module.exports = async;
//# sourceMappingURL=thunk.js.map

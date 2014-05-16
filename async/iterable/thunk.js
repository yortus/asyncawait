var asyncBase = require('../impl/asyncBase');
var IterableThunkProtocol = require('../impl/protocols/iterableThunk');

var async = asyncBase.mod({ constructor: IterableThunkProtocol });
module.exports = async;
//# sourceMappingURL=thunk.js.map

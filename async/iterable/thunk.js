var makeAsyncFunc = require('../impl/makeAsyncFunc');
var IterableThunkProtocol = require('../impl/protocols/iterableThunk');

var async = makeAsyncFunc(IterableThunkProtocol);
module.exports = async;
//# sourceMappingURL=thunk.js.map

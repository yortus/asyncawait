var makeAsyncFunc = require('./impl/makeAsyncFunc');
var ThunkProtocol = require('./impl/protocols/thunk');

var async = makeAsyncFunc(ThunkProtocol);
module.exports = async;
//# sourceMappingURL=thunk.js.map

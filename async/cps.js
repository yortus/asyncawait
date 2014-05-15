var makeAsyncFunc = require('./impl/makeAsyncFunc');
var CPSProtocol = require('./impl/protocols/cps');

var async = makeAsyncFunc(CPSProtocol);
module.exports = async;
//# sourceMappingURL=cps.js.map

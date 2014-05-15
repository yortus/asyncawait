var makeAsyncFunc = require('../impl/makeAsyncFunc');
var IterableCPSProtocol = require('../impl/protocols/iterableCps');

var async = makeAsyncFunc(IterableCPSProtocol);
module.exports = async;
//# sourceMappingURL=cps.js.map

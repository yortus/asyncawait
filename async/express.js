var makeAsyncFunc = require('./impl/makeAsyncFunc');
var ExpressProtocol = require('./impl/protocols/express');

var async = makeAsyncFunc(ExpressProtocol);
module.exports = async;
//# sourceMappingURL=express.js.map

var makeAsyncFunc = require('./impl/makeAsyncFunc');
var StreamProtocol = require('./impl/protocols/stream');

var async = makeAsyncFunc(StreamProtocol);
module.exports = async;
//# sourceMappingURL=stream.js.map

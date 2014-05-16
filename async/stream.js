var asyncBase = require('./impl/asyncBase');
var StreamProtocol = require('./impl/protocols/stream');

var async = asyncBase.mod({ constructor: StreamProtocol });
module.exports = async;
//# sourceMappingURL=stream.js.map

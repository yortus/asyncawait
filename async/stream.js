var oldBuilder = require('../src/asyncBuilder');
var protocol = require('../src/protocols/stream');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=stream.js.map

var oldBuilder = require('../src/asyncBuilder');
var protocol = require('../src/protocols/promise');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map

var oldBuilder = require('../src/asyncBuilder');
var protocol = require('../src/protocols/thunk');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map

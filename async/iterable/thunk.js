var oldBuilder = require('../../src/asyncBuilder');
var protocol = require('../../src/protocols/iterableThunk');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map

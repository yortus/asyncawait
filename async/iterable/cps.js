var oldBuilder = require('../../src/asyncBuilder');
var protocol = require('../../src/protocols/iterableCps');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map

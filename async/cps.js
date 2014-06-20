var oldBuilder = require('../src/asyncBuilder');
var protocol = require('../src/protocols/cps');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map

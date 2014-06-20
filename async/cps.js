var oldBuilder = require('../src/asyncBuilder');
var cpsProtocol = require('../src/protocols/cps');

var newBuilder = oldBuilder.mod(cpsProtocol);
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map

var oldBuilder = require('../src/asyncBuilder');
var protocol = require('../src/protocols/express');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=express.js.map

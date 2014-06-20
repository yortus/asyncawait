var oldBuilder = require('../src/asyncBuilder');
var promiseProtocol = require('../src/protocols/promise');

var newBuilder = oldBuilder.mod(promiseProtocol);
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map

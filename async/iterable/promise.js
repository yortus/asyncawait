var oldBuilder = require('../../src/asyncBuilder');
var protocol = require('../../src/protocols/iterablePromise');

var newBuilder = oldBuilder.mod(protocol);
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map

var oldBuilder = require('../src/asyncBuilder');
var thunkProtocol = require('../src/protocols/thunk');

var newBuilder = oldBuilder.mod(thunkProtocol);
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map

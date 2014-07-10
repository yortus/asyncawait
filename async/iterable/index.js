var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

var iterableAPI = promise;
iterableAPI.promise = promise.derive({});
iterableAPI.cps = cps;
iterableAPI.thunk = thunk;
module.exports = iterableAPI;
//# sourceMappingURL=index.js.map

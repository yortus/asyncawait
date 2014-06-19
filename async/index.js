var createAsyncBuilder = require('../src/createAsyncBuilder');

var promiseProtocol = require('../src/protocols/promise');
var promise = require('./promise');
var cps = require('./cps');


var async = createAsyncBuilder(promiseProtocol);
async.promise = promise;
async.cps = cps;
module.exports = async;
//# sourceMappingURL=index.js.map

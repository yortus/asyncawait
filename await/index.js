//TODO: temp... require('../src/extensibility').config({ handlers: [ promise.handler, cps.handler, thunk.handler, general, value ]});
var general = require('./general');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

//TODO: temp testing...
var compound = require('./compound');
var value = function valueHandler(co, arg, allArgs) {
    setImmediate(function () {
        co.enter(null, arg);
    });
};

//TODO: temp testing...
var opts = { handlers: [promise.handler, cps.handler, thunk.handler, general, value] };
var api = compound.mod({ defaultOptions: opts });
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map

var extensibility = require('../src/extensibility');
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

var api = compound.derive({ handlers: [promise.handler, cps.handler, thunk.handler, general, value] });
api.use = extensibility.use;
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map

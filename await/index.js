var general = require('./general');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

//TODO: temp testing...
var compound = require('./compound');
var noop = function (co, args) {
    setImmediate(function () {
        co.enter(null, args[0]);
    });
};

var api = compound.derive({ handlers: [promise.handler, cps.handler, thunk.handler, general, noop] });
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map

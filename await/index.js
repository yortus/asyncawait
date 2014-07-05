var general = require('./general');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

//TOSO: temp testing...
var compound = require('./compound');
var noop = function (co, args) {
    return co.enter(null, args[0]);
};

var api = compound.mod({ handlers: [promise.handler, cps.handler, thunk.handler, general, noop] });
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map

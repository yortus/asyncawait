var general = require('./general');
var promise = require('./promise');
var cps = require('./cps');
var thunk = require('./thunk');

//TOSO: temp testing...
var compound = require('./compound');
var noop = function (expr, resume) {
    return resume(null, expr);
};

var api = compound.mod({ handlers: [promise.handler, thunk.handler, general, noop] });
api.promise = promise;
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map

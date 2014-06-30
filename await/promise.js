var builder = require('../src/awaitBuilder');

var promiseHandler = function (expr, resume) {
    if (typeof expr.then !== 'function')
        return false;
    var p = expr;
    p.then(function (result) {
        return resume(null, result);
    }, function (error) {
        return resume(error);
    });
};

var api = builder.createAwaitBuilder(promiseHandler);
module.exports = api;
//# sourceMappingURL=promise.js.map

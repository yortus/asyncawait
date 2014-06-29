var makeAwaitFunc = require('../src/awaitBuilder');

var api = makeAwaitFunc();

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

var thunkHandler = function (expr, resume) {
    if (typeof expr !== 'function')
        return false;
    expr(resume);
};

var primitiveHandler = function (expr, resume) {
    //TODO:...
    if (typeof expr !== 'function')
        return false;
    expr(null, expr);
};

var objectHandler = function (expr, resume) {
    //TODO:...
};
module.exports = api;
//# sourceMappingURL=index.js.map

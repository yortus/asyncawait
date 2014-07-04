var builder = require('../src/awaitBuilder');
var general = require('./general');
var promise = require('./promise');
var cps = require('./cps');

var api = builder.mod(function () {
    return general;
});
api.promise = promise;
api.cps = cps;
module.exports = api;
//var api: AsyncAwait.Await = <any> makeAwaitFunc();
//interface AwaitHandler {
//    (expr: any, resume: (error?, result?) => void): any;
//}
//var promiseHandler: AwaitHandler = (expr, resume) => {
//    if (typeof expr.then !== 'function') return false;
//    var p = <Promise<any>> expr;
//    p.then(result => resume(null, result), error => resume(error));
//};
//var thunkHandler: AwaitHandler = (expr, resume) => {
//    if (typeof expr !== 'function') return false;
//    expr(resume);
//};
//var primitiveHandler: AwaitHandler = (expr, resume) => {
//    //TODO:...
//    if (typeof expr !== 'function') return false;
//    expr(null, expr);
//};
//var objectHandler: AwaitHandler = (expr, resume) => {
//    //TODO:...
//};
//# sourceMappingURL=index.js.map

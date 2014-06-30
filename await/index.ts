import references = require('references');
import builder = require('../src/awaitBuilder');
export = api;


var api = builder.createAwaitBuilder(builder.generalHandler);



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

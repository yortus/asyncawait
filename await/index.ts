import references = require('references');
import builder = require('../src/awaitBuilder');
import general = require('./general');
import promise = require('./promise');
import cps = require('./cps');
export = api;


var api: AsyncAwait.Await.API = <any> builder.mod<AsyncAwait.Await.Builder>({ handler: () => general });
api.promise = promise;
api.cps = <any> cps;



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

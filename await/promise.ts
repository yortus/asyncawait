import references = require('references');
import builder = require('../src/awaitBuilder');
export = api;


var promiseHandler = (expr, resume) => {
    if (typeof expr.then !== 'function') return false;
    var p = <Promise<any>> expr;
    p.then(result => resume(null, result), error => resume(error));
};


var api = builder.createAwaitBuilder(promiseHandler);

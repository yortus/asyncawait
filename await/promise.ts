import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Await.PromiseBuilder>(
    () => (expr, resume) => {
        if (typeof expr.then !== 'function') return false;
        var p = <Promise<any>> expr;
        p.nodeify(resume);
    }
);

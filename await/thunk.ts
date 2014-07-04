import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Await.ThunkBuilder>(
    () => (expr, resume) => {
        if (typeof expr !== 'function') return false;
        expr(resume);
    }
);

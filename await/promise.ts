import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.PromiseBuilder>(
    () => function promiseHandler(co, arg, allArgs) {
        if (allArgs || !_.isPromise(arg)) return pipeline.notHandled;
        arg.then(val => co.enter(null, val), co.enter);
    }
);

import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.PromiseBuilder>(
    () => function promiseHandler(co, args) {
        if (args.length !== 1 || !_.isPromise(args[0])) return pipeline.notHandled;
        args[0].then(val => co.enter(null, val), co.enter);
    }
);

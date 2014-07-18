import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.ThunkBuilder>(
    () => function thunkHandler(co, args) {
        if (args.length !== 1 || !_.isFunction(args[0])) return pipeline.notHandled;
        args[0](co.enter);
    }
);

import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.ThunkBuilder>(
    () => function thunkHandler(co, arg, allArgs) {
        if (allArgs || !_.isFunction(arg)) return pipeline.notHandled;
        arg(co.enter);
    }
);

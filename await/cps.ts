import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.CPSBuilder>(
    () => function cpsHandler(co, arg, allArgs) {
        if (allArgs || arg !== void 0) return pipeline.notHandled;
    }
);

builder.continuation = function continuation() {
    var co = pipeline.currentCoro();
    return function continue_(err, result) {
        co.enter(err, result);
        co = null;
    };
};

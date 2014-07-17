import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.CPSBuilder>(
    () => (co, args) => {
        if (args.length !== 1 || args[0] !== void 0) return pipeline.notHandled;
    }
);

builder.continuation = () => {
    var co = pipeline.currentCoro();
    return (err, result) => {
        co.enter(err, result);
        co = null;
    };
};

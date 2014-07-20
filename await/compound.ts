import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
import Promise = require('bluebird');
export = builder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.Handler[];
}


var builder = oldBuilder.derive<AsyncAwait.Await.Builder>(
    (baseHandler, options: any) => function compoundHandler(co, arg, allArgs) {
        //TODO: temp testing... handle allArgs too...
        if (allArgs) return pipeline.notHandled;
        var handlers = options.handlers || [], len = handlers.length, result = pipeline.notHandled;
        for (var i = 0; result === pipeline.notHandled && i < len; ++i) result = handlers[i](co, arg);
        return result;
    }
);

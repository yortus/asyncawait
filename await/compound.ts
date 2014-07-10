import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.Handler[];
}


var builder = oldBuilder.derive<AsyncAwait.Await.Builder>(
    (options: any) => (co, args) => {
        var handlers = options.handlers || [], len = handlers.length, result = false;
        for (var i = 0; result === false && i < len; ++i) result = handlers[i](co, args);
        return result;
    }
);

import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


interface CompoundOptions {
    handlers?: AsyncAwait.Await.Handler[];
}


var builder = oldBuilder.mod<AsyncAwait.Await.Builder>(
    (options: any) => (args, resume) => {
        var handlers = options.handlers || [], len = handlers.length, result = false;
        for (var i = 0; result === false && i < len; ++i) result = handlers[i](args, resume);
        return result;
    }
);

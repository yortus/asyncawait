import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.PromiseBuilder>(() => ({
    clear: (co) => { co.resolver = null; },
    invoke: (co) => {
        co.resolver = Promise.defer<any>();
        co.enter();
        return co.resolver.promise;
    },
    return: (ctx, result) => ctx.resolver.resolve(result),
    throw: (ctx, error) => ctx.resolver.reject(error),
    yield: (ctx, value) => { ctx.resolver.progress(value); return true; }
}));

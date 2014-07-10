import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.PromiseBuilder>(() => ({
    invoke: (co) => {
        co.resolver = Promise.defer<any>();
        co.enter();
        return co.resolver.promise;
    },
    return: (co, result) => co.resolver.resolve(result),
    throw: (co, error) => co.resolver.reject(error),
    yield: (co, value) => co.resolver.progress(value),
    finally: (co) => { co.resolver = null; }
}));

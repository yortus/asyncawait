import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import pipeline = require('../src/pipeline');
import Promise = require('bluebird');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'promise',

    type: <AsyncAwait.Async.PromiseBuilder> null,

    overrideProtocol: (base, options) => ({
        invoke: (co) => {
            var resolver = co.context = Promise.defer<any>();
            co.enter();
            return resolver.promise;
        },
        return: (resolver, result) => resolver.resolve(result),
        throw: (resolver, error) => resolver.reject(error),
        yield: (resolver, value) => { resolver.progress(value); return pipeline.continueAfterYield; }
    })
});

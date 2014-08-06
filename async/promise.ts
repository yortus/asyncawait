import references = require('references');
import Promise = require('bluebird');
import oldBuilder = require('../src/asyncBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: Promise.Resolver<any>;
}


var newBuilder = oldBuilder.mod({

    name: 'promise',

    type: <AsyncAwait.Async.PromiseBuilder> null,

    overrideProtocol: (base, options) => ({

        begin: (fi: FiberEx) => {
            var resolver = fi.context = Promise.defer<any>();
            fi.resume();
            return resolver.promise;
        },

        suspend: (fi: FiberEx, error?, value?) => {
            if (error) throw error; // NB: not handled - throw in fiber
            fi.context.progress(value); // NB: Fiber does NOT yield here
        },

        end: (fi: FiberEx, error?, value?) => {
            if (error) fi.context.reject(error); else fi.context.resolve(value);
        }
    })
});

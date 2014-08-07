import references = require('references');
import Promise = require('bluebird');
import oldBuilder = require('../asyncBuilder');
import Mod = AsyncAwait.Mod;
export = promises;


/** TODO */
var promises: Mod = {

    name: 'promises',

    overrideProtocol: (base, options) => ({}),

    apply: (options) => {
        var api = require('../../async');
        api.promise = createBuilder();
    },

    reset: () => {
        var api = require('../../async');
        delete api.promise;
    },

    defaultOptions: {
    }
};


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: Promise.Resolver<any>;
}


/** Provides an async builder for producing suspendable functions that return promises. */
var createBuilder = () => oldBuilder.mod({

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
            fi.context.progress(value); // NB: fiber does NOT yield here
        },

        end: (fi: FiberEx, error?, value?) => {
            if (error) fi.context.reject(error); else fi.context.resolve(value);
        }
    })
});

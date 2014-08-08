import references = require('references');
import Promise = require('bluebird');
import oldBuilder = require('../asyncBuilder');
import Mod = AsyncAwait.Mod;
export = promises;


/** TODO */
var promises: Mod = {

    name: 'promises',

    overrideProtocol: (base, options) => ({
    
        startup: () => {
            base.startup();
            var api = require('../../async');
            api.promise = createAsyncBuilder();
        },

        shutdown: () => {
            var api = require('../../async');
            delete api.promise;
            base.shutdown();
        }
    }),

    defaultOptions: {
    }
};


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: Promise.Resolver<any>;
}


/** Provides an async builder for producing suspendable functions that return promises. */
var createAsyncBuilder = () => oldBuilder.mod({

    /** Used for diagnostic purposes. */
    name: 'promise',

    /** Used only for automatic type interence at TypeScript compile time. */
    type: <AsyncAwait.Async.PromiseBuilder> null,

    /** Provides appropriate handling for promise-returning suspendable functions. */
    overrideProtocol: (base, options) => ({

        /** Sets up a promise resolver and synchronously returns a promise. */
        begin: (fi: FiberEx) => {
            var resolver = fi.context = Promise.defer<any>();
            fi.resume();
            return resolver.promise;
        },

        /** Calls the promise's progress() handler whenever the function yields, then continues execution. */
        suspend: (fi: FiberEx, error?, value?) => {
            if (error) throw error; // NB: not handled - throw in fiber
            fi.context.progress(value); // NB: fiber does NOT yield here, it continues
        },

        /** Resolves or rejects the promise, depending on whether the function returned or threw. */
        end: (fi: FiberEx, error?, value?) => {
            if (error) fi.context.reject(error); else fi.context.resolve(value);
        }
    })
});

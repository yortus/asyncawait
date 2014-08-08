import references = require('references');
import Promise = require('bluebird');
import asyncBuilder = require('../asyncBuilder');
import awaitBuilder = require('../awaitBuilder');
import _ = require('../util');
import Mod = AsyncAwait.Mod;


/** TODO */
export var mod: Mod = {

    name: 'promises',

    overrideProtocol: (base, options) => ({
    
        startup: () => {
            base.startup();
            require('../async').promise = createAsyncBuilder();
            require('../await').promise = createAwaitBuilder();
        },

        shutdown: () => {
            delete require('../async').promise;
            delete require('../await').promise;
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
export var createAsyncBuilder = () => asyncBuilder.mod({

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


//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
export var createAwaitBuilder = () => awaitBuilder.mod({

    name: 'promise',

    type: <AsyncAwait.Await.PromiseBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (fi, arg) => {
            if (!_.isPromise(arg)) return _.notHandled;
            arg.then(val => fi.resume(null, val), fi.resume);
        },
        variadic: (fi, args) => {
            if (!_.isPromise(args[0])) return _.notHandled;
            args[0].then(val => fi.resume(null, val), fi.resume);
        },

        elements: (values: any[], result: (err: Error, value: any, index: number) => void) => {

            // TODO: temp testing...
            var k = 0;
            values.forEach((value, i) => {
                if (_.isPromise(value)) {
                    value.then(val => result(null, val, i), err => result(err, null, i));
                    ++k;
                }
            });
            return k;
        }
    })
});

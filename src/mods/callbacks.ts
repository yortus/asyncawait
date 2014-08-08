import references = require('references');
import assert = require('assert');
import asyncBuilder = require('../asyncBuilder');
import awaitBuilder = require('../awaitBuilder');
import _ = require('../util');
import Mod = AsyncAwait.Mod;


/** TODO */
export var mod: Mod = {

    name: 'callbacks',

    overrideProtocol: (base, options) => ({
    
        startup: () => {
            base.startup();
            require('../async').cps = createAsyncBuilder();
            require('../await').cps = createAwaitBuilder();
        },

        shutdown: () => {
            delete require('../async').cps;
            delete require('../await').cps;
            base.shutdown();
        }
    }),

    defaultOptions: {
    }
};


/** Fiber interface extended with type information for 'context'. */
interface FiberEx extends Fiber {
    context: (error?, value?) => void;
}


/** Provides an async builder for producing suspendable functions accept node-style callbacks. */
export var createAsyncBuilder = () => asyncBuilder.mod({

    /** Used for diagnostic purposes. */
    name: 'cps',

    /** Used only for automatic type interence at TypeScript compile time. */
    type: <AsyncAwait.Async.CPSBuilder> null,

    /** Provides appropriate handling for callback-accepting suspendable functions. */
    overrideProtocol: (base, options) => ({

        /** Remembers the given callback and synchronously returns nothing. */
        begin: (fi: FiberEx, callback: AsyncAwait.Callback<any>) => {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            fi.context = callback;
            fi.resume();
        },

        /** Invokes the callback with a result or an error, depending on whether the function returned or threw. */
        end: (fi: FiberEx, error?, value?) => {
            if (error) fi.context(error); else fi.context(null, value);
        }
    })
});


//TODO:...
export var createAwaitBuilder = () => {
    
    
    var result = awaitBuilder.mod({

        name: 'cps',

        type: <AsyncAwait.Await.CPSBuilder> null,

        overrideHandlers: (base, options) => ({
            singular: (fi, arg) => {
                if (arg !== void 0) return _.notHandled;

                if (fi.awaiting.length !== 1) {
                    // TODO: mismatch here - raise an error
                    fi.resume(null, new Error('222'));
                }

                fi.awaiting[0] = (err, res) => {
                    fi.awaiting = [];
                    fi.resume(err, res);
                }
            

            },
            variadic: (fi, args) => {
                if (args[0] !== void 0) return _.notHandled;
            },

            elements: (values: any[], result: (err: Error, value?: any, index?: number) => void) => {

                // TODO: temp testing...
                var k = 0, fi = _.currentFiber();
                values.forEach((value, i) => {
                    if (i in values && values[i] === void 0) {
                        fi.awaiting[k++] = (err, res) => {
                            if (err) return result(err, null, i);
                            return result(null, res, i);    
                        };
                    }
                });
                if (k !== fi.awaiting.length) {
                    // TODO: mismatch here - raise an error
                    result(new Error('111'));
                }
                return k;
            }
        })
    });

    //TODO: is jointProtocol the right place for this?
    result.continuation = _.createContinuation;
    return result;
};

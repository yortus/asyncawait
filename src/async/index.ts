import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import common = require('./asyncCommon')
var wrapper = common.wrapper, Semaphore = common.Semaphore, Context = common.Context, Output = common.AsyncOutput;
export = async;


/**
 * Creates a function that can be suspended at each asynchronous operation using await().
 * @param {Function} fn - Contains the body of the suspendable function. Calls to await()
 *                        may appear inside this function.
 * @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
 *                     passed to this function are passed through to fn. The returned
 *                     promise is resolved when fn returns, or rejected if fn throws.
 */
var async: AsyncAwait.Async;
async = <any> createAsyncFunction({ output: Output.Promise });
async.concurrency = (n: number) => createAsyncFunction({ output: Output.Promise, concurrency: n });
async.iterable = createAsyncFunction({ output: Output.PromiseIterator });

/** Options for varying the behaviour of the async() function. */
interface AsyncOptions {
    output: common.AsyncOutput;
    concurrency?: number;
}


/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options: AsyncOptions) {

    // Return an async function tailored to the given options.
    var concurrency = options.concurrency;
    return function(fn: Function) {

        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = concurrency ? new Semaphore(concurrency) : Semaphore.unlimited;

        //TODO:...
        // Return a function that executes fn in a fiber and returns a promise of fn's result.
        // Return a function that returns an iterator.
        return function (): any {

            //TODO:...
            // Get all the arguments passed in, as an array.
            // Capture initial arguments used to start the iterator.
            var argsAsArray = new Array(arguments.length);
            for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

            if (options.output === Output.Promise) {

                // Create a new promise.
                var resolver = Promise.defer<any>();

                // Start fn in a coroutine. Limit top-level concurrency if requested.
                var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
                var context = new Context(Output.Promise, fn, this, argsAsArray, sem);
                context.value = resolver;
                sem.enter(() => Fiber(wrapper).run(context));

                // Return the promise.
                return resolver.promise;

            } else if (options.output === Output.PromiseIterator) {


                // 1 iterator <==> 1 fiber
                var fiber = Fiber(wrapper);
                var context = new common.Context(Output.PromiseIterator, fn, null/*TODO proper this arg*/, argsAsArray, semaphore);

                //TODO:...
                var yield_ = expr => {
                    context.value.resolve(expr);
                    context.done.resolve(false);
                    Fiber.yield();
                }
                argsAsArray.unshift(yield_);

                //TODO...
                var result = new common.Iterator(fiber, context);
                return <{ next: Function; forEach: Function; }> result;
            }
        };
    };
}

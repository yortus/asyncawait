import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import runInFiber = require('./runInFiber');
import RunContext = require('./runContext');
import OutputKind = require('./outputKind');
import Semaphore = require('./semaphore');
import PromiseIterator = require('./promiseIterator');
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
async = <any> createAsyncFunction({ outputKind: OutputKind.Promise });
async.concurrency = (n: number) => createAsyncFunction({ outputKind: OutputKind.Promise, concurrency: n });
async.iterable = createAsyncFunction({ outputKind: OutputKind.PromiseIterator });

/** Options for varying the behaviour of the async() function. */
interface AsyncOptions {
    outputKind: OutputKind;
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

            if (options.outputKind === OutputKind.Promise) {

                // Create a new promise.
                var resolver = Promise.defer<any>();

                // Start fn in a coroutine. Limit top-level concurrency if requested.
                var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
                var runContext = new RunContext(OutputKind.Promise, fn, this, argsAsArray, sem);
                runContext.value = resolver;
                sem.enter(() => Fiber(runInFiber).run(runContext));

                // Return the promise.
                return resolver.promise;

            } else if (options.outputKind === OutputKind.PromiseIterator) {


                // 1 iterator <==> 1 fiber
                var fiber = Fiber(runInFiber);
                var runContext = new RunContext(OutputKind.PromiseIterator, fn, null/*TODO proper this arg*/, argsAsArray, semaphore);

                //TODO:...
                var yield_ = expr => {
                    //TODO: await expr first?
                    runContext.value.resolve({ value: expr, done: false });
                    Fiber.yield();
                }
                argsAsArray.unshift(yield_);

                //TODO...
                var result = new PromiseIterator(fiber, runContext);
                return <{ next: Function; forEach: Function; }> result;
            }
        };
    };
}

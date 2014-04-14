import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
import _ = require('lodash');
import Options = require('./options');
import CallbackArg = require('./callbackArg');
import ReturnValue = require('./returnValue');
import runInFiber = require('./runInFiber');
import RunContext = require('./runContext');
import Semaphore = require('./semaphore');
import AsyncIterator = require('./asyncIterator');
export = async;


/** TODO: ... */
var defaultOptions: Options = {
    returnValue: ReturnValue.Promise,
    callbackArg: CallbackArg.None,
    isIterable: false,
    //TODO:...isVariadic: true,
    maxConcurrency: null
};


/**
 * Creates a function that can be suspended at each asynchronous operation using await().
 * @param {Function} fn - Contains the body of the suspendable function. Calls to await()
 *                        may appear inside this function.
 * @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
 *                     passed to this function are passed through to fn. The returned
 *                     promise is resolved when fn returns, or rejected if fn throws.
 */
var async: AsyncAwait.Async;
async = <any> createAsyncFunction({});
async.concurrency = (n: number) => createAsyncFunction({ maxConcurrency: n });
async.iterable = createAsyncFunction({ isIterable: true });
async.cps = createAsyncFunction({ returnValue: ReturnValue.None, callbackArg: CallbackArg.Required });


/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options_: Options) {
    
    // Return an async function tailored to the given options.
    var options: Options = _.defaults({}, options_, defaultOptions);
    return function(bodyFunc: Function) {

        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = options.maxConcurrency ? new Semaphore(options.maxConcurrency) : Semaphore.unlimited;

        // Choose and run the appropriate function factory based on whether the result should be iterable.
        var createFn = options.isIterable ? createAsyncIterator : createAsyncNonIterator;
        return createFn(bodyFunc, options, semaphore);
    };
}


function createAsyncIterator(bodyFunc: Function, options: Options, semaphore: Semaphore) {

    // Return a function that returns an iterator.
    return function (): any {

        // Capture the initial arguments used to start the iterator.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // 1 iterator <==> 1 fiber
        //TODO: limit concurrency?
        var fiber = Fiber(runInFiber);
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);

        // Create a yield() function tailored for this iterator.
        var yield_ = expr => {
            //TODO: await expr first?
            if (options.callbackArg === CallbackArg.Required) runContext.callback(null, { value: expr, done: false });
            if (options.returnValue === ReturnValue.Promise) runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        }
        argsAsArray.unshift(yield_);

        // Return the iterator.
        return new AsyncIterator(fiber, runContext);
    };
}


function createAsyncNonIterator(bodyFunc: Function, options: Options, semaphore: Semaphore) {

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function (): any {

        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Configure the run context. Limit top-level concurrency if requested.
        var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, sem);
        if (options.returnValue === ReturnValue.Promise) {

            // Create a new promise.
            var resolver = Promise.defer<any>();
            runContext.resolver = resolver;
        }
        if (options.callbackArg === CallbackArg.Required) {

            // Pop the callback from the args array.
            var callback = argsAsArray.pop();
            runContext.callback = callback;
        }

        // Execute fn to completion in a coroutine.
        sem.enter(() => Fiber(runInFiber).run(runContext));

        // Return the appropriate value.
        return options.returnValue === ReturnValue.Promise ? resolver.promise : undefined;
    };
}

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
async.concurrency = <any> ((n: number) => createAsyncFunction({ maxConcurrency: n }));
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
        var result: Function = createFn(bodyFunc, options, semaphore);

        //TODO: 'arity' should be +1 if CallbackArg.Required (think of mocha's 'done', express's 'next', ...)
        //TODO: document this...
        result = passThruWithArity(result, (<any> bodyFunc).name, bodyFunc.length);
        return result;
    };
}


/** TODO: describe */
function createAsyncIterator(bodyFunc: Function, options: Options, semaphore: Semaphore) {

    // Return a function that returns an iterator.
    return function (): any {

        // Capture the initial arguments used to start the iterator.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Create a yield() function tailored for this iterator.
        var yield_ = expr => {
            //TODO: await expr first? YES if options.returnValue === ReturnValue.Result
            if (options.callbackArg === CallbackArg.Required) runContext.callback(null, { value: expr, done: false });
            if (options.returnValue === ReturnValue.Promise) runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        }

        // Insert the yield function as the first argument when starting the iterator.
        argsAsArray.unshift(yield_);

        // Configure the run context.
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);

        // Return the iterator.
        return new AsyncIterator(runContext);
    };
}


/** TODO: describe */
function createAsyncNonIterator(bodyFunc: Function, options: Options, semaphore: Semaphore) {

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function (): any {

        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel) semaphore = Semaphore.unlimited;

        // Configure the run context.
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);
        if (options.returnValue === ReturnValue.Promise) {
            var resolver = Promise.defer<any>();
            runContext.resolver = resolver;
        }
        if (options.callbackArg === CallbackArg.Required) {
            //TODO: pop() or take [nth] depending on isVariadic
            var callback = argsAsArray.pop();
            runContext.callback = callback;
        }

        // Execute bodyFunc to completion in a coroutine.
        semaphore.enter(() => Fiber(runInFiber).run(runContext));

        // Return the appropriate value.
        return options.returnValue === ReturnValue.Promise ? resolver.promise : undefined;
    };
}


/**
 * TODO: document this, not all bodies are identical, only formal param list changes
 * TODO: would eval be competitive here (slower setup, faster on hot path?)
 */
function passThruWithArity(fn: Function, name: string, arity: number) {

    // Safe eval version (no untrusted vectors):
    // NB: slower to define async function, but faster to call (TEST THIS)
    //var defn    = "function funcName(/*params*/) {"
    //            + "    var l = arguments.length, args = new Array(l);"
    //            + "    for (var i = 0; i < l; ++i) args[i] = arguments[i];"
    //            + "    return fn.apply(this, args);"
    //            + "}";
    //var params: string[] = [];
    //for (var i = 0 ; i < arity; ++i) params.push('arg' + i);
    //var s = 'f = ' + defn.replace("funcName", name).replace('/*params*/', params.join(', '));
    //var f: Function;
    //eval(s);
    //return f;


    // Static version (need to handle each arity individually, but body never changes):
    // NB: faster to define async function, but slower to call (TEST THIS)
    switch (arity) {
        case 0: return function () {
            var l = arguments.length, args = new Array(l);
            for (var i = 0; i < l; ++i) args[i] = arguments[i];
            return fn.apply(this, args);
        }
        case 1: return function (a) {
            var l = arguments.length, args = new Array(l);
            for (var i = 0; i < l; ++i) args[i] = arguments[i];
            return fn.apply(this, args);
        }
        case 2: return function (a1, a2) {
            var l = arguments.length, args = new Array(l);
            for (var i = 0; i < l; ++i) args[i] = arguments[i];
            return fn.apply(this, args);
        }
        case 3: return function (a1, a2, a3) {
            var l = arguments.length, args = new Array(l);
            for (var i = 0; i < l; ++i) args[i] = arguments[i];
            return fn.apply(this, args);
        }
        case 4: return function (a1, a2, a3, a4) {
            var l = arguments.length, args = new Array(l);
            for (var i = 0; i < l; ++i) args[i] = arguments[i];
            return fn.apply(this, args);
        }
        default:
            return fn;
    }
}

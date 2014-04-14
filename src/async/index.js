var Fiber = require('fibers');
var Promise = require('bluebird');
var _ = require('lodash');

var CallbackArg = require('./callbackArg');
var ReturnValue = require('./returnValue');
var runInFiber = require('./runInFiber');
var RunContext = require('./runContext');
var Semaphore = require('./semaphore');
var AsyncIterator = require('./asyncIterator');

/** TODO: ... */
var defaultOptions = {
    returnValue: 1 /* Promise */,
    callbackArg: 0 /* None */,
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
var async;
async = createAsyncFunction({});
async.concurrency = function (n) {
    return createAsyncFunction({ maxConcurrency: n });
};
async.iterable = createAsyncFunction({ isIterable: true });
async.cps = createAsyncFunction({ returnValue: 0 /* None */, callbackArg: 1 /* Required */ });

/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options_) {
    // Return an async function tailored to the given options.
    var options = _.defaults({}, options_, defaultOptions);
    return function (bodyFunc) {
        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = options.maxConcurrency ? new Semaphore(options.maxConcurrency) : Semaphore.unlimited;

        // Choose and run the appropriate function factory based on whether the result should be iterable.
        var createFn = options.isIterable ? createAsyncIterator : createAsyncNonIterator;
        return createFn(bodyFunc, options, semaphore);
    };
}

function createAsyncIterator(bodyFunc, options, semaphore) {
    // Return a function that returns an iterator.
    return function () {
        // Capture the initial arguments used to start the iterator.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i)
            argsAsArray[i] = arguments[i];

        // 1 iterator <==> 1 fiber
        //TODO: limit concurrency?
        var fiber = Fiber(runInFiber);
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);

        // Create a yield() function tailored for this iterator.
        var yield_ = function (expr) {
            //TODO: await expr first?
            if (options.callbackArg === 1 /* Required */)
                runContext.callback(null, { value: expr, done: false });
            if (options.returnValue === 1 /* Promise */)
                runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        };
        argsAsArray.unshift(yield_);

        // Return the iterator.
        return new AsyncIterator(fiber, runContext);
    };
}

function createAsyncNonIterator(bodyFunc, options, semaphore) {
    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {
        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i)
            argsAsArray[i] = arguments[i];

        // Configure the run context. Limit top-level concurrency if requested.
        var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, sem);
        if (options.returnValue === 1 /* Promise */) {
            // Create a new promise.
            var resolver = Promise.defer();
            runContext.resolver = resolver;
        }
        if (options.callbackArg === 1 /* Required */) {
            // Pop the callback from the args array.
            var callback = argsAsArray.pop();
            runContext.callback = callback;
        }

        // Execute fn to completion in a coroutine.
        sem.enter(function () {
            return Fiber(runInFiber).run(runContext);
        });

        // Return the appropriate value.
        return options.returnValue === 1 /* Promise */ ? resolver.promise : undefined;
    };
}
module.exports = async;
//# sourceMappingURL=index.js.map

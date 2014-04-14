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

/** TODO: describe */
function createAsyncIterator(bodyFunc, options, semaphore) {
    // Return a function that returns an iterator.
    return function () {
        // Capture the initial arguments used to start the iterator.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i)
            argsAsArray[i] = arguments[i];

        // Create a yield() function tailored for this iterator.
        var yield_ = function (expr) {
            //TODO: await expr first? YES if options.returnValue === ReturnValue.Result
            if (options.callbackArg === 1 /* Required */)
                runContext.callback(null, { value: expr, done: false });
            if (options.returnValue === 1 /* Promise */)
                runContext.resolver.resolve({ value: expr, done: false });
            Fiber.yield();
        };

        // Insert the yield function as the first argument when starting the iterator.
        argsAsArray.unshift(yield_);

        // Configure the run context.
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);

        // Return the iterator.
        return new AsyncIterator(runContext);
    };
}

/** TODO: describe */
function createAsyncNonIterator(bodyFunc, options, semaphore) {
    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {
        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i)
            argsAsArray[i] = arguments[i];

        // Remove concurrency restrictions for nested calls, to avoid race conditions.
        var isTopLevel = !Fiber.current;
        if (!isTopLevel)
            semaphore = Semaphore.unlimited;

        // Configure the run context.
        var runContext = new RunContext(options, bodyFunc, this, argsAsArray, semaphore);
        if (options.returnValue === 1 /* Promise */) {
            var resolver = Promise.defer();
            runContext.resolver = resolver;
        }
        if (options.callbackArg === 1 /* Required */) {
            //TODO: pop() or take [nth] depending on isVariadic
            var callback = argsAsArray.pop();
            runContext.callback = callback;
        }

        // Execute bodyFunc to completion in a coroutine.
        semaphore.enter(function () {
            return Fiber(runInFiber).run(runContext);
        });

        // Return the appropriate value.
        return options.returnValue === 1 /* Promise */ ? resolver.promise : undefined;
    };
}
module.exports = async;
//# sourceMappingURL=index.js.map

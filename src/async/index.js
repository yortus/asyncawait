var Fiber = require('fibers');
var Promise = require('bluebird');
var _ = require('lodash');
var runInFiber = require('./runInFiber');
var RunContext = require('./runContext');

var Semaphore = require('./semaphore');
var PromiseIterator = require('./promiseIterator');

/** TODO: ... */
var defaultOptions = {
    isIterable: false,
    returnsPromise: true,
    acceptsCallback: false,
    concurrency: null
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
    return createAsyncFunction({ concurrency: n });
};
async.iterable = createAsyncFunction({ isIterable: true });
async.cps = createAsyncFunction({ acceptsCallback: true, returnsPromise: false });

/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options_) {
    // Return an async function tailored to the given options.
    var options = _.defaults({}, options_, defaultOptions);
    return function (fn) {
        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = options.concurrency ? new Semaphore(options.concurrency) : Semaphore.unlimited;

        //TODO:...
        // Return a function that executes fn in a fiber and returns a promise of fn's result.
        // Return a function that returns an iterator.
        return function () {
            //TODO:...
            // Get all the arguments passed in, as an array.
            // Capture initial arguments used to start the iterator.
            var argsAsArray = new Array(arguments.length);
            for (var i = 0; i < argsAsArray.length; ++i)
                argsAsArray[i] = arguments[i];

            if (!options.isIterable) {
                // Configure the run context. Limit top-level concurrency if requested.
                var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
                var runContext = new RunContext(options, fn, this, argsAsArray, sem);
                if (options.returnsPromise) {
                    // Create a new promise.
                    var resolver = Promise.defer();
                    runContext.resolver = resolver;
                }
                if (options.acceptsCallback) {
                    // Pop the callback from the args array.
                    var callback = argsAsArray.pop();
                    runContext.callback = callback;
                }

                // Execute fn to completion in a coroutine.
                sem.enter(function () {
                    return Fiber(runInFiber).run(runContext);
                });

                // Return the appropriate value.
                return options.returnsPromise ? resolver.promise : undefined;
            } else if (options.isIterable && options.returnsPromise && !options.acceptsCallback) {
                // 1 iterator <==> 1 fiber
                var fiber = Fiber(runInFiber);
                var runContext = new RunContext(options, fn, null, argsAsArray, semaphore);

                //TODO:...
                var yield_ = function (expr) {
                    //TODO: await expr first?
                    runContext.resolver.resolve({ value: expr, done: false });
                    Fiber.yield();
                };
                argsAsArray.unshift(yield_);

                //TODO...
                var result = new PromiseIterator(fiber, runContext);
                return result;
                //}
                //else if (!options.isIterable && !options.returnsPromise && options.acceptsCallback) {
                //    // Pop the callback from the args array
                //    var callback = argsAsArray.pop();
                //    // Start fn in a coroutine. Limit top-level concurrency if requested.
                //    var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
                //    var runContext = new RunContext(options, fn, this, argsAsArray, sem);
                //    runContext.callback = callback;
                //    sem.enter(() => Fiber(runInFiber).run(runContext));
            } else {
                throw new Error('Not Implemented!');
            }
        };
    };
}
module.exports = async;
//# sourceMappingURL=index.js.map

var Fiber = require('fibers');
var Promise = require('bluebird');
var wrapper = require('./wrapper');
var Context = require('./context');
var AsyncOutput = require('./asyncOutput');
var Semaphore = require('./semaphore');
var Iterator = require('./iterator');

/**
* Creates a function that can be suspended at each asynchronous operation using await().
* @param {Function} fn - Contains the body of the suspendable function. Calls to await()
*                        may appear inside this function.
* @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
*                     passed to this function are passed through to fn. The returned
*                     promise is resolved when fn returns, or rejected if fn throws.
*/
var async;
async = createAsyncFunction({ output: 0 /* Promise */ });
async.concurrency = function (n) {
    return createAsyncFunction({ output: 0 /* Promise */, concurrency: n });
};
async.iterable = createAsyncFunction({ output: 1 /* PromiseIterator */ });


/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options) {
    // Return an async function tailored to the given options.
    var concurrency = options.concurrency;
    return function (fn) {
        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = concurrency ? new Semaphore(concurrency) : Semaphore.unlimited;

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

            if (options.output === 0 /* Promise */) {
                // Create a new promise.
                var resolver = Promise.defer();

                // Start fn in a coroutine. Limit top-level concurrency if requested.
                var isTopLevel = !Fiber.current, sem = isTopLevel ? semaphore : Semaphore.unlimited;
                var context = new Context(0 /* Promise */, fn, this, argsAsArray, sem);
                context.value = resolver;
                sem.enter(function () {
                    return Fiber(wrapper).run(context);
                });

                // Return the promise.
                return resolver.promise;
            } else if (options.output === 1 /* PromiseIterator */) {
                // 1 iterator <==> 1 fiber
                var fiber = Fiber(wrapper);
                var context = new Context(1 /* PromiseIterator */, fn, null, argsAsArray, semaphore);

                //TODO:...
                var yield_ = function (expr) {
                    context.value.resolve(expr);
                    context.done.resolve(false);
                    Fiber.yield();
                };
                argsAsArray.unshift(yield_);

                //TODO...
                var result = new Iterator(fiber, context);
                return result;
            }
        };
    };
}
module.exports = async;
//# sourceMappingURL=index.js.map

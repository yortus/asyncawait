var Fiber = require('fibers');
var Promise = require('bluebird');

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


/** Function for creating a specific variant of the async() function. */
function createAsyncFunction(options) {
    // Return an async function tailored to the given options.
    var concurrency = options.concurrency;
    return function (fn) {
        // Create a semaphore for limiting top-level concurrency, if specified in options.
        var semaphore = concurrency ? new Semaphore(concurrency) : null;
        var leaveSemaphore = function () {
            return semaphore.leave();
        };
        var noop = function () {
        };

        // Return a function that executes fn in a fiber and returns a promise of fn's result.
        return function () {
            // Get all the arguments passed in, as an array.
            var argsAsArray = new Array(arguments.length);
            for (var i = 0; i < argsAsArray.length; ++i)
                argsAsArray[i] = arguments[i];

            // Create a new promise.
            var resolver = Promise.defer();
            var resolve = resolver.resolve.bind(resolver);
            var reject = resolver.reject.bind(resolver);

            // Start fn in a coroutine. Limit top-level concurrency if requested.
            var isTopLevel = !Fiber.current;
            if (isTopLevel && semaphore) {
                var context = new Context(fn, this, argsAsArray, resolve, reject, leaveSemaphore);
                semaphore.enter(function () {
                    return Fiber(wrapper).run(context);
                });
            } else {
                var context = new Context(fn, this, argsAsArray, resolve, reject, noop);
                Fiber(wrapper).run(context);
            }

            // Return the promise.
            return resolver.promise;
        };
    };
}

/**
* The following functionality prevents memory leaks in node-fibers by actively managing Fiber.poolSize.
* For more information, see https://github.com/laverdet/node-fibers/issues/169.
*/
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
function adjustFiberCount(delta) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}

/**
* The wrapper() function accepts a Context instance, and calls the wrapped function which is
* described in the context. The result of the call is used to resolve the context's promise.
* If an exception is thrown, the context's promise is rejected. This function must take all
* its information in a single argument (i.e. the context), because it is called via
* Fiber#run(), which accepts at most one argument.
*/
function wrapper(context) {
    try  {
        adjustFiberCount(+1);
        var result = context.wrapped.apply(context.thisArg, context.argsAsArray);
        context.resolve(result);
    } catch (err) {
        context.reject(err);
    } finally {
        adjustFiberCount(-1);
        context.leave();
    }
}

/** A class for encapsulating the single argument passed to the wrapper() function. */
var Context = (function () {
    function Context(wrapped, thisArg, argsAsArray, resolve, reject, leave) {
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.resolve = resolve;
        this.reject = reject;
        this.leave = leave;
    }
    return Context;
})();

/** A simple abstraction for limiting concurrent function calls to a specific upper bound. */
var Semaphore = (function () {
    function Semaphore(n) {
        this.n = n;
        this._queued = [];
        this._avail = n;
    }
    Semaphore.prototype.enter = function (fn) {
        if (this._avail > 0) {
            --this._avail;
            fn();
        } else {
            this._queued.push(fn);
        }
    };

    Semaphore.prototype.leave = function () {
        if (this._queued.length > 0) {
            var fn = this._queued.pop();
            fn();
        } else {
            ++this._avail;
        }
    };
    return Semaphore;
})();
module.exports = async;

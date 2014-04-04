var deep = require('deep');
var Fiber = require('fibers');
var Promise = require('bluebird');
var Semaphore = require('./Semaphore');

// This interface describes the single argument passed to the wrapper() function (defined below).
var Context = (function () {
    function Context(wrapped, thisArg, argsAsArray, resolve, reject, leave) {
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.resolve = resolve;
        this.reject = reject;
        this.leave = leave || (function () {
        });
    }
    return Context;
})();

// This function accepts a context hash, and makes a function call as descibed in the context.
// The result of the call is used to resolve the context's promise. If an exception is thrown,
// the context's promise is rejected. This function must take all its information in a single
// argument (i.e. the context), because it is called via Fiber#run(), which accepts at most
// one argument.
function wrapper(context) {
    try  {
        var result = context.wrapped.apply(context.thisArg, context.argsAsArray);
        context.resolve(result);
    } catch (err) {
        context.reject(err);
    } finally {
        // Exit the semaphore.
        context.leave();
    }
}

// This is the async() API function (see docs).
var async = function (fn) {
    //TODO: temp testing... document and make configurable
    // Create a semaphore.
    var semaphore = new Semaphore(10);

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {
        var _this = this;
        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i)
            argsAsArray[i] = arguments[i];

        // Create a new promise.
        return new Promise(function (resolve, reject) {
            // Limit top-level call concurrency for better performance (TODO: in which situations? doc this).
            if (!Fiber.current) {
                var context = new Context(fn, _this, argsAsArray, resolve, reject, function () {
                    return semaphore.leave();
                });
                semaphore.enter(function () {
                    return Fiber(wrapper).run(context);
                });
            } else {
                var context = new Context(fn, _this, argsAsArray, resolve, reject, function () {
                });
                Fiber(wrapper).run(context);
            }
        });
    };
};
module.exports = async;

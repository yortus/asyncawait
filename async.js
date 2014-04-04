var deep = require('deep');
var Fiber = require('fibers');
var Promise = require('bluebird');
var Semaphore = require('./Semaphore');


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
    //TODO: temp testing... Create a semaphore.
    var semaphore = new Semaphore(10);

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {
        var _this = this;
        // Get all the arguments passed in, as an array.
        var argsAsArray = arguments;

        // Create a new promise.
        return new Promise(function (resolve, reject) {
            // Construct the context argument to be passed into the wrapper() function.
            var context = {
                wrapped: fn,
                thisArg: _this,
                argsAsArray: argsAsArray,
                resolve: resolve,
                reject: reject,
                leave: function () {
                    return semaphore.leave();
                }
            };

            // run() executes the wrapper() function in a new fiber.
            var run = function () {
                return Fiber(wrapper).run(context);
            };

            // Limit top-level call concurrency for better performance (TODO: in which situations? doc this).
            if (!Fiber.current) {
                semaphore.enter(run);
            } else {
                context.leave = function () {
                };
                run();
            }
        });
    };
};
module.exports = async;

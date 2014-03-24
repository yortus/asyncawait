var deep = require('deep');
var Fiber = require('fibers');
var Promise = require('bluebird');


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
    }
}

// This is the async() API function (see docs).
var async = function (fn) {
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
                reject: reject
            };

            // Execute the wrapper() function in a new fiber.
            Fiber(wrapper).run(context);
        });
    };
};
module.exports = async;

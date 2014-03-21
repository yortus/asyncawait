import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = async;


// This interface describes the single argument passed to the wrapper function (defined below).
interface Context {
    wrapped: Function;
    thisArg: any;
    argsAsArray: IArguments;
    resolve: Function;
    reject: Function
}

// This function accepts a context hash, and makes a function call as descibed in the context.
// The result of the call is used to resolve the context's promise. If an exception is thrown,
// the context's promise is rejected. This function must take all its information in a single
// argument (i.e. the context), because it is called via Fiber#run(), which accepts at most
// one argument.
function wrapper(context: Context) {
    try {
        var result = context.wrapped.apply(context.thisArg, context.argsAsArray);
        context.resolve(result);
    }
    catch (err) {
        context.reject(err);
    }
}

// This is the async() API function (see docs).
var async: AsyncAwait.IAsync = function(fn: Function) {

    // Create a fiber whose body is the wrapper() function defined above.
    // Thus, one fiber is created per async function. Fibers are eligible for garbage
    // collection when there are no more references to the function returned by async().
    var fnAsFiber = Fiber(wrapper);

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {

        // Get all the arguments passed in, as an array.
        var argsAsArray = arguments;

        // Create a new promise.
        return new Promise((resolve, reject) => {

            // Build the context argument expected by wrapper().
            var context: Context = {
                wrapped: fn,
                thisArg: this,
                argsAsArray: argsAsArray,
                resolve: resolve,
                reject: reject
            };

            // Execute the wrapper function in a fiber
            if (Fiber.current) {

                // There's already a current fiber, so we can call wrapper() directly.
                // This saves the overhead of switching execution to a different fiber.
                wrapper(context);
            } else {

                // There's no current fiber, so use the fnAsFiber created above.
                fnAsFiber.run(context);
            }
        });
    };
};

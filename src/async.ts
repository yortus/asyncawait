import _refs = require('_refs');
var deep = require('deep');
import Fiber = require('fibers');
import Promise = require('bluebird');
import Semaphore = require('./Semaphore');
export = async;


// This interface describes the single argument passed to the wrapper() function (defined below).
class Context {
    constructor(wrapped, thisArg, argsAsArray, resolve, reject, leave?) {
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.resolve = resolve;
        this.reject = reject;
        this.leave = leave || (() => {});
    }
    wrapped: Function;
    thisArg: any;
    argsAsArray: any[];
    resolve: Function;
    reject: Function;
    leave: Function;
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
    finally {

        // Exit the semaphore.
        context.leave();
    }
}

// This is the async() API function (see docs).
var async: AsyncAwait.IAsync = function(fn: Function) {

    //TODO: temp testing... document and make configurable 
    // Create a semaphore.
    var semaphore = new Semaphore(10);

    // Return a function that executes fn in a fiber and returns a promise of fn's result.
    return function () {

        // Get all the arguments passed in, as an array.
        var argsAsArray = new Array(arguments.length);
        for (var i = 0; i < argsAsArray.length; ++i) argsAsArray[i] = arguments[i];

        // Create a new promise.
        return new Promise((resolve, reject) => {

            // Limit top-level call concurrency for better performance (TODO: in which situations? doc this).
            if (!Fiber.current) {
                var context = new Context(fn, this, argsAsArray, resolve, reject, () => semaphore.leave());
                semaphore.enter(() => Fiber(wrapper).run(context));
            } else {
                var context = new Context(fn, this, argsAsArray, resolve, reject, () => {});
                Fiber(wrapper).run(context);
            }
        });
    };
};

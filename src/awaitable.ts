import _refs = require('_refs');
import Promise = require('bluebird');
export = awaitable;


// This is the awaitable() API function (see docs).
var awaitable: AsyncAwait.IAwaitable = function(fn: Function) {

    // Return a function that returns a promise of fn's results.
    return () => {

        // Create a clone of the arguments array.
        var args = Array.prototype.slice.call(arguments, 0);

        // Create a new promise.
        return new Promise((resolve, reject) => {

            // Create a node-style callback that resolves or rejects the promise.
            var callback = (err, result) => err ? reject(err) : resolve(result);

            // Add the callback to the arguments array cloned above.
            args.push(callback);

            // Call fn, which will eventually call callback() and resolve/reject the promise.
            var ret = fn.apply(this, args);
        });
    };
}

var Promise = require('bluebird');

// This is the awaitable() API function (see docs).
var awaitable = function (fn) {
    var _this = this;
    // Return a function that returns a promise of fn's results.
    return function () {
        // Create a clone of the arguments array.
        var args = Array.prototype.slice.call(arguments, 0);

        // Create a new promise.
        return new Promise(function (resolve, reject) {
            // Create a node-style callback that resolves or rejects the promise.
            var callback = function (err, result) {
                return err ? reject(err) : resolve(result);
            };

            // Add the callback to the arguments array cloned above.
            args.push(callback);

            // Call fn, which will eventually call callback() and resolve/reject the promise.
            var ret = fn.apply(_this, args);
        });
    };
};
module.exports = awaitable;

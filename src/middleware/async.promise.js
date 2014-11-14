var Promise = require('bluebird');

function promise() {
    return {
        /** Sets up a promise resolver and synchronously returns a promise. */
        begin: function (fi) {
            var resolver = fi.context = Promise.defer();
            fi.resume();
            return resolver.promise;
        },
        /** Resolves or rejects the promise, depending on whether the function returned or threw. */
        end: function (fi, error, value) {
            if (error)
                fi.context.reject(error);
            else
                fi.context.resolve(value);
        }
    };
}
module.exports = promise;
//# sourceMappingURL=async.promise.js.map

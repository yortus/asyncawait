var Promise = require('bluebird');

var mod = {
    /** Used for diagnostic purposes. */
    name: 'promise',
    /** Used only for automatic type interence at TypeScript compile time. */
    type: null,
    /** Provides appropriate handling for promise-returning suspendable functions. */
    override: function (base, options) {
        return ({
            /** Sets up a promise resolver and synchronously returns a promise. */
            begin: function (fi) {
                var resolver = fi.context = Promise.defer();
                fi.resume();
                return resolver.promise;
            },
            /** Calls the promise's progress() handler whenever the function yields, then continues execution. */
            suspend: function (fi, error, value) {
                if (error)
                    throw error;
                fi.context.progress(value); // NB: fiber does NOT yield here, it continues
            },
            /** Resolves or rejects the promise, depending on whether the function returned or threw. */
            end: function (fi, error, value) {
                if (error)
                    fi.context.reject(error);
                else
                    fi.context.resolve(value);
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=async.promise.js.map

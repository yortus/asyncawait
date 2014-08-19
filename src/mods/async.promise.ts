import references = require('references');
import Promise = require('bluebird');
export = mod;


var mod = {
    name: 'async.promise',

    base: 'async.',

    /** Provides appropriate handling for promise-returning suspendable functions. */
    override: (base, options) => ({

        /** Sets up a promise resolver and synchronously returns a promise. */
        begin: (fi) => {
            var resolver = fi.context = Promise.defer<any>();
            fi.resume();
            return resolver.promise;
        },

        /** Calls the promise's progress() handler whenever the function yields, then continues execution. */
        suspend: (fi, error?, value?) => {
            if (error) throw error; // NB: not handled - throw in fiber
            fi.context.progress(value); // NB: fiber does NOT yield here, it continues
        },

        /** Resolves or rejects the promise, depending on whether the function returned or threw. */
        end: (fi, error?, value?) => {
            if (error) fi.context.reject(error); else fi.context.resolve(value);
        }
    })
};

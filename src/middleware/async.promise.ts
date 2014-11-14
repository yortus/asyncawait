import references = require('references');
import Promise = require('bluebird');
export = promise;


function promise() {
    return {

        /** Sets up a promise resolver and synchronously returns a promise. */
        begin: (fi) => {
            var resolver = fi.context = Promise.defer<any>();
            fi.resume();
            return resolver.promise;
        },

        /** Resolves or rejects the promise, depending on whether the function returned or threw. */
        end: (fi, error?, value?) => {
            if (error) fi.context.reject(error); else fi.context.resolve(value);
        }
    };
}

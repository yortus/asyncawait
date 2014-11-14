import references = require('references');
import assert = require('assert');
import _ = require('../util');
export = cps;


function cps() {
    return {

        /** Remembers the given callback and synchronously returns nothing. */
        begin: (fi, callback: AsyncAwait.Callback<any>) => {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            fi.context = callback;
            fi.resume();
        },

        /** Invokes begin()'s callback with the suspendable function's returned value or thrown error. */
        end: (fi, error?, value?) => {
            if (error) fi.context(error); else fi.context(null, value);
        }
    };
}

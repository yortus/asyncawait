var assert = require('assert');
var _ = require('../util');

function cps() {
    return {
        /** Remembers the given callback and synchronously returns nothing. */
        begin: function (fi, callback) {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            fi.context = callback;
            fi.resume();
        },
        /** Invokes begin()'s callback with the suspendable function's returned value or thrown error. */
        end: function (fi, error, value) {
            if (error)
                fi.context(error);
            else
                fi.context(null, value);
        }
    };
}
module.exports = cps;
//# sourceMappingURL=async.cps.js.map

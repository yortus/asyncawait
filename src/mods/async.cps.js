var assert = require('assert');
var _ = require('../util');

/** Provides an async builder for producing suspendable functions accept node-style callbacks. */
var mod = {
    name: 'async.cps',
    base: '',
    /** Provides appropriate handling for callback-accepting suspendable functions. */
    override: function (base, options) {
        return ({
            /** Remembers the given callback and synchronously returns nothing. */
            begin: function (fi, callback) {
                assert(_.isFunction(callback), 'Expected final argument to be a callback');
                fi.context = callback;
                fi.resume();
            },
            /** Invokes the callback with a result or an error, depending on whether the function returned or threw. */
            end: function (fi, error, value) {
                if (error)
                    fi.context(error);
                else
                    fi.context(null, value);
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=async.cps.js.map

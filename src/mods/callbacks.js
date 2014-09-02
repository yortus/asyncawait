var assert = require('assert');
var _ = require('../util');

///** TODO */
var mods = [
    {
        name: 'async.cps',
        base: null,
        override: overrideAsync
    },
    {
        name: 'await.cps',
        base: null,
        override: overrideAwait
    }
];

/** Provides appropriate handling for callback-accepting suspendable functions. */
function overrideAsync(base, options) {
    return {
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
    };
}

function overrideAwait(base, options) {
    return {
        singular: function (fi, arg) {
            if (arg !== void 0)
                return _.notHandled;

            if (fi.awaiting.length !== 1) {
                // TODO: mismatch here - raise an error
                fi.resume(null, new Error('222'));
            }

            fi.awaiting[0] = function (err, res) {
                fi.awaiting = [];
                fi.resume(err, res);
            };
        },
        variadic: function (fi, args) {
            if (args[0] !== void 0)
                return _.notHandled;
        },
        elements: function (values, result) {
            // TODO: temp testing...
            var k = 0, fi = _.currentFiber();
            values.forEach(function (value, i) {
                if (i in values && values[i] === void 0) {
                    fi.awaiting[k++] = function (err, res) {
                        if (err)
                            return result(err, null, i);
                        return result(null, res, i);
                    };
                }
            });
            if (k !== fi.awaiting.length) {
                // TODO: mismatch here - raise an error
                result(new Error('111'));
            }
            return k;
        }
    };
}
module.exports = mods;
//# sourceMappingURL=callbacks.js.map

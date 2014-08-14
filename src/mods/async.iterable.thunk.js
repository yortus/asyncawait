var assert = require('assert');
var _ = require('../util');

var mod = {
    name: 'iterable.thunk',
    //TODO: ...
    base: 'iterable.cps',
    type: null,
    override: function (cps, options) {
        return ({
            begin: function (fi) {
                var iter = cps.begin(fi);
                return {
                    next: function () {
                        return function (callback) {
                            return iter.next(callback);
                        };
                    },
                    forEach: function (callback) {
                        // Ensure that a single argument has been supplied, which is a function.
                        assert(arguments.length === 1, 'forEach(): expected a single argument');
                        assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

                        // Return a thunk
                        return function (done) {
                            return iter.forEach(callback, done);
                        };
                    }
                };
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=async.iterable.thunk.js.map

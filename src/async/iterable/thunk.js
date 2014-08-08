var assert = require('assert');
var oldBuilder = require('./cps');
var _ = require('../../util');

var newBuilder = oldBuilder.mod({
    name: 'iterable.thunk',
    type: null,
    overrideProtocol: function (cps, options) {
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
});
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map

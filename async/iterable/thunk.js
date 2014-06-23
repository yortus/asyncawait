var assert = require('assert');

var oldBuilder = require('./cps');

var builder = oldBuilder.mod({
    methods: function (options, cps) {
        return ({
            invoke: function (co) {
                var iter = cps.invoke(co);
                return {
                    next: function () {
                        return function (callback) {
                            return iter.next(callback);
                        };
                    },
                    forEach: function (callback) {
                        // Ensure that a single argument has been supplied, which is a function.
                        assert(arguments.length === 1, 'forEach(): expected a single argument');
                        assert(typeof (callback) === 'function', 'forEach(): expected argument to be a function');

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
module.exports = builder;
//# sourceMappingURL=thunk.js.map

var assert = require('assert');
var _ = require('lodash');
var iterableCPSProtocol = require('./iterableCps');


var protocol = {
    methods: function (options, fallback) {
        var methods = iterableCPSProtocol.methods(options, fallback);
        var cpsInvoke = methods.invoke;
        methods.invoke = function (co) {
            var iter = cpsInvoke(co);
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
        };
        return methods;
    }
};
module.exports = protocol;
//# sourceMappingURL=iterableThunk.js.map

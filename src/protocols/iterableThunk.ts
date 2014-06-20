import references = require('references');
import assert = require('assert');
import _ = require('lodash');
import iterableCPSProtocol = require('./iterableCps');
import Protocol = AsyncAwait.Async.Protocol;
export = protocol;


var protocol: Protocol = {
    methods: (options, fallback) => {
        var methods = iterableCPSProtocol.methods(options, fallback);
        var cpsInvoke = methods.invoke;
        methods.invoke = (co) => {
            var iter = cpsInvoke(co);
            return {
                next: () => (callback) => iter.next(callback),
                forEach: callback => {

                    // Ensure that a single argument has been supplied, which is a function.
                    assert(arguments.length === 1, 'forEach(): expected a single argument');
                    assert(_.isFunction(callback), 'forEach(): expected argument to be a function');

                    // Return a thunk
                    return done => iter.forEach(callback, done);
                }
            };
        };
        return methods;
    }
};

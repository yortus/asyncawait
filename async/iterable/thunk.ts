import references = require('references');
import assert = require('assert');
import _ = require('lodash');
import oldBuilder = require('./cps');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Async.IterableThunkBuilder>({
    methods: (options, cps) => ({
        invoke: (co) => {
            var iter = cps.invoke(co);
            return {
                next: () => (callback) => iter.next(callback),
                forEach: callback => {

                    // Ensure that a single argument has been supplied, which is a function.
                    assert(arguments.length === 1, 'forEach(): expected a single argument');
                    assert(typeof(callback) === 'function', 'forEach(): expected argument to be a function');

                    // Return a thunk
                    return done => iter.forEach(callback, done);
                }
            };
        }
    })
});

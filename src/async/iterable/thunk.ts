import references = require('references');
import assert = require('assert');
import oldBuilder = require('./cps');
import _ = require('../../util');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'iterable.thunk',

    type: <AsyncAwait.Async.IterableThunkBuilder> null,

    overrideProtocol: (cps, options) => ({
        begin: (fi) => {
            var iter = cps.begin(fi);
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
        }
    })
});

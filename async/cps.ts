import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import assert = require('assert');
import _ = require('../src/util');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Async.CPSBuilder> null,

    overrideProtocol: (base, options) => ({
        invoke: (co, callback: AsyncAwait.Callback<any>) => {
            assert(_.isFunction(callback), 'Expected final argument to be a callback');
            co.context = callback;
            co.enter();
        },
        return: (callback, result) => callback(null, result),
        throw: (callback, error) => callback(error)
    })
});

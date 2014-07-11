import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import assert = require('assert');
import _ = require('../src/util');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Async.CPSBuilder>(() => ({
    default: (co) => { co.callback = null; },
    invoke: (co, callback: AsyncAwait.Callback<any>) => {
        assert(_.isFunction(callback), 'Expected final argument to be a callback');
        co.callback = callback;
        co.enter();
    },
    return: (co, result) => co.callback(null, result),
    throw: (co, error) => co.callback(error)
}));

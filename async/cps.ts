import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import assert = require('assert');
import transfer = require('../src/transfer');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Async.CPSBuilder>({
    methods: () => ({
        invoke: (co, callback: AsyncAwait.Callback<any>) => {
            assert(typeof(callback) === 'function', 'Expected final argument to be a callback');
            co.callback = callback;
            transfer(co);
        },
        return: (co, result) => co.callback(null, result),
        throw: (co, error) => co.callback(error),
        finally: (co) => { co.callback = null; }
    })
});

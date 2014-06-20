import references = require('references');
import assert = require('assert');
import transfer = require('../transfer');
import Protocol = AsyncAwait.Async.Protocol;
export = protocol;


var protocol: Protocol = {
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
};

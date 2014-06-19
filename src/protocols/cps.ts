import references = require('references');
import transfer = require('../transfer');
export = cpsProtocol;


var cpsProtocol = {
    invoke: (co, callback: AsyncAwait.Callback<any>) => {
        if (typeof(callback) !== "function") throw new Error('Expected final argument to be a callback');
        co.callback = callback;
        transfer(co);
    },
    return: (co, result) => co.callback(null, result),
    throw: (co, error) => co.callback(error),
    finally: (co) => { co.callback = null; }
}

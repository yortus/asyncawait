import references = require('references');
import asyncBase = require('./impl/asyncBase2');
export = async;


var async: AsyncAwait.AsyncCPS = <any> asyncBase.mod((resume, suspend) => {
    var callback: Function = null;
    return {
        create: (callback_: AsyncAwait.Callback<any>) => {
            if (typeof(callback_) !== "function") throw new Error('Expected final argument to be a callback');
            callback = callback_;
            setImmediate(resume);
        },
        return: result => callback(null, result),
        throw: error => callback(error),
    };
});

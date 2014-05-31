import references = require('references');
import asyncBase = require('./impl/asyncBase2');
export = async;


var async: AsyncAwait.AsyncCPS = <any> asyncBase.mod(base => {
    var callback: Function = null;
    return {
        create: function (callback_: AsyncAwait.Callback<any>) {
            if (typeof(callback_) !== "function") throw new Error('Expected final argument to be a callback');
            callback = callback_;
            setImmediate(() => base.resume.call(this));
        },
        return: result => callback(null, result),
        throw: error => callback(error),
    };
});

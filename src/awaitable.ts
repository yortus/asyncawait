import _refs = require('_refs');
import Promise = require('bluebird');
export = awaitable;


var awaitable: AsyncAwait.IAwaitable = function(fn: Function) {
    return () => {
        var args = Array.prototype.slice.call(arguments, 0);
        return new Promise((resolve, reject) => {
            args.push((err, result) => err ? reject(err) : resolve(result));
            var ret = fn.apply(this, args);
        });
    };
}

import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = async;


var async: AsyncAwait.IAsync = function(fn: Function) {
    return () => {
        var args = arguments;
        return new Promise((resolve, reject) => {
            var f = Fiber((argsArray) => {
                try {
                    var result = fn.apply(null, argsArray);
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
            });
            f.run(args);
        });
    };
}

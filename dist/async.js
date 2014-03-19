var Fiber = require('fibers');
var Promise = require('bluebird');

var async = function (fn) {
    return function () {
        var args = arguments;
        return new Promise(function (resolve, reject) {
            var f = Fiber(function (argsArray) {
                try  {
                    var result = fn.apply(null, argsArray);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
            f.run(args);
        });
    };
};
module.exports = async;

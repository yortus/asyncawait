var Promise = require('bluebird');

var awaitable = function (fn) {
    var _this = this;
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return new Promise(function (resolve, reject) {
            args.push(function (err, result) {
                return err ? reject(err) : resolve(result);
            });
            var ret = fn.apply(_this, args);
        });
    };
};
module.exports = awaitable;

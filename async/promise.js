var Promise = require('bluebird');
var asyncBase = require('./impl/asyncBase2');


var async = asyncBase.mod(function (base) {
    var resolver = Promise.defer();
    var result = {
        create: function () {
            setImmediate(function () {
                return base.resume();
            });
            return resolver.promise;
        },
        return: function (result) {
            return resolver.resolve(result);
        },
        throw: function (error) {
            return resolver.reject(error);
        },
        yield: function (value) {
            return resolver.progress(value);
        }
    };
    return result;
});
module.exports = async;
//# sourceMappingURL=promise.js.map

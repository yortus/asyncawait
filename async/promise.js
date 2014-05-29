var Promise = require('bluebird');
var asyncBase = require('./impl/asyncBase2');


var async = asyncBase.mod(function (resume, suspend) {
    var resolver = Promise.defer();
    var result = {
        create: function () {
            setImmediate(resume);
            return resolver.promise;
        },
        delete: function () {
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

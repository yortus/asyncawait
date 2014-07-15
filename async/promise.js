var oldBuilder = require('../src/asyncBuilder');
var Promise = require('bluebird');

var builder = oldBuilder.derive(function () {
    return ({
        invoke: function (co) {
            var resolver = co.context = Promise.defer();
            co.enter();
            return resolver.promise;
        },
        return: function (resolver, result) {
            return resolver.resolve(result);
        },
        throw: function (resolver, error) {
            return resolver.reject(error);
        },
        yield: function (resolver, value) {
            resolver.progress(value);
            return true;
        }
    });
});
module.exports = builder;
//# sourceMappingURL=promise.js.map

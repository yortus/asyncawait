var oldBuilder = require('../src/asyncBuilder');
var Promise = require('bluebird');
var transfer = require('../src/transfer');

var builder = oldBuilder.mod(function () {
    return ({
        invoke: function (co) {
            co.resolver = Promise.defer();
            transfer(co);
            return co.resolver.promise;
        },
        return: function (co, result) {
            return co.resolver.resolve(result);
        },
        throw: function (co, error) {
            return co.resolver.reject(error);
        },
        yield: function (co, value) {
            return co.resolver.progress(value);
        },
        finally: function (co) {
            co.resolver = null;
        }
    });
});
module.exports = builder;
//# sourceMappingURL=promise.js.map

var oldBuilder = require('../src/asyncBuilder');
var Promise = require('bluebird');

var builder = oldBuilder.derive(function () {
    return ({
        clear: function (co) {
            co.resolver = null;
        },
        invoke: function (co) {
            co.resolver = Promise.defer();
            co.enter();
            return co.resolver.promise;
        },
        return: function (ctx, result) {
            return ctx.resolver.resolve(result);
        },
        throw: function (ctx, error) {
            return ctx.resolver.reject(error);
        },
        yield: function (ctx, value) {
            ctx.resolver.progress(value);
            return true;
        }
    });
});
module.exports = builder;
//# sourceMappingURL=promise.js.map

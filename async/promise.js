var oldBuilder = require('../src/asyncBuilder');
var pipeline = require('../src/pipeline');
var Promise = require('bluebird');

var newBuilder = oldBuilder.mod({
    name: 'promise',
    type: null,
    overrideProtocol: function (base, options) {
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
                return pipeline.continueAfterYield;
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map

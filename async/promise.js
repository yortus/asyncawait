var Promise = require('bluebird');
var oldBuilder = require('../src/asyncBuilder');



var newBuilder = oldBuilder.mod({
    name: 'promise',
    type: null,
    overrideProtocol: function (base, options) {
        return ({
            begin: function (fi) {
                var resolver = fi.context = Promise.defer();
                fi.resume();
                return resolver.promise;
            },
            suspend: function (fi, error, value) {
                if (error)
                    throw error;
                fi.context.progress(value); // NB: Fiber does NOT yield here
            },
            end: function (fi, error, value) {
                if (error)
                    fi.context.reject(error);
                else
                    fi.context.resolve(value);
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=promise.js.map

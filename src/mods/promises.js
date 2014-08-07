var Promise = require('bluebird');
var oldBuilder = require('../asyncBuilder');


/** TODO */
var promises = {
    name: 'promises',
    overrideProtocol: function (base, options) {
        return ({});
    },
    apply: function (options) {
        var api = require('../../async');
        api.promise = createBuilder();
    },
    reset: function () {
        var api = require('../../async');
        delete api.promise;
    },
    defaultOptions: {}
};


/** Provides an async builder for producing suspendable functions that return promises. */
var createBuilder = function () {
    return oldBuilder.mod({
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
                    fi.context.progress(value); // NB: fiber does NOT yield here
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
};
module.exports = promises;
//# sourceMappingURL=promises.js.map

var Promise = require('bluebird');
var asyncBuilder = require('../asyncBuilder');
var awaitBuilder = require('../awaitBuilder');
var _ = require('../util');

/** TODO */
exports.mod = {
    name: 'promises',
    overrideProtocol: function (base, options) {
        return ({
            startup: function () {
                base.startup();
                require('../../async').promise = exports.createAsyncBuilder();
                require('../../await').promise = exports.createAwaitBuilder();
            },
            shutdown: function () {
                delete require('../../async').promise;
                delete require('../../await').promise;
                base.shutdown();
            }
        });
    },
    defaultOptions: {}
};


/** Provides an async builder for producing suspendable functions that return promises. */
exports.createAsyncBuilder = function () {
    return asyncBuilder.mod({
        /** Used for diagnostic purposes. */
        name: 'promise',
        /** Used only for automatic type interence at TypeScript compile time. */
        type: null,
        /** Provides appropriate handling for promise-returning suspendable functions. */
        overrideProtocol: function (base, options) {
            return ({
                /** Sets up a promise resolver and synchronously returns a promise. */
                begin: function (fi) {
                    var resolver = fi.context = Promise.defer();
                    fi.resume();
                    return resolver.promise;
                },
                /** Calls the promise's progress() handler whenever the function yields, then continues execution. */
                suspend: function (fi, error, value) {
                    if (error)
                        throw error;
                    fi.context.progress(value); // NB: fiber does NOT yield here, it continues
                },
                /** Resolves or rejects the promise, depending on whether the function returned or threw. */
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

//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
exports.createAwaitBuilder = function () {
    return awaitBuilder.mod({
        name: 'promise',
        type: null,
        overrideHandlers: function (base, options) {
            return ({
                singular: function (fi, arg) {
                    if (!_.isPromise(arg))
                        return _.notHandled;
                    arg.then(function (val) {
                        return fi.resume(null, val);
                    }, fi.resume);
                },
                variadic: function (fi, args) {
                    if (!_.isPromise(args[0]))
                        return _.notHandled;
                    args[0].then(function (val) {
                        return fi.resume(null, val);
                    }, fi.resume);
                },
                elements: function (values, result) {
                    // TODO: temp testing...
                    var k = 0;
                    values.forEach(function (value, i) {
                        if (_.isPromise(value)) {
                            value.then(function (val) {
                                return result(null, val, i);
                            }, function (err) {
                                return result(err, null, i);
                            });
                            ++k;
                        }
                    });
                    return k;
                }
            });
        }
    });
};
//# sourceMappingURL=promises.js.map

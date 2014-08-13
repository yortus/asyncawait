var assert = require('assert');
var _ = require('./util');
var internalState = require('./config/internalState');
var Protocol = require('./protocol');


// Bootstrap a basic await builder using a no-op handler.
//TODO: need to work out appropriate 'base' functioanlity/behaviour here...
var awaitBuilder = createAwaitBuilder({
    override: function (base, options) {
        return ({
            singular: function (fi, arg) {
                return fi.resume(null, arg);
            },
            variadic: function (fi, args) {
                return fi.resume(null, args[0]);
            }
        });
    },
    defaults: _.branch(internalState.options)
});

/** Creates a new await builder function using the specified handler settings. */
//function createAwaitBuilder<TBuilder extends Builder>(handlersFactory: (baseHandlers: AwaitProtocol, options: {}) => AsyncAwait.Await.AwaitProtocolOverrides, options: {}, baseHandlers: AwaitProtocol) {
function createAwaitBuilder(currentMod, previousProtocol_) {
    var previousProtocol = previousProtocol_ || new Protocol({}, _.empty);
    var currentProtocol = previousProtocol.mod(currentMod);

    // Instantiate the handlers by calling the provided factory function.
    var handlers = currentProtocol.members;

    // Create the builder function.
    var builder = function await(arg) {
        //TODO: can this be optimised more, eg like async builder's eval?
        // Ensure this function is executing inside a fiber.
        var fi = _.currentFiber();
        assert(fi, 'await: may only be called inside a suspendable function');

        // TODO: temp testing... fast/slow paths
        if (arguments.length === 1) {
            // TODO: singular case...
            if (!Array.isArray(arg)) {
                var handlerResult = handlers.singular(fi, arg);
            } else {
                //TODO: resultCallback should be defined in handlers...
                var numberResolved = 0, tgt = new Array(arg.length);
                var resultCallback = function (err, value, index) {
                    if (err) {
                        throw err;
                    }

                    tgt[index] = value;
                    if (++numberResolved === numberHandled) {
                        // TODO: fill remaining 'holes' in tgt, if any
                        if (numberHandled < arg.length) {
                            for (var i = 0, len = arg.length; i < len; ++i) {
                                if (!(i in tgt))
                                    tgt[i] = arg[i];
                            }
                        }

                        // TODO: restore fi state for next await
                        fi.awaiting = [];

                        // And finally we're done
                        fi.resume(null, tgt);
                    }
                };
                if (arg.length > 0) {
                    var numberHandled = handlers.elements(arg, resultCallback);

                    // TODO: this is a copy/paste from above AND below...
                    // TODO: fill remaining 'holes' in tgt, if any
                    if (numberHandled < arg.length) {
                        for (i = 0, len = arg.length; i < len; ++i) {
                            if (!(i in tgt))
                                tgt[i] = arg[i];
                        }
                        if (numberHandled === 0) {
                            //TODO: special case: empty array...
                            //TODO: need setImmediate?
                            setImmediate(function () {
                                fi.awaiting = [];
                                fi.resume(null, tgt);
                            });
                        }
                    }
                } else {
                    //TODO: special case: empty array...
                    //TODO: need setImmediate?
                    setImmediate(function () {
                        fi.awaiting = [];
                        fi.resume(null, tgt);
                    });
                }
            }
        } else {
            // Create a new array to hold the passed-in arguments.
            var len = arguments.length, allArgs = new Array(len);
            for (var i = 0; i < len; ++i)
                allArgs[i] = arguments[i];

            // Delegate to the specified handler to appropriately await the pass-in value(s).
            var handlerResult = handlers.variadic(fi, allArgs);
        }

        // Ensure the passed-in value(s) were handled.
        //TODO: ...or just pass back value unchanged (i.e. await.value(...) is the built-in fallback.
        assert(handlerResult !== _.notHandled, 'await: the passed-in value(s) are not recognised as being awaitable.');

        // Suspend the fiber until the await handler causes it to be resumed. NB: fi.suspend is bypassed here because:
        // 1. its custom handling is not appropriate for await, which always wants to simply suspend the fiber; and
        // 2. its custom handling is simplified by not needing to special-case calls from awaitBuilder.
        return _.yieldCurrentFiber();
    };

    // Tack on the handlers and options properties, and the mod() method.
    //TODO: ...
    builder.name = null; //TODO:... implement, add all tests, use in error messages
    builder.mod = function (mod) {
        return createAwaitBuilder(mod, currentProtocol);
    };
    builder.handlers = handlers;

    // Return the await builder function.
    return builder;
}
module.exports = awaitBuilder;
//# sourceMappingURL=awaitBuilder.js.map

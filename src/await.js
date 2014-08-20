var assert = require('assert');
var options = require('./options');
var Protocol = require('./protocol');
var _ = require('./util');

//TODO: ============================================================================================= ASYNC
// function awaitAPI() - proxying function
// var _variants
// side-effect: initialise 'root' variant
// interface Variant  - holds: mod, protocol, impl
// function createVariant(mod) => variant
// function createImpl(protocol)
// function registerVariant(variant, expose?)
exports.api = function () {
    // Collect all arguments into an array.
    var len = arguments.length, args = new Array(len);
    for (var i = 0; i < len; ++i)
        args[i] = arguments[i];

    // Find the appropriate implementation to delegate to.
    //TODO: ...
    var name = options().defaults.await || '';
    var await = _variants[name].impl;

    // Delegate to the implementation.
    return await.apply(this, args);
};

//TODO: we don't really want this here. Should be in callbacks mod...
exports.api.continuation = _.createContinuation;

// TODO:...
function createVariant(mod) {
    // Get the appropriate base variant.
    var base = mod.base || '';
    var baseVariant = _variants[base];
    assert(baseVariant, "use: await mod '" + mod.name + "' refers to unknown base mod '" + mod.base + "'");

    // Apply the mod to get a new protocol.
    var moddedProtocol = baseVariant.protocol.mod(mod);
    var moddedImpl = createImpl(moddedProtocol);

    // Create and return the new variant.
    var moddedVariant = { mod: mod, protocol: moddedProtocol, impl: moddedImpl };

    //return moddedVariant;
    // TODO: register it???
    registerVariant(moddedVariant);
}
exports.createVariant = createVariant;

//TODO:...
function getProtocolFor(name) {
    return _variants[name].protocol;
}
exports.getProtocolFor = getProtocolFor;

// TODO:...
var _variants = {};

// TODO:...
_variants[''] = (function () {
    var protocol = new Protocol(options(), function () {
        return ({
            singular: function (fi, arg) {
                return _.notHandled;
            },
            variadic: function (fi, args) {
                return _.notHandled;
            },
            elements: function () {
                return _.notHandled;
            }
        });
    });
    return { mod: null, protocol: protocol, impl: createImpl(protocol) };
})();


// TODO:...
function createImpl(protocol) {
    var handlers = protocol.members;

    return function awaitImpl(arg) {
        //TODO: can this be optimised more, eg like async builder's eval?
        // Ensure this function is executing inside a fiber.
        var fi = _.currentFiber();
        assert(fi, 'await: may only be called inside a suspendable function');

        // TODO: temp testing... fast/slow paths
        if (arguments.length === 1) {
            // TODO: single argument case...
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
}

// TODO:...
function registerVariant(variant, expose) {
    if (typeof expose === "undefined") { expose = true; }
    var name = variant.mod.name;

    //TODO: ensure name is valid - use regex? id[.id...]
    assert(!_variants[name], "use: duplicate await variant '" + name + "'");
    _variants[name] = variant;

    if (expose) {
        var nameParts = name.split('.').slice(1);
        var hostObj = exports.api;
        while (true) {
            var namePart = nameParts.shift();

            //TODO: ensure namePart is a valid JS identifier and is not (yet) an own property of host
            if (nameParts.length === 0) {
                hostObj[namePart] = variant.impl;
                break;
            }
            hostObj = hostObj[namePart] || (hostObj[namePart] = {});
        }
    }
}
//# sourceMappingURL=await.js.map

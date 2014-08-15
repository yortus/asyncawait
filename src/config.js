var assert = require('assert');
var _ = require('./util');
var Protocol = require('./protocol');
var createSuspendableFunction = require('./___OLD___async/createSuspendableFunction');
var jointProtocol = require('./jointProtocol');

// TODO:...
function options(value) {
    //TODO: as getter...
    if (arguments.length === 0)
        return _options;

    //TODO: as setter...
    _.mergeProps(_options, value);
    // 1. merge
    // 2. reload all joint/async/await mods
}
exports.options = options;

// TODO:...
function use(mod) {
    switch (mod.type) {
        case 'async':
            var v = createAsyncVariant(mod);
            registerAsyncVariant(v);
            break;
        case 'await':
            break;
        case 'fiber':
            break;
        default:
            throw new Error('');
    }
}
exports.use = use;

// TODO:...
function restoreDefaults() {
}
exports.restoreDefaults = restoreDefaults;

//TODO: ============================================================================================= ASYNC
exports.asyncAPI = function () {
    // Collect all arguments into an array.
    var len = arguments.length, args = new Array(len);
    for (var i = 0; i < len; ++i)
        args[i] = arguments[i];

    // Find the appropriate implementation to delegate to.
    //TODO: ...
    var name = exports.options().defaults.async || '';
    var async = _asyncVariants[name].impl;

    // Delegate to the implementation.
    return async.apply(this, args);
};

// TODO:...
var _options = {};
var _asyncVariants = {};

// TODO:...
_asyncVariants[''] = (function () {
    var protocol = new Protocol(_.branch(exports.options()), function () {
        return ({
            begin: function (fi) {
                throw new Error('begin: not implemented. All async mods must override this method.');
            },
            suspend: function (fi, error, value) {
                throw new Error('suspend: not supported by this type of suspendable function');
            },
            resume: function (fi, error, value) {
                return error ? fi.throwInto(error) : fi.run(value);
            },
            end: function (fi, error, value) {
                throw new Error('end: not implemented. All async mods must override this method.');
            }
        });
    });
    return { mod: null, protocol: protocol, impl: createAsyncImpl(protocol) };
})();


// TODO:...
function createAsyncVariant(mod) {
    // Get the appropriate base variant.
    var baseVariant = _asyncVariants[mod.base || ''];
    assert(baseVariant, "use: async mod '" + mod.name + "' refers to unknown base mod '" + mod.base + "'");

    // Apply the mod to get a new protocol.
    var moddedProtocol = baseVariant.protocol.mod(mod);
    var moddedImpl = createAsyncImpl(moddedProtocol);

    // Create and return the new variant.
    var moddedVariant = { mod: mod, protocol: moddedProtocol, impl: moddedImpl };
    return moddedVariant;
}

// TODO:...
function registerAsyncVariant(variant, expose) {
    if (typeof expose === "undefined") { expose = true; }
    var name = variant.mod.name;

    //TODO: ensure name is valid - use regex? id[.id...]
    assert(!_asyncVariants[name], "use: duplicate async variant '" + name + "'");
    _asyncVariants[name] = variant;

    if (expose) {
        var nameParts = name.split('.');
        var hostObj = exports.asyncAPI;
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

// TODO:...
function createAsyncImpl(protocol) {
    return function asyncImpl(invokee) {
        assert(arguments.length === 1, 'async: expected a single argument');
        assert(_.isFunction(invokee), 'async: expected argument to be a function');
        return createSuspendableFunction(protocol.members, invokee);
    };
}

//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(_options, function () {
    return ({});
}).mod(baseFiberMod);
_.mergeProps(jointProtocol, _fiberProtocol.members); //TODO:...
//# sourceMappingURL=config.js.map

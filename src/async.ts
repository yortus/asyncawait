import references = require('references');
import assert = require('assert');
import options = require('./options');
import Protocol = require('./protocol');
import _ = require('./util');
import createSuspendableFunction = require('./createSuspendableFunction');//TODO:...
import Mod = AsyncAwait.Mod;





//TODO: ============================================================================================= ASYNC
// function asyncAPI() - proxying function
// var _asyncVariants
// side-effect: initialise 'root' variant
// interface Variant  - holds: mod, protocol, asyncImplFunc
// function createAsyncVariant(mod) => variant
// function createAsyncImpl(protocol)
// function registerAsyncVariant(variant, expose?)

export var api: AsyncAwait.AsyncAPI = <any> function () {

    // Collect all arguments into an array.
    var len = arguments.length, args = new Array(len);
    for (var i = 0; i < len; ++i) args[i] = arguments[i];

    // Find the appropriate implementation to delegate to.
    //TODO: ...

    var name = options().defaults.async || '';
    var async = _variants[name].impl;

    // Delegate to the implementation.
    return async.apply(this, args);
};


// TODO:...
export function createVariant(mod: Mod<any>) {

    // Get the appropriate base variant.
    var base = mod.base.split('.').slice(1).join('.');
    var baseVariant = _variants[base];
    assert(baseVariant, "use: async mod '" + mod.name + "' refers to unknown base mod '" + mod.base + "'");

    // Apply the mod to get a new protocol.
    var moddedProtocol = baseVariant.protocol.mod(mod);
    var moddedImpl = createAsyncImpl(moddedProtocol);

    // Create and return the new variant.
    var moddedVariant = { mod: mod, protocol: moddedProtocol, impl: moddedImpl };
    //return moddedVariant;

    // TODO: register it???
    registerVariant(moddedVariant);
}


// TODO:...
var _variants: { [name: string]: Variant } = {};


// TODO:...
_variants[''] = (() => {
    var protocol = new Protocol(_.branch(options()), () => ({
        begin: (fi) => { throw new Error('begin: not implemented. All async mods must override this method.'); },
        suspend: (fi, error?, value?) => { throw new Error('suspend: not supported by this type of suspendable function'); },
        resume: (fi, error?, value?) => { return error ? fi.throwInto(error) : fi.run(value); },
        end: (fi, error?, value?) => { throw new Error('end: not implemented. All async mods must override this method.'); }
    }));
    return { mod: null, protocol: protocol, impl: createAsyncImpl(protocol) };
})();


// TODO:...
interface Variant {
    mod: Mod<any>;
    protocol: Protocol<any, any>;
    impl: Function;
}


// TODO:...
function createAsyncImpl(protocol: Protocol<any, any>) {
    return function asyncImpl(invokee: Function) {
        assert(arguments.length === 1, 'async: expected a single argument');
        assert(_.isFunction(invokee), 'async: expected argument to be a function');
        return createSuspendableFunction(protocol.members, invokee);
    }    
}


// TODO:...
function registerVariant(variant: Variant, expose = true) {
    var name = variant.mod.name;
    //TODO: ensure name is valid - use regex? id[.id...]
    assert(!_variants[name], "use: duplicate async variant '" + name + "'");
    _variants[name] = variant;

    if (expose) {
        var nameParts = name.split('.');
        var hostObj = api;
        while (true) {
            var namePart = nameParts.shift();
            //TODO: ensure namePart is a valid JS identifier and is not (yet) an own property of host
            if (nameParts.length === 0) { hostObj[namePart] = variant.impl; break; }
            hostObj = hostObj[namePart] || (hostObj[namePart] = {});
        }
    }
}

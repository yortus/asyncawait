import references = require('references');
import assert = require('assert');
import _ = require('./util');
import Protocol = require('./protocol');
import createSuspendableFunction = require('./___OLD___async/createSuspendableFunction');//TODO:...
import jointProtocol = require('./jointProtocol');//TODO:...
import ConfigAPI = AsyncAwait2.ConfigAPI;
import Mod = AsyncAwait2.Mod;


// TODO:...
export function options(value?: any): any {

    //TODO: as getter...
    if (arguments.length === 0) return _options;

    //TODO: as setter...
    _.mergeProps(_options, value);
    // 1. merge
    // 2. reload all joint/async/await mods
}


// TODO:...
export function use(mod: Mod): any {

    // TODO: validate mod...

    // TODO: Handle mod...
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
            throw new Error('');//TODO:...
    }
}


// TODO:...
export function restoreDefaults() {
    
}


//TODO: ============================================================================================= ASYNC


export var asyncAPI: AsyncAwait2.AsyncAPI = <any> function () {

    // Collect all arguments into an array.
    var len = arguments.length, args = new Array(len);
    for (var i = 0; i < len; ++i) args[i] = arguments[i];

    // Find the appropriate implementation to delegate to.
    //TODO: ...

    var name = options().defaults.async || '';
    var async = _asyncVariants[name].impl;

    // Delegate to the implementation.
    return async.apply(this, args);
};


// TODO:...
var _options = {};
var _asyncVariants: { [name: string]: Variant } = {};


// TODO:...
_asyncVariants[''] = (() => {
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
    mod: Mod;
    protocol: Protocol<any, any>;
    impl: Function;
}


// TODO:...
function createAsyncVariant(mod: Mod) {

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
function registerAsyncVariant(variant: Variant, expose = true) {
    var name = variant.mod.name;
    //TODO: ensure name is valid - use regex? id[.id...]
    assert(!_asyncVariants[name], "use: duplicate async variant '" + name + "'");
    _asyncVariants[name] = variant;

    if (expose) {
        var nameParts = name.split('.');
        var hostObj = asyncAPI;
        while (true) {
            var namePart = nameParts.shift();
            //TODO: ensure namePart is a valid JS identifier and is not (yet) an own property of host
            if (nameParts.length === 0) { hostObj[namePart] = variant.impl; break; }
            hostObj = hostObj[namePart] || (hostObj[namePart] = {});
        }
    }
}


// TODO:...
function createAsyncImpl(protocol: Protocol<any, any>) {
    return function asyncImpl(invokee: Function) {
        assert(arguments.length === 1, 'async: expected a single argument');
        assert(_.isFunction(invokee), 'async: expected argument to be a function');
        return createSuspendableFunction(protocol.members, invokee);
    }    
}



//TODO: ============================================================================================= FIBER
var baseFiberMod = require('./mods/baseline').mod;
var _fiberProtocol = new Protocol(_options, () => ({})).mod(baseFiberMod);
_.mergeProps(jointProtocol, _fiberProtocol.members);//TODO:...

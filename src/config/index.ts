import references = require('references');
import assert = require('assert');
import internalState = require('./internalState');
import jointProtocol = require('../jointProtocol');
import Protocol = require('../protocol');
import _ = require('../util');
import Mod = AsyncAwait.Mod;


//TODO: temp testing...
var protocol: Protocol<any, any> = null;


/** Gets or sets global configuration values. */
export function options(value?: any) {

    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0) return internalState.options;

    // If called as a setter, delegate to use().
    useInternal(value);
}

export function use(mod: Mod) {

    // Validate argument
    assert(arguments.length === 1, 'use: expected a single argument');
    assert(mod.override, "use: expected mod to have an 'override' property");
    //TODO: restore this somehow...
    //assert(internalState.mods.indexOf(mod) === -1, 'use: mod already registered');

    // Delegate to private implementation.
    return useInternal(mod);
}


//TODO: bring this in line with async's createModMethod
/** Registers the specified mod and adds its default options to current config. */
function useInternal(mod: Mod) {

    // Reset everything.
    //TODO: was... resetAll();
    if (jointProtocol.shutdown) jointProtocol.shutdown();

    protocol = protocol.mod(mod);
    _.mergeProps(internalState.options, protocol.options);
    _.mergeProps(jointProtocol, protocol.members);

    //TODO: startup...
    if (jointProtocol.startup) jointProtocol.startup();
}


//TODO: ...
export function useDefaults() {

    //TODO: ...
    resetAll();

    // TODO: apply the default mods.
    var defaultMods = internalState.options.defaults.mods;
    defaultMods.forEach(mod => use(mod));
}


//TODO: doc...
/** Resets ... */
function resetAll() {

    // Reset and restore the joint protocol to its default state.
    if (jointProtocol.shutdown) jointProtocol.shutdown();
    _.mergeProps(jointProtocol, {
        acquireFiber: null,
        releaseFiber: null,
        setFiberTarget: null,
        startup: null,
        shutdown: null
    });

    // Clear all options, except anything in the the 'defaults' key.
    var defaults = internalState.options.defaults;
    internalState.options = { defaults: defaults };
    protocol = new Protocol(internalState.options, () => ({
        //startup: _.empty,
        //shutdown: _.empty
    }));
}


//TODO: temp testing...
// TODO: define these in a separate file. Perhaps as part of joint protocol?
var asyncBuilder = require('../asyncBuilder');
var promiseMod = require('../mods/async/promise');
internalState.options.defaults = {
    mods: [
        require('../mods/baseline').mod, //TODO: treat this differently (builtin), then also dont need startup/shutdown guards
        require('../mods/fibersHotfix169').mod,
        require('../mods/fiberPool').mod,
        require('../mods/maxSlots').mod,
        require('../mods/cpsKeyword').mod,
        require('../mods/promises').mod,
        require('../mods/callbacks').mod,
        require('../mods/thunks').mod,
        require('../mods/streams').mod,
        require('../mods/express').mod
    ],
    async: asyncBuilder.mod(promiseMod),
    await: null
};


useDefaults();

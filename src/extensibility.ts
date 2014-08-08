import references = require('references');
import assert = require('assert');
import jointProtocol = require('./jointProtocol');
import defaultProtocol = require('./jointProtocolDefault');
import _ = require('./util');
import Mod = AsyncAwait.Mod;


//TODO: default options SHOULD NOT override pre-existing options with same keys
//TODO: if isOptionsOnly, then this SHOULD override any existing options


/** Gets or sets global configuration values. */
export function options(value?: any) {

    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0) return _options;

    // If called as a setter, delegate to use().
    use(value);
}


//TODO: bring this in line with async's createModMethod
/** Registers the specified mod and adds its default options to current config. */
export function use(mod: Mod) {

    //TODO: appropriate if isOptionsOnly? Do this in inner loop?
    // Prevent simple duplicate registrations.
    assert(_mods.indexOf(mod) === -1, 'use: mod already registered');

    // Retain a reference to the current mod list.
    var allMods = _mods;

    // Reset everything.
    resetAll();

    // Restore the retained mod list, adding the new mod to it.
    _mods = allMods;
    _mods.push(mod);

    // Accumulate all config/options changes.
    _mods.forEach(mod => {
        var isOptionsOnly = !mod.overrideProtocol;
        var propsToMerge = isOptionsOnly ? mod : _.mergeProps({}, mod.defaultOptions, _options);
        _.mergeProps(_options, propsToMerge);
    });

    // Form the new protocol stack
    _mods.forEach(mod => {
        var protocolBeforeMod = _.mergeProps({}, jointProtocol);
        var protocolOverrides = (mod.overrideProtocol || <any> _.empty)(protocolBeforeMod, _options);
        _.mergeProps(jointProtocol, protocolOverrides);
    });

    //TODO: startup...
    jointProtocol.startup();
}


//TODO: ...
export function useDefaults() {

    //TODO: ...
    resetAll();


    // TODO: apply the default mods.
    // TODO: define this list in a separate file. Perhaps as part of joint protocol?
    var defaultMods = [
        require('./mods/fibersHotfix169'),
        require('./mods/fiberPool'),
        require('./mods/maxSlots'),
        require('./mods/cpsKeyword'),
        require('./mods/promises')
    ];
    defaultMods.forEach(use);
}


//TODO: doc...
/** Resets ... */
function resetAll() {

    // Reset and restore the joint protocol to its default state.
    if (jointProtocol.shutdown) jointProtocol.shutdown();
    _.mergeProps(jointProtocol, defaultProtocol);

    // Clear all external mod registrations.
    _mods = [];

    // Restore options to its initial state.
    _options = {};
}

/** References the global options hash. */
var _options = {};


/** Holds the list of registered mods, in order of registration. */
var _mods: Mod[] = [];


// TODO: and... break cycle...
setImmediate(useDefaults);

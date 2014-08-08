var assert = require('assert');
var jointProtocol = require('./jointProtocol');
var _ = require('./util');

//TODO: default options SHOULD NOT override pre-existing options with same keys
//TODO: if isOptionsOnly, then this SHOULD override any existing options
/** Gets or sets global configuration values. */
function options(value) {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    // If called as a setter, delegate to use().
    useInternal(value);
}
exports.options = options;

function use(mod) {
    // Validate argument
    assert(arguments.length === 1, 'use: expected a single argument');
    assert(mod.overrideProtocol, "use: expected mod to have a 'overrideProtocol' property");
    assert(_mods.indexOf(mod) === -1, 'use: mod already registered');

    // Delegate to private implementation.
    return useInternal(mod);
}
exports.use = use;

//TODO: bring this in line with async's createModMethod
/** Registers the specified mod and adds its default options to current config. */
function useInternal(mod) {
    // Retain a reference to the current mod list.
    var allMods = _mods;

    // Reset everything.
    resetAll();

    // Restore the retained mod list, adding the new mod to it.
    _mods = allMods;
    _mods.push(mod);

    // Accumulate all config/options changes.
    _mods.forEach(function (mod) {
        var isOptionsOnly = !mod.overrideProtocol;
        var propsToMerge = isOptionsOnly ? mod : _.mergeProps({}, mod.defaultOptions, _options);
        _.mergeProps(_options, propsToMerge);
    });

    // Form the new protocol stack
    _mods.forEach(function (mod) {
        var protocolBeforeMod = _.mergeProps({}, jointProtocol);
        var protocolOverrides = (mod.overrideProtocol || _.empty)(protocolBeforeMod, _options);
        _.mergeProps(jointProtocol, protocolOverrides);
    });

    //TODO: startup...
    jointProtocol.startup();
}

//TODO: ...
function useDefaults() {
    //TODO: ...
    resetAll();

    // TODO: apply the default mods.
    // TODO: define this list in a separate file. Perhaps as part of joint protocol?
    var defaultMods = [
        require('./mods/baseline').mod,
        require('./mods/fibersHotfix169').mod,
        require('./mods/fiberPool').mod,
        require('./mods/maxSlots').mod,
        require('./mods/cpsKeyword').mod,
        require('./mods/promises').mod
    ];
    defaultMods.forEach(function (mod) {
        return exports.use(mod);
    });
}
exports.useDefaults = useDefaults;

//TODO: doc...
/** Resets ... */
function resetAll() {
    // Reset and restore the joint protocol to its default state.
    if (jointProtocol.shutdown)
        jointProtocol.shutdown();
    _.mergeProps(jointProtocol, {
        acquireFiber: null,
        releaseFiber: null,
        setFiberTarget: null,
        startup: null,
        shutdown: null
    });

    // Clear all external mod registrations.
    _mods = [];

    // Restore options to its initial state.
    _options = {};
}

/** References the global options hash. */
var _options = {};

/** Holds the list of registered mods, in order of registration. */
var _mods = [];
//# sourceMappingURL=extensibility.js.map

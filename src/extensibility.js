var assert = require('assert');
var jointProtocol = require('./jointProtocol');
var defaultProtocol = require('./jointProtocolDefault');
var _ = require('./util');

//TODO: default options SHOULD NOT override pre-existing options with same keys
//TODO: if isOptionsOnly, then this SHOULD override any existing options
//TODO: doc...
/** Resets ... */
function resetAll() {
    // Reset and restore the joint protocol to its default state.
    if (jointProtocol.shutdown)
        jointProtocol.shutdown();
    _.mergeProps(jointProtocol, defaultProtocol);

    // Clear all external mod registrations.
    _mods = [];

    // Restore options to its initial state.
    _options = {};
}

/** Gets or sets global configuration values. */
exports.config = function config(value) {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    //// Create a pseudo-mod that has the given config values as its default options.
    //var mod: Mod = { defaultOptions: value };
    //// Apply the pseudo-mod.
    //use(mod);
    //TODO: delegate to use()
    exports.use(value);
};

//TODO: bring this in line with async's createModMethod
/** Registers the specified mod and adds its default options to current config. */
function use(mod) {
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
exports.use = use;

//TODO: rename to use()? Remove?
exports.config.mod = exports.use;

/** References the global options hash. */
var _options = {};

/** Holds the list of registered mods, in order of registration. */
var _mods = [];

//TODO: ...
function restoreDefaults() {
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
    defaultMods.forEach(exports.use);
}
exports.restoreDefaults = restoreDefaults;
exports.restoreDefaults();
//# sourceMappingURL=extensibility.js.map

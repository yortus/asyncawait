var assert = require('assert');
var jointProtocol = require('./jointProtocol');
var defaultProtocol = require('./jointProtocolDefault');
var _ = require('./util');

//TODO: doc...
/** Resets ... */
function resetAll() {
    for (var i = _mods.length - 1; i >= 0; --i) {
        var mod = _mods[i];
        if (mod.reset)
            mod.reset();
    }

    // Clear all external mod registrations.
    _mods = [];

    // Restore options to its initial state.
    _options = {};

    // Restore the default jointProtocol.
    _.mergeProps(jointProtocol, defaultProtocol);
}

/** Gets or sets global configuration values. */
exports.config = function config(value) {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    // Create a pseudo-mod that has the given config values as its default options.
    var mod = { defaultOptions: value };

    // Apply the pseudo-mod.
    exports.use(mod);
};

/** Registers the specified mod and adds its default options to current config. */
function use(mod) {
    // Prevent duplicate registration.
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
        return _.mergeProps(_options, mod.defaultOptions);
    });

    // Apply all mods and their protocols.
    _mods.forEach(function (mod) {
        var protocolBeforeMod = _.mergeProps({}, jointProtocol);
        var protocolOverrides = (mod.overrideProtocol || _.empty)(protocolBeforeMod, _options);
        _.mergeProps(jointProtocol, protocolOverrides);
        if (mod.apply)
            mod.apply(_options);
    });
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

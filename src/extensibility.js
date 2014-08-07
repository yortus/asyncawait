var assert = require('assert');
var _ = require('./util');
var jointProtocol = require('./jointProtocol');

/** Get or set global configuration values. */
exports.config = function config() {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    // Reject operation if this subsystem is now locked.
    //assert(!isLocked, 'config: cannot alter config after first async(...) call');
    // Merge the given value's own properties into the options object.
    _.mergeProps(_options, arguments[0]);

    //TODO: temp testing...
    // Re-apply all mods
    exports.resetMods();
    exports.applyMods();
};

//TODO: rename to use()?
/** Register the specified mod and add its default options to current config. */
exports.config.mod = function use(mod) {
    // Reject operation if this subsystem is now locked.
    //assert(!isLocked, 'use: cannot register mods after first async(...) call');
    // Ensure mods are registered only once.
    assert(exports.externalMods.indexOf(mod) === -1, 'use: mod already registered');

    // Add the mod to the list.
    exports.externalMods.push(mod);

    //TODO: temp testing...
    applyMod(mod);

    // Incorporate the mod's default options, if any.
    _.mergeProps(_options, mod.defaultOptions);
};

/** Apply all registered mods and lock the subsystem against further changes. */
function applyMods() {
    // Reject operation if this subsystem is now locked.
    //assert(!isLocked, 'applyMods: mods already applied');
    // Create a combined mod list in the appropriate order.
    var allMods = exports.internalMods.concat(exports.externalMods);

    // Restore the joint protocol to its default state.
    jointProtocol.restoreDefaults();

    // Apply all mods in order of registration. This ensures that mods
    // registered latest appear outermost in joint protocol call chains, which is the
    // design intention.
    allMods.forEach(applyMod);
    // Lock the subsystem against further changes.
    //isLocked = true;
}
exports.applyMods = applyMods;

//TODO: temp testing...
function applyMod(mod) {
    var protocolBeforeMod = _.mergeProps({}, jointProtocol);
    var protocolOverrides = (mod.overrideProtocol || _.empty)(protocolBeforeMod, _options);
    _.mergeProps(jointProtocol, protocolOverrides);
    if (mod.apply)
        mod.apply(_options);
}

/**
*  Reset all registered mods and return the subsystem to an unlocked state. This
*  method is primarily used for unit testing of mods and the extensibility system.
*/
function resetMods() {
    // Call each registered mod's reset() function, if present.
    var allMods = exports.internalMods.concat(exports.externalMods);
    allMods.forEach(function (mod) {
        if (mod.reset)
            mod.reset();
    });

    // Clear all external mod registrations.
    exports.externalMods = [];

    // Restore options to its initial state.
    _options = {};
    exports.internalMods.forEach(function (mod) {
        return _.mergeProps(_options, mod.defaultOptions);
    });

    //TODO: temp testing...
    exports.internalMods.forEach(applyMod);

    // Restore the default jointProtocol.
    jointProtocol.restoreDefaults();
    // Unlock the subsystem.
    //isLocked = false;
}
exports.resetMods = resetMods;

/** Built-in mods that are always applied. Order is important. */
exports.internalMods = [
    require('./mods/fibersHotfix169'),
    require('./mods/fiberPool'),
    require('./mods/maxSlots'),
    require('./mods/cpsKeyword'),
    require('./mods/promises')
];

/** Mods that have been explicitly registered via use(...). */
exports.externalMods = [];

///**
// *  This flag is set to true when all mods have been applied. Once it is set
// *  subsequent mod/config changes are not allowed. Calling reset() sets this
// *  flag back to false.
// */
//export var isLocked = false;
/** Global options hash accessed by the config() getter/getter function. */
//TODO: make this GLOBAL to prevent errors where process has multiple asyncawaits loaded
//TODO: then, pass options to both apply and reset, and have mods put ALL their state in there?
var _options = {};
exports.internalMods.forEach(function (mod) {
    return _.mergeProps(_options, mod.defaultOptions);
});

//TODO: temp testing...
exports.internalMods.forEach(applyMod);
//# sourceMappingURL=extensibility.js.map

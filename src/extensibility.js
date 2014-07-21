var assert = require('assert');
var _ = require('./util');
var pipeline = require('./pipeline');
var fiberPoolFix = require('./mods/fiberPoolFix');
var coroPool = require('./mods/coroPool');
var cpsKeyword = require('./mods/cpsKeyword');
var maxSlots = require('./mods/maxSlots');

/** Get or set global configuration values. */
exports.config = function config() {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    // Reject operation if this subsystem is now locked.
    assert(!exports.isLocked, 'config: cannot alter config after first async(...) call');

    // Merge the given value's own properties into the options object.
    _.mergeProps(_options, arguments[0]);
};

/** Register the specified mod and add its default options to current config. */
exports.config.mod = function use(mod) {
    // Reject operation if this subsystem is now locked.
    assert(!exports.isLocked, 'use: cannot register mods after first async(...) call');

    // Ensure mods are registered only once.
    assert(exports.externalMods.indexOf(mod) === -1, 'use: mod already registered');

    // Add the mod to the list.
    exports.externalMods.push(mod);

    // Incorporate the mod's default options, if any.
    _.mergeProps(_options, mod.defaultOptions);
};

/** Apply all registered mods and lock the subsystem against further changes. */
function applyMods() {
    // Reject operation if this subsystem is now locked.
    assert(!exports.isLocked, 'applyMods: mods already applied');

    // Create a combined mod list in the appropriate order.
    var allMods = exports.externalMods.concat(exports.internalMods);

    // Restore the pipeline to its default state.
    pipeline.restoreDefaults();

    for (var i = allMods.length - 1; i >= 0; --i) {
        var mod = allMods[i];
        var pipelineBeforeMod = _.mergeProps({}, pipeline);
        var pipelineOverrides = (mod.overridePipeline || _.empty)(pipelineBeforeMod, _options);
        _.mergeProps(pipeline, pipelineOverrides);
        if (mod.apply)
            mod.apply(_options);
    }

    // Lock the subsystem against further changes.
    exports.isLocked = true;
}
exports.applyMods = applyMods;

/**
*  Reset all registered mods and return the subsystem to an unlocked state. This
*  method is primarily used for unit testing of mods and the extensibility system.
*/
function resetMods() {
    // Call each registered mod's reset() function, if present.
    var allMods = exports.externalMods.concat(exports.internalMods);
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

    // Restore the default pipeline.
    pipeline.restoreDefaults();

    // Unlock the subsystem.
    exports.isLocked = false;
}
exports.resetMods = resetMods;

/** Built-in mods that are always applied. Order is important. */
exports.internalMods = [cpsKeyword, maxSlots, coroPool, fiberPoolFix];

/** Mods that have been explicitly registered via use(...). */
exports.externalMods = [];

/**
*  This flag is set to true when all mods have been applied. Once it is set
*  subsequent mod/config changes are not allowed. Calling reset() sets this
*  flag back to false.
*/
exports.isLocked = false;

/** Global options hash accessed by the config() getter/getter function. */
//TODO: make this GLOBAL to prevent errors where process has multiple asyncawaits loaded
//TODO: then, pass options to both apply and reset, and have mods put ALL their state in there?
var _options = {};
exports.internalMods.forEach(function (mod) {
    return _.mergeProps(_options, mod.defaultOptions);
});
//# sourceMappingURL=extensibility.js.map

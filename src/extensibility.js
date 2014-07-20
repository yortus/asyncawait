var assert = require('assert');
var _ = require('./util');
var pipeline = require('./pipeline');
var fiberPoolFix = require('./mods/fiberPoolFix');
var coroPool = require('./mods/coroPool');
var cpsKeyword = require('./mods/cpsKeyword');
var maxSlots = require('./mods/maxSlots');

// TODO: doc...
var _options = {
    fiberPoolFix: false,
    coroPool: true,
    cpsKeyword: null,
    maxSlots: null
};
var _mods = [];
var _isLocked = false;

/** TODO: doc... */
exports.config = function config() {
    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0)
        return _options;

    // Ensure config(...) setter fails after mods have been applied.
    assert(!_isLocked, 'config: cannot alter config after first async(...) call');

    // Merge the given value's own properties into the options object.
    _.mergeProps(_options, arguments[0]);
};

/** Install the specified mod to alter the global behaviour of asyncawait. */
exports.use = function use(mod) {
    // Ensure use(...) fails after mods have been applied.
    assert(!_isLocked, 'use: cannot alter mods after first async(...) call');

    // TODO: doc...
    _mods.push(mod);
};

//TODO: may need explicit apply() function - eg if mod adds async.xyz, it won't be there until first async call, but may want it immediately
// TODO: doc...
function _applyMods() {
    // If the mods are already applied, return with no further action.
    if (_isLocked)
        return;

    //TODO: add built-ins to mod list as lowest priority
    exports.use(cpsKeyword);
    exports.use(maxSlots);
    exports.use(coroPool);
    exports.use(fiberPoolFix);

    // Restore the methods from the default pipeline.
    pipeline.restoreDefaults();

    // Reconstruct the pipeline to include the new mod. Mods are applied in reverse
    // order of the use() calls that registered them, so that the mods associated with
    // earlier use() calls remain outermost in pipeline call chains.
    var len = _mods.length, applied = [];
    for (var i = len - 1; i >= 0; --i) {
        var mod = _mods[i];

        //TODO:...
        var previous = _.mergeProps({}, pipeline);

        // TODO: Ensure the mod has not already been applied
        if (applied.indexOf(mod) !== -1)
            throw new Error('applyMods: mod cannot be applied multiple times');

        // TODO: execute the mod, and obtain its pipeline overrides, if any.
        var overrides = mod.apply(previous, _options);

        //TODO:...
        _.mergeProps(pipeline, overrides);
        applied.push(mod);
    }

    //TODO: set locked
    _isLocked = true;
}
exports._applyMods = _applyMods;

// TODO: doc...
function _resetMods() {
}
exports._resetMods = _resetMods;
//# sourceMappingURL=extensibility.js.map

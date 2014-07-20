import references = require('references');
import assert = require('assert');
import _ = require('./util');
import pipeline = require('./pipeline');
import fiberPoolFix = require('./mods/fiberPoolFix');
import coroPool = require('./mods/coroPool');
import cpsKeyword = require('./mods/cpsKeyword');
import maxSlots = require('./mods/maxSlots');
import Mod = AsyncAwait.Mod;


//TODO: doc... order is important
var builtinMods = [ cpsKeyword, maxSlots, coroPool, fiberPoolFix ];


// TODO: doc...
var _options = { };
builtinMods.forEach(mod => _.mergeProps(_options, mod.defaults));


//TODO: doc...
var _mods = [];
var _isLocked = false;


/** TODO: doc... */
export var config: AsyncAwait.Config = <any> function config() {

    // If called as a getter, return a reference to the options object.
    if (arguments.length === 0) return _options;

    // Ensure config(...) setter fails after mods have been applied.
    assert(!_isLocked, 'config: cannot alter config after first async(...) call');

    // Merge the given value's own properties into the options object.
    _.mergeProps(_options, arguments[0]);
}


/** Install the specified mod to alter the global behaviour of asyncawait. */
export var use: AsyncAwait.Use = <any> function use(mod: Mod) {

    // Ensure use(...) fails after mods have been applied.
    assert(!_isLocked, 'use: cannot alter mods after first async(...) call');

    // TODO: doc...
    _mods.push(mod);
}


//TODO: may need explicit apply() function - eg if mod adds async.xyz, it won't be there until first async call, but may want it immediately



// TODO: doc...
export function _applyMods() {

    // If the mods are already applied, return with no further action.
    if (_isLocked) return;




    //TODO: add built-ins to mod list as lowest priority
    builtinMods.forEach(use);


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
        if (applied.indexOf(mod) !== -1) throw new Error('applyMods: mod cannot be applied multiple times');

        // TODO: execute the mod, and obtain its pipeline overrides, if any.
        var overrides = mod.apply(previous, _options);

        //TODO:...
        _.mergeProps(pipeline, overrides);
        applied.push(mod);
    }

    //TODO: set locked
    _isLocked = true;
    
}




// TODO: doc...
export function _resetMods() {

    //TODO: check all this... also DRY! and DRY in mods (eg reset == private state init)

    // Call reset() on each mod
    var len = _mods.length;
    for (var i = len - 1; i >= 0; --i) {
        var mod = _mods[i];
        mod.reset();
    }

    // Reset options
    _options = { };
    builtinMods.forEach(mod => _.mergeProps(_options, mod.defaults));

    // Reset mods
    _mods = [];

    // Pipeline will now be reset on next async(...) call
    // TODO: doc technicalities of this - ie pipeline is now 'corrupt' until next async(...) call

    // Unlock
    _isLocked = false;

}



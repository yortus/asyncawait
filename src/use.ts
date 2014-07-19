import references = require('references');
import assert = require('assert');
import _ = require('./util');
import pipeline = require('./pipeline');
import fiberPoolFix = require('./mods/fiberPoolFix');
import coroPool = require('./mods/coroPool');
import cpsKeyword = require('./mods/cpsKeyword');
import maxSlots = require('./mods/maxSlots');
import Mod = AsyncAwait.Mod;
export = use;


/** Install the specified mod to alter the global behaviour of asyncawait. */
var use: AsyncAwait.Use = <any> function use(mod: Mod) {

    // Ensure use(...) fails after the first async(...) call.
    assert(!pipeline.isLocked, 'use: cannot alter mods after first async(...) call');

    // Reconstruct the pipeline to include the new mod. Mods are applied in reverse
    // order of the use() calls that registered them, so that the mods associated with
    // earlier use() calls remain outermost in pipeline call chains.
    var mods = pipeline.mods;
    mods.push(mod);
    pipeline.reset();
    var len = mods.length;
    for (var i = len - 1; i >= 0; --i) {
        var previous = _.mergeProps({}, pipeline);
        var overrides = mods[i](previous);
        _.mergeProps(pipeline, overrides);
    }
}


// Make the built-in mods accessible as properties on the use() function.
Object.defineProperty(use, 'fiberPoolFix', { get: () => use(fiberPoolFix) });
Object.defineProperty(use, 'coroPool', { get: () => use(coroPool) });
use.cpsKeyword = identifier => use(cpsKeyword(identifier));
use.maxSlots = n => use(maxSlots(n));

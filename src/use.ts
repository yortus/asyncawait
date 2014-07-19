import references = require('references');
import _ = require('./util');
import pipeline = require('./pipeline');
import fiberPoolFix = require('./mods/fiberPoolFix');
import coroPool = require('./mods/coroPool');
import continuationOperator = require('./mods/continuationOperator');
import maxConcurrency = require('./mods/maxConcurrency');
import Mod = AsyncAwait.Mod;
export = use;


/** Install the specified mod to alter the global behaviour of asyncawait. */
var use: AsyncAwait.Use = <any> function use(mod: Mod) {

    // Ensure all global mods are install before any async(...) calls are made.
    if (pipeline.isLocked) throw new Error('use: cannot alter mods after first async(...) call');

    //TODO: handle ordering properly - may need to separate builtins from use-added stuff
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
use.continuationOperator = identifier => use(continuationOperator(identifier));
use.maxConcurrency = n => use(maxConcurrency(n));

var assert = require('assert');
var _ = require('./util');
var pipeline = require('./pipeline');
var fiberPoolFix = require('./mods/fiberPoolFix');
var coroPool = require('./mods/coroPool');
var cpsKeyword = require('./mods/cpsKeyword');
var maxSlots = require('./mods/maxSlots');


/** Install the specified mod to alter the global behaviour of asyncawait. */
var use = function use(mod) {
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
};

// Make the built-in mods accessible as properties on the use() function.
Object.defineProperty(use, 'fiberPoolFix', { get: function () {
        return use(fiberPoolFix);
    } });
Object.defineProperty(use, 'coroPool', { get: function () {
        return use(coroPool);
    } });
use.cpsKeyword = function (identifier) {
    return use(cpsKeyword(identifier));
};
use.maxSlots = function (n) {
    return use(maxSlots(n));
};
module.exports = use;
//# sourceMappingURL=use.js.map

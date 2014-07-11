import references = require('references');
import Fiber = require('fibers');
import Mod = AsyncAwait.Mod;
export = fiberPoolFix;


/**
 *  Automatically manages Fiber.poolSize to work around an issue with node-fibers.
 *  Apply this mod when the peak number of concurrently executing fibers (there is
 *  one for each currently executing suspendable function) is likely to exceed 120.
 *  Memory leaks and slowdowns under heavy load is symptomatic of the issue this
 *  mod addresses.
 *  For more details see https://github.com/laverdet/node-fibers/issues/169.
 */
var fiberPoolFix: Mod = (pipeline) => ({
    acquireFiber: body => {
        inc();
        return pipeline.acquireFiber(body);
    },
    releaseFiber: fiber => {
        dec();
        return pipeline.releaseFiber(fiber);
    }
});


/** Increment the number of active fibers. */
function inc() {
    ++_activeFiberCount;
    if (_activeFiberCount >= _fiberPoolSize) {
        _fiberPoolSize += 100;
        Fiber.poolSize = _fiberPoolSize;
    }
}


/** Decrement the number of active fibers. */
function dec() {
    --_activeFiberCount;
}


// Private state.
var _fiberPoolSize = Fiber.poolSize;
var _activeFiberCount = 0;
